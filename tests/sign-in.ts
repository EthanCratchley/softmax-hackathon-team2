import { existsSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';
import { demoPassword } from '../lib/piezas-schema';

for (const file of ['.env.local', '.env']) if (!process.env.DEMO_ACCOUNT_SECRET && existsSync(file)) process.loadEnvFile(file);

/** Signs in through the real login form with the account's derived demo password. */
export async function signIn(page: Page, email: string) {
  const secret = process.env.DEMO_ACCOUNT_SECRET;
  expect(secret, 'DEMO_ACCOUNT_SECRET must be set (in .env) to sign in demo accounts').toBeTruthy();
  await page.context().clearCookies();
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(demoPassword(secret!, email));
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('current-user')).toBeVisible();
}
