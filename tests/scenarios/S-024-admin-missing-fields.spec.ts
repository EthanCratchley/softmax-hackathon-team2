import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { demoPassword } from '../../lib/piezas-schema';
import { CHILD_IDS } from '../../lib/fixtures';

if (!process.env.DEMO_ACCOUNT_SECRET && existsSync('.env.local')) process.loadEnvFile('.env.local');

test('S-024: Hana sees missing field names from the authorized admin service', async ({ page }) => {
  const secret = process.env.DEMO_ACCOUNT_SECRET;
  expect(secret, 'DEMO_ACCOUNT_SECRET must be configured for the test copy').toBeTruthy();
  const email = 'hana.sato@example.test';
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(demoPassword(secret!, email));
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL('/');
  await page.goto('/admin');
  await expect(page.getByTestId(`incomplete-${CHILD_IDS.owen}`)).toContainText('Signed consent');
  await expect(page.getByTestId(`incomplete-${CHILD_IDS.ella}`)).toContainText('Conditions answer or explicit none');
  // Field labels are intentionally visible. Actual medical values must not be.
  await expect(page.getByTestId('admin-dashboard')).not.toContainText(/Asthma|Type 1 diabetes|Glucose gel|Blue reliever inhaler|2 puffs/i);
});
