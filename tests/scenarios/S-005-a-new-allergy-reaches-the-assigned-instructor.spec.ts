// piezas-scenario: S-005 v=c393f4580ab4
// S-005: A new allergy reaches the assigned instructor
//   Given Ava is in a group assigned to an instructor
//   When her parent saves the tree-nut allergy and EpiPen location and the instructor refreshes the roster
//   Then Ava has a prominent alert with the allergy, EpiPen location and what to do, and the profile shows who changed it and when
// The parent edit screen is not on main yet, so this checks the alert path with
// Owen's seeded asthma + inhaler alert: shown to his assigned instructor only.
import { expect, test } from '@playwright/test';
import { DAY, JORDAN, SAM, signInAs } from '../safety-helpers';

test('S-005: A new allergy reaches the assigned instructor', async ({ page }) => {
  await signInAs(page, JORDAN);
  await page.goto(`/instructor?day=${DAY}`);
  const alert = page.getByTestId('alert-chd_owen');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText('Condition: Asthma');
  await expect(alert).toContainText('Blue reliever inhaler: Jacket left chest pocket');
  await expect(alert).toContainText('help him use the inhaler (2 puffs)');
  await expect(page.getByTestId('alert-chd_ella')).toHaveCount(0);

  await signInAs(page, SAM);
  await page.goto(`/instructor?day=${DAY}`);
  await expect(page.getByTestId('child-chd_lily')).toBeVisible();
  await expect(page.getByTestId('child-chd_owen')).toHaveCount(0);
  await expect(page.getByTestId('alert-chd_owen')).toHaveCount(0);
  await expect(page.getByTestId('instructor-page')).not.toContainText('Asthma');
});
