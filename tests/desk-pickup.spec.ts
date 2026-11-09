import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { demoPassword } from '../lib/piezas-schema';
import { CHILD_IDS, ADULT_IDS, DEMO_LESSON_DATE } from '../lib/fixtures';

for (const file of ['.env.local', '.env']) if (!process.env.DEMO_ACCOUNT_SECRET && existsSync(file)) process.loadEnvFile(file);

async function signInDesk(page: import('@playwright/test').Page) {
  const secret = process.env.DEMO_ACCOUNT_SECRET;
  expect(secret, 'DEMO_ACCOUNT_SECRET must be configured for the test copy').toBeTruthy();
  const email = 'casey.morgan@example.test';
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(demoPassword(secret!, email));
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL('/');
}

test('pickup page uses the shared service projection and real child IDs', async ({ page }) => {
  await signInDesk(page);
  await page.goto('/desk');
  const rosterStatus = await page.getByTestId(`status-${CHILD_IDS.lily}`).textContent();
  await page.goto(`/desk/children/${CHILD_IDS.lily}?day=${DEMO_LESSON_DATE}`);
  await expect(page.getByTestId('pickup-child-name')).toHaveText('Lily Whitfield');
  await expect(page.getByTestId('pickup-attendance')).toHaveText(rosterStatus!.trim());
  await expect(page.getByTestId(`adult-${ADULT_IDS.lilyFather}`)).toBeVisible();
  await expect(page.getByTestId(`adult-${ADULT_IDS.lilyUncle}`)).toHaveCount(0);
  await expect(page.getByTestId('pickup-page')).not.toContainText(/medical|allerg|diagnos|dosage/i);
  await expect(page.getByTestId('back-to-desk')).toHaveAttribute('href', `/desk?day=${DEMO_LESSON_DATE}`);
});

test('pickup access requires desk sign-in and unknown children are not found', async ({ page }) => {
  const response = await page.goto(`/desk/children/${CHILD_IDS.lily}?day=${DEMO_LESSON_DATE}`);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/login$/);
  await signInDesk(page);
  await page.goto('/desk/children/not-a-real-child?day=2026-12-12');
  // App Router client navigation can return a 200 document while rendering the 404 boundary.
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  await expect(page.getByText('This page could not be found.')).toBeVisible();
});

test('pickup history shows the same service-backed check-in timestamp as the roster', async ({ page }) => {
  await signInDesk(page);
  await page.goto('/desk');
  const rosterTime = page.locator('[data-testid^="check-in-time-"] time').first();
  await expect(rosterTime).toHaveAttribute('datetime', /.+/);
  const checkedInAt = await rosterTime.getAttribute('datetime');
  const timeTestId = await rosterTime.locator('xpath=..').getAttribute('data-testid');
  const childId = timeTestId!.replace(/^check-in-time-/, '');
  const rosterStatus = await page.getByTestId(`status-${childId}`).textContent();
  await page.goto(`/desk/children/${childId}?day=${DEMO_LESSON_DATE}`);
  await expect(page.getByTestId('pickup-attendance')).toHaveText(rosterStatus!.trim());
  await expect(page.getByTestId('pickup-check-in-time')).toHaveAttribute('datetime', checkedInAt!);
});
