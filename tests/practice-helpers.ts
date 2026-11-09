import { expect, type Page } from '@playwright/test';
import { loadEnvFile } from 'node:process';
import { Piezas } from '@piezas/sdk';

loadEnvFile('.env.test-users');
if (!process.env.PIEZAS_TEST_API_KEY) throw new Error('Test key required.');
export const sdk = new Piezas({ apiKey: process.env.PIEZAS_TEST_API_KEY, apiBaseUrl: process.env.PIEZAS_API_URL });
export async function loginPractice(page: Page, role = 'instructor') {
  await page.context().clearCookies();
  await page.goto('/login');
  await page.getByTestId('email').fill(`${role}@example.test`);
  await page.getByTestId('password').fill(process.env.SAFETY_DEMO_PASSWORD!);
  await page.getByTestId('sign-in').click();
  await expect(page.getByTestId('reset-practice')).toBeVisible();
}
export async function practiceView(page: Page) {
  const response = await page.request.get('/api/safety?day=2026-12-12');
  expect(response.ok()).toBe(true);
  return response.json();
}
export async function practicePost(page: Page, data: Record<string, unknown>) {
  return page.request.post(new URL('/api/safety', page.url()).href, { data, headers: { origin: new URL(page.url()).origin } });
}
export async function resetFromScreen(page: Page) {
  const previous = (await practiceView(page)).practiceSession;
  await page.getByTestId('reset-practice').click();
  await page.getByTestId('confirm-reset-practice').click();
  await expect(page.getByTestId('saved')).toContainText('Practice session reset');
  await expect.poll(async () => (await practiceView(page)).practiceSession).not.toBe(previous);
  return previous;
}
