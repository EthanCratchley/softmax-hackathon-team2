import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';

if (!process.env.DEMO_PASSWORD && existsSync('.env')) process.loadEnvFile('.env');

test('signed-out visitors land on sign-in, which fits a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const response = await page.goto('/');
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign in');
  await expect(page.getByTestId('current-user')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const id of ['login-email', 'login-password', 'login-submit']) {
    const box = await page.getByTestId(id).boundingBox();
    expect(box!.height, id).toBeGreaterThanOrEqual(48);
  }
});

test('each role signs in and sees only its own authorized summary', async ({ page }) => {
  const password = process.env.DEMO_PASSWORD;
  expect(password, 'DEMO_PASSWORD must be set (in .env) for the sign-in check').toBeTruthy();
  const cases = [
    ['priya.shah@example.test', 'Priya Shah · Parent', '1 linked child(ren) · 1 need information'],
    ['jordan.lee@example.test', 'Jordan Lee · Instructor', 'Group 14 · 3 children · 1 with safety alerts'],
    ['casey.morgan@example.test', 'Casey Morgan · Desk', '6 expected · 1 checked in · 0 released'],
    ['rob.fournier@example.test', 'Rob Fournier · Patrol', '0 open incident(s)'],
    ['hana.sato@example.test', 'Hana Sato · Admin', '4 child profile(s) need information'],
  ];
  for (const [email, who, summary] of cases) {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password!);
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('current-user')).toHaveText(who);
    await expect(page.getByTestId('home-summary')).toHaveText(summary);
    await page.getByTestId('sign-out').click();
    await expect(page).toHaveURL(/\/login$/);
  }
});

test('a wrong password shows an error and no session', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-email').fill('priya.shah@example.test');
  await page.getByTestId('login-password').fill('definitely-wrong');
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('login-error')).toBeVisible();
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});
