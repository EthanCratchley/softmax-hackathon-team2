// piezas-scenario: S-012 v=8fc3880dbab4
// S-012: An unlisted adult is blocked
//   Given Mark Whitfield is not on Lily's list
//   When he asks to collect her and desk staff record the denial
//   Then the screen says release is blocked and whom to contact, the denial is logged, and no pickup record exists
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { expect, test } from '@playwright/test';
import { ADULT_IDS, CHILD_IDS, DEMO_LESSON_DATE } from '../../lib/fixtures';
import { signIn } from '../sign-in';

test('S-012: an unlisted adult is blocked, the denial is logged, and no release happens', async ({ page }) => {
  await signIn(page, 'casey.morgan@example.test');
  await page.goto(`/desk/children/${CHILD_IDS.lily}?day=${DEMO_LESSON_DATE}`);
  // Mark is on file but not active, so he cannot be chosen.
  await expect(page.getByTestId(`adult-${ADULT_IDS.lilyUncle}`)).toHaveCount(0);
  await expect(page.getByTestId('pickup-page')).toContainText('Release is blocked. Contact an authorized parent or Hana.');

  await page.getByTestId('denial-name').fill('Mark Whitfield');
  await page.getByTestId('denial-reason').fill('Not on the active pickup list');
  await page.getByTestId('record-denial').click();
  await expect(page.getByTestId('pickup-action-message')).toHaveText('Denied pickup attempt recorded.');
  await expect(page.getByTestId('release-record')).toHaveCount(0);
  await expect(page.getByTestId('pickup-attendance')).not.toHaveText('Released');

  await signIn(page, 'hana.sato@example.test');
  await page.goto(`/admin?day=${DEMO_LESSON_DATE}`);
  await expect(page.getByTestId('admin-denials')).toContainText('Attempted pickup: Mark Whitfield');
});
