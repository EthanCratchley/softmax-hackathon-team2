// Runs against the Piezas TEST copy (PIEZAS_TEST_API_KEY) — never the live app.
// Proves records written through the service logic persist in Piezas and that
// append-only records cannot be edited. Re-seeds the test copy afterwards.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { Piezas } from '@piezas/sdk';
import { expect, test } from '@playwright/test';
import type { VerifiedUser } from '../../lib/domain/types';
import { ADULT_IDS, CHILD_IDS, DEMO_LESSON_DATE, USER_IDS } from '../../lib/fixtures';
import { COLLECTIONS, entityDefinitionsFor, slugsFor, type Collection } from '../../lib/piezas-schema';
import { createMockServices } from '../../lib/services/mock';
import { commitState, loadState, type Clients } from '../../lib/services/record-store';

if (!process.env.PIEZAS_TEST_API_KEY && existsSync('.env')) process.loadEnvFile('.env');

test.describe.configure({ mode: 'serial' });

let clients: Clients;

test.beforeAll(async () => {
  const apiKey = process.env.PIEZAS_TEST_API_KEY;
  expect(apiKey, 'PIEZAS_TEST_API_KEY must be set (run: npx piezas test --setup)').toBeTruthy();
  const defined = await new Piezas({ apiKey, apiBaseUrl: process.env.PIEZAS_API_URL }).defineEntities(entityDefinitionsFor(apiKey!));
  clients = Object.fromEntries(Object.entries(slugsFor(apiKey!)).map(([name, slug]) => [name, defined[slug]])) as Clients;
});

test.afterAll(() => {
  execFileSync('npx', ['tsx', 'scripts/seed.ts'], { stdio: 'ignore', env: process.env });
});

const parentAva = (users: { id: string }[]): VerifiedUser => ({ ...(users.find((u) => u.id === USER_IDS.parentAva) as VerifiedUser), __verified: true });

test("a parent's allergy update persists in Piezas and reaches the assigned instructor", async () => {
  const before = await loadState(clients);
  expect(before.state.children.map((c) => c.id)).toContain(CHILD_IDS.ava);

  const result = await createMockServices(before.state).updateChildProfile(
    CHILD_IDS.ava,
    { allergies: ['Tree nuts'], safetyInstructions: 'Give EpiPen, then call patrol.' },
    parentAva(before.state.users),
  );
  expect(result.ok).toBe(true);
  await commitState(clients, before);

  const after = await loadState(clients);
  const medical = after.state.medical.find((m) => m.childId === CHILD_IDS.ava)!;
  expect(medical).toMatchObject({ allergies: ['Tree nuts'], updatedBy: USER_IDS.parentAva });
  expect(after.state.audit.some((a) => a.action === 'medical_updated' && a.entityId === CHILD_IDS.ava)).toBe(true);

  const instructor = { ...after.state.users.find((u) => u.id === USER_IDS.instructorGroup14)!, __verified: true as const };
  const roster = await createMockServices(after.state).getInstructorRoster(DEMO_LESSON_DATE, instructor);
  expect(roster.ok && roster.data.flatMap((g) => g.children).find((c) => c.childId === CHILD_IDS.ava)?.alerts[0]?.summary).toBe('Allergy: Tree nuts');
});

test('append-only pickup records cannot be edited or deleted', async () => {
  const loaded = await loadState(clients);
  loaded.state.pickups.push({
    id: 'pkp_integration',
    childId: CHILD_IDS.lily,
    lessonDate: DEMO_LESSON_DATE,
    authorizedAdultId: ADULT_IDS.lilyFather,
    adultNameSnapshot: 'Tom Whitfield',
    verifiedByUserId: USER_IDS.desk,
    idChecked: true,
    releasedAt: '2026-12-12T15:30:00-07:00',
  });
  await commitState(clients, loaded);

  const edit = await loadState(clients);
  edit.state.pickups.find((p) => p.id === 'pkp_integration')!.adultNameSnapshot = 'Someone Else';
  await expect(commitState(clients, edit)).rejects.toThrow('Refused to edit append-only pickups record pkp_integration');

  const remove = await loadState(clients);
  remove.state.pickups = remove.state.pickups.filter((p) => p.id !== 'pkp_integration');
  await expect(commitState(clients, remove)).rejects.toThrow('Refused to delete append-only pickups record pkp_integration');

  const final = await loadState(clients);
  expect(final.state.pickups.find((p) => p.id === 'pkp_integration')?.adultNameSnapshot).toBe('Tom Whitfield');
});

test('every collection round-trips: what is loaded equals what was seeded', async () => {
  const { state } = await loadState(clients);
  for (const name of Object.keys(COLLECTIONS) as Collection[]) expect(Array.isArray(state[name]), name).toBe(true);
  expect(state.users).toHaveLength(9);
  expect(state.users.every((u) => !('piezasUserId' in u))).toBe(true);
});
