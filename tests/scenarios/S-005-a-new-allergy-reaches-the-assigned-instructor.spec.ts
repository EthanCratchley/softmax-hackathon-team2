// piezas-scenario: S-005 v=c393f4580ab4
// S-005: A new allergy reaches the assigned instructor
//   Given Ava is in a group assigned to an instructor
//   When her parent saves the tree-nut allergy and EpiPen location and the instructor refreshes the roster
//   Then Ava has a prominent alert with the allergy, EpiPen location and what to do, and the profile shows who changed it and when
import { expect, test } from '@playwright/test';
import { DAY, JORDAN, PRIYA, SAM, signInAs } from '../safety-helpers';

test('S-005: A new allergy reaches the assigned instructor', async ({ page }) => {
  await signInAs(page, PRIYA);
  await page.goto('/parent/children/chd_ava');
  const medical = page.getByTestId('section-medical');
  if (!(await medical.evaluate((el) => (el as HTMLDetailsElement).open))) await medical.locator('summary').click();
  await page.getByTestId('allergies').getByLabel('Add details').check();
  await page.getByTestId('allergies').locator('textarea').fill('Tree nuts');
  await page.getByTestId('conditions').getByLabel('None').check();
  await medical.locator('fieldset', { hasText: 'Medications and where they are kept' }).getByLabel('Add details').check();
  await page.getByLabel('Medication name').fill('EpiPen');
  await page.getByLabel('Where is it kept?').fill('Jacket right pocket');
  await page.getByLabel('Instructions for staff').fill('Give EpiPen in outer thigh, then call patrol.');
  await page.getByTestId('save-profile').click();
  // Saving without consent is allowed; the profile just stays "Needs information".
  await expect(page.getByTestId('parent-profile-form').getByRole('status').filter({ hasText: /^Saved / })).toBeVisible();
  await expect(page.getByTestId('save-error')).toHaveCount(0);

  await signInAs(page, JORDAN);
  await page.goto(`/instructor?day=${DAY}`);
  const alert = page.getByTestId('alert-chd_ava');
  await expect(alert).toContainText('Allergy: Tree nuts');
  await expect(alert).toContainText('EpiPen: Jacket right pocket');
  await expect(alert).toContainText('Give EpiPen in outer thigh, then call patrol.');

  await signInAs(page, SAM);
  await page.goto(`/instructor?day=${DAY}`);
  await expect(page.getByTestId('child-chd_ava')).toHaveCount(0);
  await expect(page.getByTestId('instructor-page')).not.toContainText('Tree nuts');
});
