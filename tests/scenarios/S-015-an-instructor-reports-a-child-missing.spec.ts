// piezas-scenario: S-015 v=eace9ac24deb
// S-015: An instructor reports a child missing
//   Given Owen is in the signed-in instructor's group
//   When the instructor reports him missing at 2:40 p.m., last seen at 2:30 p.m. at the top of the Pigeon chair, with clothing and notes
//   Then an open incident appears on the patrol list with those details
import { expect, test } from '../scenario-test';
import { closeIncidentsFor, instructorReports, ROB, signInAs } from '../safety-helpers';

test('S-015: An instructor reports a child missing', async ({ page }) => {
  await closeIncidentsFor(page, 'chd_owen');

  await instructorReports(page, 'chd_owen', { time: '14:30', location: 'Top of the Pigeon chair', clothing: 'Red jacket, blue helmet, black pants', equipment: 'Blue skis' });
  await expect(page).toHaveURL(/\/instructor\?day=2026-12-12&reported=chd_owen/);
  await expect(page.getByTestId('report-confirmation')).toContainText('Missing report sent for Owen Parr');
  await expect(page.getByTestId('missing-chd_owen')).toHaveText('Missing — reported');
  await expect(page.getByTestId('report-chd_owen')).toHaveCount(0);

  await signInAs(page, ROB);
  await page.goto('/patrol');
  const row = page.locator('[data-child="chd_owen"]');
  await expect(row).toHaveCount(1);
  await expect(row).toContainText('Open');
  await expect(row).toContainText('Owen Parr');
  await expect(row).toContainText('Group 14');
  await expect(row).toContainText(/Dec 12, 2:30\sp\.m\. · Top of the Pigeon chair/);
  await expect(row).toContainText(/Escalate by Dec 12, 3:30\sp\.m\./);
});

test('S-015: the report form shows field errors and refuses an unknown child', async ({ page }) => {
  await closeIncidentsFor(page, 'chd_ava');
  await signInAs(page, 'jordan.lee@example.test');
  await page.goto('/instructor/report-missing/chd_ava?day=2026-12-12');
  await page.getByTestId('lastSeenLocation').fill('   ');
  await page.getByTestId('submit-report').click();
  await expect(page.getByTestId('report-error')).toHaveText('Please fix the highlighted fields.');
  await expect(page.getByTestId('error-lastSeenLocation')).toHaveText('Enter where the child was last seen.');
  await expect(page.getByTestId('missing-report-form')).toBeVisible();

  await page.goto('/instructor/report-missing/chd_nobody?day=2026-12-12');
  await expect(page.getByTestId('not-found')).toHaveText('Not found');
});
