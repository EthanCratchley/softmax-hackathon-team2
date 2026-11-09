import { readFile } from 'node:fs/promises';
import { piezas, all } from './store';
import { AppError, allow, type Identity } from './auth';
import { seedGroups } from './seed-data';
import type { Member } from './model';
import { practiceStorage, practiceContext } from './practice-context';

type Session = { generation: string; at: string; actor: string };
const schema = { fields: { key: { type: 'text' as const, required: true }, payload: { type: 'longtext' as const, required: true } } };

async function control(namespace: string) {
  const slug = `practice_${namespace}_sessions`;
  return (await piezas.defineEntities({ [slug]: schema }))[slug];
}

// No fallback to a live app, browser flag, or a key's textual prefix.
export async function withPractice<T>(work: () => Promise<T>): Promise<T> {
  if (process.env.SAFETY_PRACTICE_ENABLED !== 'true') return work();
  const expected = process.env.SAFETY_PRACTICE_APP_ID;
  const namespace = process.env.SAFETY_PRACTICE_NAMESPACE;
  if (!expected || !namespace || !/^[a-z][a-z0-9_]{15,39}$/.test(namespace) ||
      !process.env.PIEZAS_TEST_API_KEY || process.env.PIEZAS_API_KEY !== process.env.PIEZAS_TEST_API_KEY) {
    throw new AppError('Practice setup is incomplete. Ask the app owner to check the isolated test environment.', 503);
  }
  const manifest = JSON.parse(await readFile('piezas.manifest.json', 'utf8'));
  const verified = await piezas.whoami();
  if (verified.authError || verified.keyMode !== 'test' || verified.keyAppId !== expected ||
      verified.appId !== expected || expected === manifest.deploy?.appId) {
    throw new AppError('Practice setup does not match a verified isolated test app.', 503);
  }
  // Authentication is still checked by the caller. No normal workflow record
  // is overwritten; the namespace controls only practice workflow records.
  const sessions = await control(namespace);
  const history: Session[] = [];
  for (let offset = 0;; offset += 100) {
    const page = await sessions.list({ limit: 100, offset });
    history.push(...page.data.map(r => JSON.parse(String(r.data.payload)) as Session));
    if (page.data.length < 100) break;
  }
  history.sort((a, b) => b.at.localeCompare(a.at) || b.generation.localeCompare(a.generation));
  const members = await all<Member>('member');
  const groups = seedGroups.map(g => {
    const member = members.find(m => m.id === `member-${g.id === 'group-1' ? 'instructor' : 'instructor-other'}` && m.role === 'instructor');
    if (!member) throw new AppError('Practice needs the original synthetic instructor accounts.', 503);
    return { ...g, instructorId: member.userId, instructor: member.name };
  });
  return practiceStorage.run({ namespace, generation: history[0]?.generation ?? 'initial', groups }, work);
}

export async function resetPractice(who: Identity, confirmation: unknown, audit: (who: Identity, action: string, resource: string, reason?: string) => Promise<void>) {
  allow(who, ['instructor', 'patrol']);
  const context = practiceContext();
  if (!context) throw new AppError('Practice reset is unavailable here.', 404);
  if (confirmation !== 'RESET PRACTICE') throw new AppError('Confirm that you want a fresh practice session.');
  const generation = crypto.randomUUID();
  const session: Session = { generation, at: new Date().toISOString(), actor: who.userId };
  // Audit must succeed before activating a fresh session. Old records remain.
  await audit(who, 'practice.reset', generation, `Practice ${context.namespace}; previous session ${context.generation}`);
  await (await control(context.namespace)).create({ title: generation, data: { key: generation, payload: JSON.stringify(session) } });
  return { ok: true, practiceSession: generation };
}
