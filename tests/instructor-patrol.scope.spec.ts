import { test, expect, login, setClock, post, db, updateChild } from './safety-fixtures';
import type { Group, Incident } from '../lib/safety/model';

test('instructor headcounts pause during lunch in the scoped build', async ({ page }) => {
  await setClock('12:00');
  await login(page, 'instructor');
  await expect(page.getByTestId('headcount-paused')).toBeVisible();
  await expect(page.getByTestId('headcount-panel')).toHaveCount(0);
  const response = await post(page, { action: 'headcount', groupId: 'group-1' });
  expect(response.status()).toBe(400);
});

for (const role of ['instructor', 'patrol']) {
  test(`${role} keeps the selected lesson day through reports, reloads, and incident navigation`, async ({ page }) => {
    const selectedDay = '2026-12-13';
    await login(page, role);
    const group = await db.get<Group>('group', 'group-1');
    await db.put('group', { ...group, day: selectedDay });
    await updateChild('child-owen', { day: selectedDay });
    await page.getByTestId('lesson-day').fill(selectedDay);
    await expect(page).toHaveURL(new RegExp(`day=${selectedDay}`));
    const child = page.getByTestId('child-child-owen');
    await expect(child).toBeVisible();
    await child.getByRole('link', { name: role === 'instructor' ? 'Report missing' : 'Open incident from radio call' }).click();
    await expect(page.getByTestId('missing-report-form')).toBeVisible();
    await expect(page.getByTestId('lesson-day')).toHaveValue(selectedDay);
    await page.reload();
    await expect(page.getByTestId('last-seen-at')).toHaveValue(`${selectedDay}T14:30`);
    await page.getByTestId('place').fill('Pigeon chair');
    await page.getByTestId('clothing').fill('Blue jacket');
    await page.getByTestId('helmet').fill('White helmet');
    await page.getByTestId('submit-report').click();
    await expect(page.getByTestId('saved')).toBeVisible();
    const saved = (await db.all<Incident>('incident')).find(i => i.childId === 'child-owen');
    expect(saved?.day).toBe(selectedDay);
    expect(saved?.lastSeenAt).toBe(`${selectedDay}T14:30`);
    await page.getByRole('link', { name: 'My workspace' }).click();
    await expect(page.getByTestId('child-child-owen')).toBeVisible();
    await expect(page.getByTestId('lesson-day')).toHaveValue(selectedDay);
    if (role === 'instructor') {
      await login(page, 'patrol');
      await page.getByTestId('lesson-day').fill(selectedDay);
    }
    await page.getByRole('link', { name: /Open incident/ }).first().click();
    await expect(page.getByTestId('emergency-packet')).toContainText(`${selectedDay}T14:30`);
    await expect(page.getByTestId('lesson-day')).toHaveValue(selectedDay);
    await page.reload();
    await expect(page.getByTestId('emergency-packet')).toContainText('Pigeon chair');
    await page.getByRole('link', { name: 'My workspace' }).click();
    await expect(page.getByTestId('child-child-owen')).toBeVisible();
    await expect(page.getByTestId('lesson-day')).toHaveValue(selectedDay);
  });
}

test('other team roles see an integration notice and cannot use scoped services', async ({ page }) => {
  for (const role of ['parent', 'desk', 'admin']) {
    await page.context().clearCookies();
    await page.goto('/login');
    await page.getByTestId('email').fill(`${role}@example.test`);
    await page.getByTestId('password').fill(process.env.SAFETY_DEMO_PASSWORD!);
    await page.getByTestId('sign-in').click();
    await expect(page.getByRole('heading', { name: 'This workspace is coming from your team.' })).toBeVisible();
    expect((await page.request.get('/api/safety?day=2026-12-12')).status()).toBe(404);
    expect((await post(page, { action: 'packet', incidentId: 'anything' })).status()).toBe(404);
  }
});
