import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { signIn } from './sign-in';
import { demoPassword } from '../lib/piezas-schema';
import { CHILD_IDS, DEMO_LESSON_DATE } from '../lib/fixtures';

for (const file of ['.env.local', '.env']) if (!process.env.DEMO_ACCOUNT_SECRET && existsSync(file)) process.loadEnvFile(file);

async function signInAdmin(page: import('@playwright/test').Page) {
  const secret = process.env.DEMO_ACCOUNT_SECRET;
  expect(secret, 'DEMO_ACCOUNT_SECRET must be configured for the test copy').toBeTruthy();
  const email = 'hana.sato@example.test';
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(demoPassword(secret!, email));
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL('/');
}

test('admin dashboard reads missing-field and daily operations data from shared services', async ({ page }) => {
  await signInAdmin(page);
  await page.goto('/admin');
  await expect(page.getByTestId('admin-dashboard')).toBeVisible();
  await expect(page.getByTestId(`incomplete-${CHILD_IDS.owen}`)).toContainText('Signed consent');
  await expect(page.getByTestId(`incomplete-${CHILD_IDS.ella}`)).toContainText('Conditions answer or explicit none');
  await expect(page.getByTestId('admin-count-expected')).toHaveText('6');
  await expect(page.getByTestId('admin-count-checkedIn')).toHaveText('1');
  await expect(page.getByTestId('admin-count-released')).toHaveText('0');
  await expect(page.getByTestId('admin-count-missing')).toHaveText('0');
  await page.getByTestId('admin-lesson-day').selectOption('2026-12-13');
  await expect(page).toHaveURL('/admin?day=2026-12-13');
  await expect(page.getByTestId('admin-count-expected')).toHaveText('0');
  // Profile completion is not lesson-day scoped; only operational counts change.
  await expect(page.getByTestId(`incomplete-${CHILD_IDS.owen}`)).toBeVisible();
  for (const id of ['assign-child-form', 'assign-instructor-form', 'details-child-select', 'admin-audit-link']) {
    await expect(page.getByTestId(id)).toBeVisible();
  }
  await expect(page.getByRole('button', { name: /unavailable/ })).toHaveCount(0);
});

test('Hana sees who is in each group and how full it is', async ({ page }) => {
  await signIn(page, 'hana.sato@example.test');
  await page.goto('/admin');
  await expect(page.getByTestId('group-instructor-grp_14')).toHaveText(/^Instructor: /);
  await expect(page.getByTestId('group-count-grp_09')).toHaveText(/^\d of 6 places$/);
  await expect(page.getByTestId('group-overview')).not.toContainText(/Asthma|diabetes|Tree nuts/i);
});

test('admin access redirects users without the admin role', async ({ page }) => {
  const response = await page.goto('/admin');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/login$/);
});
