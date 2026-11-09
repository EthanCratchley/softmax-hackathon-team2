import { test, expect } from '@playwright/test';
import { loginPractice, practiceView, practicePost, resetFromScreen, sdk } from '../practice-helpers';

test('S-042: practice reset is repeatable and preserves history and shared profiles', async ({ page }) => {
  // No import of the destructive shared test fixture and no collection deletes.
  const schema = { fields: { key: { type: 'text' as const, required: true }, payload: { type: 'longtext' as const, required: true } } };
  const entities = Object.fromEntries((await sdk.entities.listSchemas()).filter(s=>s.slug.startsWith('safety_')).map(s=>[s.slug,sdk.entities.ofType(s.id,s.slug)]));
  const snapshot = async () => {
    const result: Record<string, unknown[]> = {};
    for (const [name, entity] of Object.entries(entities)) {
      const records = [];
      for (let offset = 0;; offset += 100) {
        const batch = await entity.list({ limit: 100, offset });
        records.push(...batch.data.map(r => ({ id: r.id, data: r.data })));
        if (batch.data.length < 100) break;
      }
      result[name] = records.sort((a, b) => a.id.localeCompare(b.id));
    }
    return result;
  };
  const before = await snapshot();
  await page.setViewportSize({ width: 375, height: 812 });
  await loginPractice(page);
  const cookies = await page.context().cookies();
  expect(cookies.some(c=>c.name===`kestrel-practice-${process.env.SAFETY_PRACTICE_NAMESPACE}`&&c.httpOnly)).toBe(true);
  expect(cookies.some(c=>c.name==='kestrel-session')).toBe(false);
  await resetFromScreen(page);
  const session = await practiceView(page);
  await page.getByTestId('all-here').click();
  await expect(page.getByTestId('headcount-confirmed')).toBeVisible();
  await page.getByTestId('report-child-owen').click();
  await page.getByTestId('place').fill('Practice chairlift');
  await page.getByTestId('clothing').fill('Blue jacket');
  await page.getByTestId('helmet').fill('White helmet');
  await page.getByTestId('submit-report').click();
  await expect(page.getByTestId('saved')).toBeVisible();
  await loginPractice(page, 'patrol');
  await page.getByRole('link', { name: 'Open incident', exact: true }).click();
  await page.getByTestId('action-note').fill('Search the practice trail');
  await page.getByTestId('save-action').click();
  await expect(page.getByTestId('emergency-packet')).toContainText('Search the practice trail');
  const incidentId = (await practiceView(page)).incidents[0].id;
  await resetFromScreen(page);
  await expect(page.getByRole('link', { name: 'Open incident', exact: true })).toHaveCount(0);
  expect((await practiceView(page)).incidents).toHaveLength(0);
  const stale = await practicePost(page, { action: 'reset-practice', confirmation: 'RESET PRACTICE', practiceSession: session.practiceSession });
  expect(stale.status()).toBe(409);
  const current = await practiceView(page);
  expect((await practicePost(page, { action: 'packet', incidentId, practiceSession: current.practiceSession })).status()).toBe(404);
  await resetFromScreen(page);
  expect((await practiceView(page)).incidents).toHaveLength(0);
  await loginPractice(page);
  await expect(page.getByTestId('headcount-confirmed')).toHaveCount(0);
  await expect(page.getByTestId('child-child-ava')).toBeVisible();
  await expect(page.getByTestId('child-child-owen')).toBeVisible();
  await expect(page.getByTestId('child-child-lily')).toHaveCount(0);
  expect(await snapshot()).toEqual(before);
  // Old incident, note, reset, and audit records are retained in the private namespace.
  const namespace = process.env.SAFETY_PRACTICE_NAMESPACE!;
  const history = await sdk.defineEntities({ [`practice_${namespace}_incident`]: schema, [`practice_${namespace}_revision`]: schema, [`practice_${namespace}_audit`]: schema });
  const records = async (suffix: string) => (await history[`practice_${namespace}_${suffix}`].list({ limit: 100 })).data;
  expect((await records('incident')).some(r => String(r.data.payload).includes(incidentId))).toBe(true);
  expect((await records('revision')).some(r => String(r.data.payload).includes('Search the practice trail'))).toBe(true);
  expect((await records('audit')).filter(r => String(r.data.payload).includes('practice.reset')).length).toBeGreaterThanOrEqual(3);
});
