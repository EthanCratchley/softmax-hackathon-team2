import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { demoPassword } from '../../lib/piezas-schema';

if (!process.env.DEMO_ACCOUNT_SECRET && existsSync('.env.local')) process.loadEnvFile('.env.local');

test('S-029: protected child detail access is not exposed before its service workflow is connected', async ({ page }) => {
  const secret = process.env.DEMO_ACCOUNT_SECRET;
  expect(secret, 'DEMO_ACCOUNT_SECRET must be configured for the test copy').toBeTruthy();
  const email = 'hana.sato@example.test';
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(demoPassword(secret!, email));
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL('/');
  await page.goto('/admin');
  await expect(page.getByRole('button', { name: 'Open protected child details — unavailable' })).toBeDisabled();
  await expect(page.getByTestId('incomplete-profiles')).not.toContainText(/allergy value|diagnosis|medication value/i);
});
