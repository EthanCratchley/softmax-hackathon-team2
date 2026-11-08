// piezas-scenario: S-014 v=8c9a3d231c37
// S-014: Medication held at the desk shows without the rest
//   Given a child's medication location is the desk and they also have a recorded condition
//   When desk staff open that child
//   Then they see "holds [medication] for this child" and not the condition
//
import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { demoPassword } from '../../lib/piezas-schema';
import { CHILD_IDS, DEMO_LESSON_DATE } from '../../lib/fixtures';

if (!process.env.DEMO_ACCOUNT_SECRET && existsSync('.env.local')) process.loadEnvFile('.env.local');

test('S-014: the desk shows medication-held status without medication or condition values', async ({ page }) => {
  const secret = process.env.DEMO_ACCOUNT_SECRET;
  expect(secret, 'DEMO_ACCOUNT_SECRET must be configured for the test copy').toBeTruthy();
  const email = 'casey.morgan@example.test';
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(demoPassword(secret!, email));
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL('/');
  await page.goto(`/desk/children/${CHILD_IDS.noor}?day=${DEMO_LESSON_DATE}`);
  await expect(page.getByTestId('medication-held-indicator')).toBeVisible();
  await expect(page.getByTestId('pickup-page')).not.toContainText(/Glucose gel|Type 1 diabetes/i);
});
