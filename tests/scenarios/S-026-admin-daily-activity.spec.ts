import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { demoPassword } from '../../lib/piezas-schema';
import { DEMO_LESSON_DATE } from '../../lib/fixtures';

if (!process.env.DEMO_ACCOUNT_SECRET && existsSync('.env.local')) process.loadEnvFile('.env.local');

test('S-026: Hana sees daily counts from the shared operations snapshot', async ({ page }) => {
  const secret = process.env.DEMO_ACCOUNT_SECRET;
  expect(secret, 'DEMO_ACCOUNT_SECRET must be configured for the test copy').toBeTruthy();
  const email = 'hana.sato@example.test';
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(demoPassword(secret!, email));
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL('/');
  await page.goto(`/admin?day=${DEMO_LESSON_DATE}`);
  await expect(page.getByTestId('admin-count-expected')).toHaveText('6');
  await expect(page.getByTestId('admin-count-checkedIn')).toHaveText('1');
  await expect(page.getByTestId('admin-count-released')).toHaveText('0');
  await expect(page.getByTestId('admin-count-missing')).toHaveText('0');
  await page.getByTestId('admin-lesson-day').selectOption('2026-12-13');
  await expect(page.getByTestId('admin-count-expected')).toHaveText('0');
});
