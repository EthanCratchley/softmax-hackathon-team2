// Loads the synthetic demo dataset (lib/fixtures.ts) into Piezas.
//
//   npx tsx scripts/seed.ts                 → TEST copy (PIEZAS_TEST_API_KEY).
//       Resets every Kestrel record to the fixtures, so each check starts
//       from the same state. `piezas test` runs this before every check.
//   SEED_TARGET=live npx tsx scripts/seed.ts → LIVE app (PIEZAS_API_KEY).
//       Only creates what is missing; never changes or deletes live records.
//
// Every name, phone, address and email is invented (.test addresses never
// receive mail). Each account's password is derived from DEMO_ACCOUNT_SECRET;
// print them with `npm run demo:accounts`.
import { Piezas, PiezasError, type EntityClient, type EntityRecord } from '@piezas/sdk';
import { createDemoState } from '../lib/fixtures';
import { COLLECTIONS, demoPassword, ENTITY_DEFINITIONS, keyOf, type AccountPayload, type Collection } from '../lib/piezas-schema';

const live = process.env.SEED_TARGET === 'live';
const apiKey = live ? process.env.PIEZAS_API_KEY : process.env.PIEZAS_TEST_API_KEY;
const secret = process.env.DEMO_ACCOUNT_SECRET;
if (!apiKey) {
  console.error(live ? 'PIEZAS_API_KEY is missing.' : 'No test copy of the app yet (PIEZAS_TEST_API_KEY is missing). Run: piezas test --setup');
  process.exit(1);
}
if (!secret) {
  console.error('DEMO_ACCOUNT_SECRET is missing from .env.');
  process.exit(1);
}
const piezas = new Piezas({ apiKey, apiBaseUrl: process.env.PIEZAS_API_URL });

/** Creates the sign-in account if needed, switches it on, and returns its users-service id. */
async function ensureUser(email: string, password: string): Promise<string> {
  await piezas.users.signUp({ email, password }).catch((error: unknown) => {
    if (error instanceof PiezasError && error.code === 'conflict') return;
    throw error;
  });
  // Sign-up for an existing email can report success with a placeholder id
  // (so it does not reveal which emails exist); the listing is authoritative.
  const user = (await piezas.users.listUsers({ email })).users.find((u) => u.email === email);
  if (!user) throw new Error(`Could not create or find ${email}`);
  if (user.status !== 'active') await piezas.users.updateUser(user.id, { status: 'active' });
  return user.id;
}

async function listAll(client: EntityClient): Promise<EntityRecord[]> {
  const all: EntityRecord[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await client.list({ limit: 100, offset });
    all.push(...page.data);
    if (page.data.length < 100) return all;
  }
}

async function syncCollection(name: Collection, client: EntityClient, desired: object[]) {
  const existing = new Map((await listAll(client)).map((r) => [String(r.data.key ?? r.title), r]));
  const wanted = new Set<string>();
  for (const item of desired) {
    const key = keyOf(name, item);
    wanted.add(key);
    const payload = JSON.stringify(item);
    const record = existing.get(key);
    if (!record) await client.create({ title: key, data: { key, payload } });
    else if (!live && record.data.payload !== payload) await client.update(record.id, { data: { key, payload } });
  }
  if (live) return;
  for (const [key, record] of existing) if (!wanted.has(key)) await client.delete(record.id);
}

export async function seed() {
  await piezas.users.configurePolicy({ requireEmailVerification: false });
  const state = createDemoState();

  const accounts: AccountPayload[] = [];
  for (const user of state.users)
    accounts.push({ ...user, piezasUserId: await ensureUser(user.email, demoPassword(secret!, user.email)) });

  // The `piezas test` harness's own sign-in person (no app role).
  const testEmail = process.env.PIEZAS_TEST_USER_EMAIL;
  const testPassword = process.env.PIEZAS_TEST_USER_PASSWORD;
  if (!live && testEmail && testPassword) await ensureUser(testEmail, testPassword);

  const clients = await piezas.defineEntities(ENTITY_DEFINITIONS);
  for (const [name, slug] of Object.entries(COLLECTIONS) as [Collection, (typeof COLLECTIONS)[Collection]][]) {
    await syncCollection(name, clients[slug], name === 'users' ? accounts : (state[name] as object[]));
  }
}

seed().then(
  () => console.log(live ? 'live demo data ready (missing records created)' : 'test information ready'),
  (error) => {
    console.error(error?.message ?? error);
    process.exit(1);
  },
);
