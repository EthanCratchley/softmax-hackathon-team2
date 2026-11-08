import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { demoPassword } from '../lib/piezas-schema';
import { CHILD_IDS, DEMO_LESSON_DATE } from '../lib/fixtures';

if (!process.env.DEMO_ACCOUNT_SECRET && existsSync('.env.local')) process.loadEnvFile('.env.local');

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

test('desk roster reads the authenticated shared-service roster for the selected date', async ({ page }) => {
  await signInDesk(page);
  await page.goto('/desk');
  await expect(page.getByTestId('desk-roster')).toBeVisible();
  await expect(page.getByTestId(`child-${CHILD_IDS.owen}`)).toContainText('Owen Parr');
  await expect(page.locator('[data-testid^="check-in-time-"] time').first()).toHaveAttribute('datetime', /.+/);
  await page.getByTestId('roster-search').fill('Okafor-Parr');
  await expect(page.getByTestId(`child-${CHILD_IDS.owen}`)).toBeVisible();
  await expect(page.getByTestId('roster-result-count')).toHaveText('1 of 6 children');
  await page.getByTestId('roster-search').fill('Group 14');
  await page.getByTestId('group-filter').selectOption('Group 14');
  await expect(page.getByTestId('roster-result-count')).toHaveText('3 of 6 children');
  await expect(page.getByTestId('pickup-chd_owen')).toHaveAttribute('href', `/desk/children/${CHILD_IDS.owen}?day=${DEMO_LESSON_DATE}`);
  await page.getByTestId('lesson-day').selectOption('2026-12-13');
  await expect(page).toHaveURL('/desk?day=2026-12-13');
  await expect(page.getByTestId('child-chd_ava')).toHaveCount(0);
});
