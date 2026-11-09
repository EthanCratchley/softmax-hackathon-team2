// piezas-scenario: S-018 v=89922aa7b6b5
// S-018: Patrol opens an incident from a radio call
//   Given patrol hears by radio that a child is missing and no incident exists
//   When a patroller searches the child's name and opens an incident
//   Then the search showed only name, age and group, the incident now exists, and the action is logged
import { expect, test } from '@playwright/test';
import { closeIncidentsFor, DAY } from '../safety-helpers';

test('S-018: Patrol opens an incident from a radio call', async ({ page }) => {
  await closeIncidentsFor(page, 'chd_owen');
  await page.goto(`/patrol?day=${DAY}`);
  await expect(page.locator('[data-child="chd_owen"]')).toHaveCount(0);

  // The radio call gives the other surname.
  await page.getByTestId('search').fill('Okafor-Parr');
  await page.getByTestId('search-submit').click();
  const result = page.getByTestId('search-result-chd_owen');
  await expect(result).toBeVisible();
  await expect(result).toContainText('Owen Parr');
  await expect(result).toContainText('Age 10 · Group 14');
  // Identity only before an incident exists.
  for (const hidden of ['Asthma', 'inhaler', '604-555', 'KK-24-1003', 'Red jacket']) await expect(page.getByTestId('search-results')).not.toContainText(hidden);

  await page.getByTestId('open-incident-chd_owen').click();
  await expect(page).toHaveURL(/\/patrol\/incidents\/inc_/);
  await expect(page.getByTestId('packet-name')).toHaveText('Owen Parr');
  await expect(page.getByTestId('packet-status')).toHaveText('Open');
  await expect(page.getByTestId('packet-last-seen-location')).toHaveText('Reported by radio — update');

  await page.goto('/patrol');
  await expect(page.locator('[data-child="chd_owen"]')).toHaveCount(1);
});

test('S-018: a search with no match says so', async ({ page }) => {
  await closeIncidentsFor(page, 'chd_ella');
  await page.goto(`/patrol?day=${DAY}&q=Nobody`);
  await expect(page.getByTestId('search-empty')).toBeVisible();
  await expect(page.getByTestId('search-results')).toHaveCount(0);
});
