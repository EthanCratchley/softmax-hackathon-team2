// piezas-scenario: S-016 v=4062b5be3c95
// S-016: Desk reports for an instructor with a dead phone
//   Given an instructor radios the desk that Owen is missing
//   When desk staff file the report and then open Owen's pickup screen
//   Then an open incident exists, the screen says "Call patrol" with no details, and release is blocked
import { expect, test } from '@playwright/test';
import { CHILD_IDS, DEMO_LESSON_DATE } from '../../lib/fixtures';
import { CASEY, closeIncidentsFor, ROB, signInAs } from '../safety-helpers';
import { signIn } from '../sign-in';

const pickupUrl = `/desk/children/${CHILD_IDS.owen}?day=${DEMO_LESSON_DATE}`;

test('S-016: desk reports Owen missing for an instructor, and release is blocked with no details', async ({ page }) => {
  await closeIncidentsFor(page, CHILD_IDS.owen);

  await signIn(page, CASEY);
  await page.goto(pickupUrl);
  await page.getByTestId('report-missing').click();
  await expect(page).toHaveURL(new RegExp(`/desk/children/${CHILD_IDS.owen}/report-missing\\?day=${DEMO_LESSON_DATE}`));
  await expect(page.getByTestId('missing-report-form')).toContainText('Report Owen Parr missing');
  await page.getByTestId('last-seen-at').fill(`${DEMO_LESSON_DATE}T14:20`);
  await page.getByTestId('lastSeenLocation').fill('Bottom of the Magic carpet');
  await page.getByTestId('clothingDescription').fill('Yellow jacket');
  await page.getByTestId('notes').fill('Instructor radioed in; phone dead');
  await page.getByTestId('submit-report').click();

  // Back on the pickup screen: "Call patrol", nothing about the incident, and release is blocked.
  await expect(page).toHaveURL(new RegExp(`/desk/children/${CHILD_IDS.owen}\\?day=${DEMO_LESSON_DATE}$`));
  await expect(page.getByTestId('release-blocked')).toContainText('Release blocked: Call patrol');
  for (const hidden of ['Magic carpet', 'Yellow jacket', 'phone dead']) await expect(page.getByTestId('pickup-page')).not.toContainText(hidden);
  await expect(page.getByTestId('release-child')).toBeDisabled();
  await expect(page.getByTestId('report-missing')).toHaveCount(0);

  // A second desk report is refused while the incident is open.
  await page.goto(`/desk/children/${CHILD_IDS.owen}/report-missing?day=${DEMO_LESSON_DATE}`);
  await expect(page.getByTestId('already-reported')).toBeVisible();
  await expect(page.getByTestId('missing-report-form')).toHaveCount(0);

  // The open incident exists for patrol, with what desk entered, under Casey's name.
  await signInAs(page, ROB);
  await page.goto('/patrol');
  const row = page.locator(`[data-child="${CHILD_IDS.owen}"]`);
  await expect(row).toHaveCount(1);
  await expect(row).toContainText(/Dec 12, 2:20\sp\.m\. · Bottom of the Magic carpet/);
  await row.click();
  await expect(page.getByTestId('timeline-reported')).toContainText('Reported missing · Casey Morgan');
  await expect(page.getByTestId('packet-reported-clothing-label')).toHaveText('Clothing reported by Casey Morgan');
});

test('S-016: the desk report form shows field errors and refuses an unknown child', async ({ page }) => {
  await closeIncidentsFor(page, CHILD_IDS.ella);
  await signIn(page, CASEY);
  await page.goto(`/desk/children/${CHILD_IDS.ella}/report-missing?day=${DEMO_LESSON_DATE}`);
  await page.getByTestId('lastSeenLocation').fill('   ');
  await page.getByTestId('submit-report').click();
  await expect(page.getByTestId('report-error')).toHaveText('Please fix the highlighted fields.');
  await expect(page.getByTestId('error-lastSeenLocation')).toHaveText('Enter where the child was last seen.');

  await page.goto(`/desk/children/chd_nobody/report-missing?day=${DEMO_LESSON_DATE}`);
  await expect(page.locator('body')).toContainText(/could not be found/i);
  await expect(page.getByTestId('missing-report-form')).toHaveCount(0);
});
