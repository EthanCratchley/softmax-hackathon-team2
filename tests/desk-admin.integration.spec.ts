import { existsSync } from 'node:fs';
import { expect, test } from './scenario-test';
import { demoPassword } from '../lib/piezas-schema';
import { ADULT_IDS, CHILD_IDS, DEMO_LESSON_DATE } from '../lib/fixtures';

for (const file of ['.env.local', '.env']) if (!process.env.DEMO_ACCOUNT_SECRET && existsSync(file)) process.loadEnvFile(file);
test.describe.configure({ mode: 'serial' });

async function signIn(page: import('@playwright/test').Page, email: string) {
  const secret = process.env.DEMO_ACCOUNT_SECRET;
  expect(secret, 'DEMO_ACCOUNT_SECRET must be configured for the test copy').toBeTruthy();
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(demoPassword(secret!, email));
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL('/');
}

test('desk mutations are service-validated and appear in the roster and admin snapshot', async ({ browser }) => {
  const deskContext = await browser.newContext();
  const deskPage = await deskContext.newPage();
  await signIn(deskPage, 'casey.morgan@example.test');

  await deskPage.goto(`/desk/children/${CHILD_IDS.lily}?day=${DEMO_LESSON_DATE}`);
  await expect(deskPage.getByTestId('adult-' + ADULT_IDS.lilyUncle)).toHaveCount(0);
  await deskPage.getByTestId('denial-name').fill('Mark Whitfield');
  await deskPage.getByTestId('denial-reason').fill('Not on the active authorized pickup list.');
  await deskPage.getByTestId('record-denial').click();
  await expect(deskPage.getByTestId('pickup-action-message')).toHaveText('Denied pickup attempt recorded.');

  await deskPage.getByTestId(`adult-${ADULT_IDS.lilyFather}`).check();
  await expect(deskPage.getByTestId('release-child')).toBeDisabled();
  await deskPage.getByTestId('id-confirmation').check();
  await deskPage.getByTestId('release-child').click();
  await expect(deskPage.getByTestId('pickup-action-message')).toContainText('Released to Tom Whitfield.');
  await expect(deskPage.getByTestId('pickup-attendance')).toHaveText('Released');
  await expect(deskPage.getByTestId('release-child')).toBeDisabled();

  await deskPage.goto(`/desk/children/${CHILD_IDS.ava}?day=${DEMO_LESSON_DATE}`);
  await deskPage.getByTestId('bib-number').fill('51');
  await deskPage.getByTestId('check-in-child').click();
  await expect(deskPage.getByTestId('pickup-action-message')).toContainText('Checked in Ava Shah.');
  await expect(deskPage.getByTestId('pickup-attendance')).toHaveText('Checked in');
  await deskPage.goto(`/desk?day=${DEMO_LESSON_DATE}`);
  await expect(deskPage.getByTestId(`status-${CHILD_IDS.ava}`)).toHaveText('Checked in');
  await expect(deskPage.getByTestId(`status-${CHILD_IDS.lily}`)).toHaveText('Released');

  const adminPage = await (await browser.newContext()).newPage();
  await signIn(adminPage, 'hana.sato@example.test');
  await adminPage.goto(`/admin?day=${DEMO_LESSON_DATE}`);
  await expect(adminPage.getByTestId('admin-count-expected')).toHaveText('6');
  await expect(adminPage.getByTestId('admin-count-checkedIn')).toHaveText('2');
  await expect(adminPage.getByTestId('admin-count-released')).toHaveText('1');
  await expect(adminPage.getByTestId('admin-denials')).toContainText('Mark Whitfield');
  await expect(adminPage.getByTestId('admin-denials')).toContainText('Lily Whitfield');

  await adminPage.context().close();
  await deskContext.close();
});
