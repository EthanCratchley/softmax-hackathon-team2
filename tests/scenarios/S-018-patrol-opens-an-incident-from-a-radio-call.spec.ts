// piezas-scenario: S-018 v=89922aa7b6b5
// S-018: Patrol opens an incident from a radio call
//   Given patrol hears by radio that a child is missing and no incident exists
//   When a patroller searches the child's name and opens an incident
//   Then the search showed only name, age and group, the incident now exists, and the action is logged
import { expect, test } from '@playwright/test';
import { closeIncidentsFor, DAY, auditActionsFor } from '../safety-helpers';

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

  // Opening the incident asks for what the radio call said: last-seen time and place.
  await page.getByTestId('open-incident-chd_owen').click();
  await expect(page).toHaveURL(/\/patrol\/report-missing\/chd_owen\?day=2026-12-12/);
  await expect(page.getByTestId('missing-report-form')).toContainText('Report Owen Parr missing');
  await page.getByTestId('last-seen-at').fill(`${DAY}T13:50`);
  await page.getByTestId('lastSeenLocation').fill('Bottom of Easy Street');
  await page.getByTestId('clothingDescription').fill('Red jacket');
  await page.getByTestId('submit-report').click();
  await expect(page).toHaveURL(/\/patrol\/incidents\/inc_/);
  const packetUrl = page.url();
  await expect(page.getByTestId('packet-name')).toHaveText('Owen Parr');
  await expect(page.getByTestId('packet-status')).toHaveText('Open');
  await expect(page.getByTestId('packet-last-seen-location')).toHaveText('Bottom of Easy Street');
  await expect(page.getByTestId('packet-last-seen-at')).toHaveText(/Dec 12, 1:50\sp\.m\./);
  await expect(page.getByTestId('escalation')).toContainText(/2:50\sp\.m\./);
  // The report is on the timeline under the patroller's name.
  await expect(page.getByTestId('timeline-reported')).toContainText('Reported missing · Rob Fournier');

  await page.goto('/patrol');
  await expect(page.locator('[data-child="chd_owen"]')).toHaveCount(1);

  // A second radio call for the same child goes straight to the open packet, no duplicate.
  await page.goto(`/patrol?day=${DAY}&q=Owen`);
  await page.getByTestId('open-incident-chd_owen').click();
  await expect(page).toHaveURL(packetUrl);
  await page.goto('/patrol');
  await expect(page.locator('[data-child="chd_owen"]')).toHaveCount(1);

  // Opening the incident from the radio call is in the audit trail, by Rob.
  const incidentId = packetUrl.split('/patrol/incidents/')[1].split('?')[0];
  expect(await auditActionsFor(page, incidentId)).toContain('incident_reported');
  await expect(page.getByTestId('audit-log').locator('li[data-action="incident_reported"]', { hasText: incidentId })).toContainText('Rob Fournier');
});

test('S-018: the radio-call form needs a place and refuses a child patrol did not search for', async ({ page }) => {
  await closeIncidentsFor(page, 'chd_ella');
  await page.goto(`/patrol/report-missing/chd_ella?day=${DAY}&q=Ella`);
  await page.getByTestId('lastSeenLocation').fill('   ');
  await page.getByTestId('submit-report').click();
  await expect(page.getByTestId('report-error')).toHaveText('Please fix the highlighted fields.');
  await expect(page.getByTestId('error-lastSeenLocation')).toHaveText('Enter where the child was last seen.');
  await page.goto('/patrol');
  await expect(page.locator('[data-child="chd_ella"]')).toHaveCount(0);

  // Without a matching search, the page shows nothing about the child.
  await page.goto(`/patrol/report-missing/chd_ella?day=${DAY}`);
  await expect(page.getByTestId('not-found')).toHaveText('Not found');
  await page.goto(`/patrol/report-missing/chd_nobody?day=${DAY}&q=Ella`);
  await expect(page.getByTestId('not-found')).toHaveText('Not found');
});

test('S-018: a search with no match says so', async ({ page }) => {
  await closeIncidentsFor(page, 'chd_ella');
  await page.goto(`/patrol?day=${DAY}&q=Nobody`);
  await expect(page.getByTestId('search-empty')).toBeVisible();
  await expect(page.getByTestId('search-results')).toHaveCount(0);
});
