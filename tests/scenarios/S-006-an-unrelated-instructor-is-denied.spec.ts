// piezas-scenario: S-006 v=6d9326943c83
// S-006: An unrelated instructor is denied
//   Given an instructor who is not assigned Ava's group
//   When they request Ava's alerts or try to change her medical details by address or direct server call
//   Then they are refused and no details are returned
import { expect, test } from '@playwright/test';
import { DAY, SAM, signInAs } from '../safety-helpers';

test('S-006: An unrelated instructor is denied', async ({ page }) => {
  await signInAs(page, SAM);
  await page.goto(`/instructor?day=${DAY}`);
  await expect(page.getByTestId('group-grp_09')).toBeVisible();
  await expect(page.getByTestId('child-chd_ava')).toHaveCount(0);

  // By address: Ava's report page returns nothing about her.
  await page.goto(`/instructor/report-missing/chd_ava?day=${DAY}`);
  await expect(page.getByTestId('not-found')).toHaveText('Not found');
  await expect(page.getByTestId('missing-report-form')).toHaveCount(0);
  await expect(page.getByTestId('report-missing-page')).not.toContainText('Ava');

  // The patrol packet and search are not reachable for an instructor.
  await page.goto('/patrol?q=Ava');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId('search-results')).toHaveCount(0);
});
