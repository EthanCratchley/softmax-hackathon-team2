// piezas-scenario: S-044 v=3138313a5741
import { existsSync } from 'node:fs';
import { expect, test, type Page } from '../scenario-test';
import { demoPassword } from '../../lib/piezas-schema';

if (!process.env.DEMO_ACCOUNT_SECRET && existsSync('.env')) process.loadEnvFile('.env');

async function signIn(page: Page, email: string) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(demoPassword(process.env.DEMO_ACCOUNT_SECRET!, email));
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('current-user')).toBeVisible();
}

async function signOut(page: Page) {
  await page.getByTestId('sign-out').click();
  await expect(page).toHaveURL(/\/login$/);
}

test('S-044: Desk verifies a lesson pass with a safe fallback', async ({ page }) => {
  // This journey signs in as two roles, redeems two single-use passes, then
  // signs back in as the parent to confirm the saved activity history.
  test.setTimeout(90_000);
  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent');
  await page.getByRole('link', { name: /Open Ava.*profile/ }).click();
  const dropoffCode = (await page.getByTestId('dropoff-pass-code').innerText()).replace(/\s/g, '');
  await signOut(page);

  await signIn(page, 'casey.morgan@example.test');
  await page.goto('/desk/scan');
  await page.getByTestId('pass-input').fill(dropoffCode);
  await page.getByTestId('pass-lookup').click();
  await expect(page.getByTestId('scan-result')).toContainText('Ava Shah · Drop-off');
  await page.getByTestId('pass-bib-number').fill('7');
  await page.getByTestId('pass-redeem').click();
  await expect(page.getByTestId('desk-notice')).toHaveText('Drop-off recorded.');
  await signOut(page);

  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent');
  await page.getByRole('link', { name: /Open Ava.*profile/ }).click();
  await page.getByRole('button', { name: 'Pick-up', exact: true }).click();
  const pickupCode = (await page.getByTestId('pickup-pass-code').innerText()).replace(/\s/g, '');
  await signOut(page);

  await signIn(page, 'casey.morgan@example.test');
  await page.goto('/desk/scan');
  await page.getByTestId('pass-input').fill(pickupCode);
  await page.getByTestId('pass-lookup').click();
  await expect(page.getByTestId('scan-result')).toContainText('Ava Shah · Pick-up · Priya Shah');
  await expect(page.getByTestId('pass-authorized-adult')).toContainText('Priya Shah');
  await expect(page.getByTestId('pass-authorized-adult')).toContainText('active list');
  const redeem = page.getByTestId('pass-redeem');
  await expect(redeem).toBeDisabled();
  await page.getByTestId('pass-id-check').check();
  await expect(redeem).toBeEnabled();
  await redeem.click();
  await expect(page.getByTestId('desk-notice')).toHaveText('Pick-up recorded for Priya Shah.');

  await signOut(page);
  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent');
  await page.getByRole('link', { name: /Open Ava.*profile/ }).click();
  await expect(page.getByTestId('journey-panel')).toContainText('Picked up');
  await expect(page.getByTestId('activity-list').getByText('Dropped off')).toBeVisible();
  await expect(page.getByTestId('activity-list').getByText('Picked up')).toBeVisible();
});
