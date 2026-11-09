import { test, expect } from '@playwright/test';
import { loginPractice, practicePost, practiceView } from '../practice-helpers';
import { spawn } from 'node:child_process';

test('S-043: practice reset requires sign-in, a permitted role, origin, confirmation, and current session', async ({ page }) => {
  await page.goto('/login');
  expect((await practicePost(page, { action: 'reset-practice', confirmation: 'RESET PRACTICE' })).status()).toBe(401);
  await loginPractice(page);
  const before = await practiceView(page);
  expect((await practicePost(page, { action: 'reset-practice', practiceSession: before.practiceSession })).status()).toBe(400);
  expect((await practicePost(page, { action: 'reset-practice', confirmation: 'RESET PRACTICE', practiceSession: 'old' })).status()).toBe(409);
  expect((await page.request.post('/api/safety', { data: { action: 'reset-practice' }, headers: { origin: 'https://unrelated.invalid' } })).status()).toBe(403);
  expect((await practiceView(page)).practiceSession).toBe(before.practiceSession);
  expect((await practicePost(page, { action: 'medical', childId: 'child-lily', practiceSession: before.practiceSession })).status()).toBe(404);
  await page.context().clearCookies();
  await page.goto('/login');
  await page.getByTestId('email').fill('parent@example.test');
  await page.getByTestId('password').fill(process.env.SAFETY_DEMO_PASSWORD!);
  await page.getByTestId('sign-in').click();
  await expect(page.getByRole('heading', { name: 'This workspace is coming from your team.' })).toBeVisible();
  expect((await practicePost(page, { action: 'reset-practice', confirmation: 'RESET PRACTICE', practiceSession: before.practiceSession })).status()).toBe(404);
});

for (const mode of ['disabled', 'mismatched'] as const) {
  test(`S-043: reset stays unavailable when practice is ${mode}`, async ({ page }) => {
    const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--port', '3103'], {
      windowsHide: true, stdio: 'ignore',
      env: { ...process.env, PIEZAS_API_KEY: process.env.PIEZAS_TEST_API_KEY!, SAFETY_PRACTICE_ENABLED: mode === 'disabled' ? 'false' : 'true', SAFETY_PRACTICE_APP_ID: '00000000-0000-0000-0000-000000000000' },
    });
    try {
      await expect.poll(async () => { try { return (await page.request.get('http://localhost:3103/login')).status(); } catch { return 0; } }).toBe(200);
      await page.goto('http://localhost:3103/login');
      await page.getByTestId('email').fill('patrol@example.test');
      await page.getByTestId('password').fill(process.env.SAFETY_DEMO_PASSWORD!);
      await page.getByTestId('sign-in').click();
      if (mode === 'disabled') await expect(page.getByTestId('child-child-owen')).toBeVisible();
      else await expect(page.getByTestId('error')).toContainText('does not match a verified isolated test app');
      await expect(page.getByTestId('reset-practice')).toHaveCount(0);
      expect((await practicePost(page, { action: 'reset-practice', confirmation: 'RESET PRACTICE' })).status()).toBe(mode === 'disabled' ? 404 : 503);
    } finally {
      const ended = new Promise<void>(resolve => server.once('exit', () => resolve()));
      server.kill(); await ended;
    }
  });
}
