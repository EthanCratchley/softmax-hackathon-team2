// piezas-scenario: S-021 v=2ffc57bb2b8c
// S-021: Patrol logs actions and closes an incident
//   Given Owen has an open incident
//   When a patroller adds "family contacted", marks him Located and later Closed
//   Then the timeline shows each step with the patroller and time, and each is in the audit trail
import { expect, test } from '../scenario-test';
import { closeIncidentsFor, patrolReports, auditActionsFor } from '../safety-helpers';

test('S-021: Patrol logs actions and closes an incident', async ({ page }) => {
  await closeIncidentsFor(page, 'chd_owen');
  await patrolReports(page, 'chd_owen', 'Owen', { time: '14:30', location: 'Top of the Pigeon chair' });
  const packetUrl = page.url();

  // A blank note is refused by the server (bypassing the browser's required check).
  await page.getByTestId('incident-action-note').evaluate((el) => el.removeAttribute('required'));
  await page.getByTestId('incident-action-save').click();
  await expect(page.getByTestId('incident-action-form-error')).toHaveText('Add a note for this action.');

  await page.getByTestId('incident-action-type').selectOption('family_contacted');
  await page.getByTestId('incident-action-note').fill('Called mother, she is on her way');
  await page.getByTestId('incident-action-save').click();
  await expect(page.getByTestId('saved')).toHaveText('Action recorded.');
  const entries = page.getByTestId('timeline-entry');
  await expect(entries).toHaveCount(1);
  await expect(entries.nth(0)).toContainText(/Family contacted · Rob Fournier · Called mother, she is on her way/);
  await expect(entries.nth(0)).toContainText(/\d{1,2}:\d{2}\s[ap]\.m\./);

  await page.getByTestId('status-located').click();
  await expect(page.getByTestId('saved')).toHaveText('Marked as located.');
  await expect(page.getByTestId('packet-status')).toHaveText('Located');
  await expect(entries).toHaveCount(2);
  await expect(entries.nth(1)).toContainText('Status change · Rob Fournier · Open → Located');
  await expect(page.getByTestId('status-located')).toHaveCount(0);

  await page.getByTestId('status-closed').click();
  await expect(page.getByTestId('saved')).toHaveText('Incident closed.');
  await expect(page.getByTestId('incident-closed')).toBeVisible();
  await expect(page.getByTestId('packet-status')).toHaveText('Closed');
  // The full timeline stays, including the closing step; medical details and contacts do not.
  await expect(entries).toHaveCount(3);
  await expect(entries.nth(2)).toContainText('Status change · Rob Fournier · Located → Closed');
  await expect(page.getByTestId('emergency-packet')).not.toContainText(/Asthma|inhaler|604-555/);
  await expect(page.getByTestId('incident-action-form')).toHaveCount(0);

  await page.goto(packetUrl);
  await expect(entries).toHaveCount(3);
  await page.goto('/patrol');
  await expect(page.locator('[data-child="chd_owen"]')).toHaveCount(0);

  // Each step is in Hana's audit trail.
  const incidentId = packetUrl.split('/patrol/incidents/')[1].split('?')[0];
  const actions = await auditActionsFor(page, incidentId);
  expect(actions.filter((a) => a === 'incident_updated')).toHaveLength(3);
  expect(actions).toContain('incident_packet_viewed');
});
