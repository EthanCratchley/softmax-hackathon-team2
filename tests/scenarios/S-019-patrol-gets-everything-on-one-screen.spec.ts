// piezas-scenario: S-019 v=1be617a3c22f
// S-019: Patrol gets everything on one screen
//   Given Owen has an open incident
//   When a patroller opens the packet on a tablet
//   Then the required details all appear on one screen and the audit trail shows who opened it, when and for which incident
import { expect, test } from '../scenario-test';
import { closeIncidentsFor, instructorReports, patrolOpensPacket, auditActionsFor } from '../safety-helpers';

test('S-019: Patrol gets everything on one screen', async ({ page }) => {
  await closeIncidentsFor(page, 'chd_owen');
  await instructorReports(page, 'chd_owen', { time: '14:30', location: 'Top of the Pigeon chair', clothing: 'Green jacket over red', equipment: 'Blue skis' });

  await page.setViewportSize({ width: 820, height: 1180 });
  await patrolOpensPacket(page, 'chd_owen');
  await expect(page.getByTestId('packet-name')).toHaveText('Owen Parr');
  await expect(page.getByTestId('packet-other-names')).toHaveText('Owen Okafor-Parr, Okafor-Parr');
  await expect(page.getByTestId('packet-age')).toHaveText('10');
  await expect(page.getByTestId('packet-group')).toHaveText('Group 14 · Jordan Lee');
  await expect(page.getByTestId('packet-lift-pass')).toHaveText('KK-24-1003');
  // Owen may already have been checked in (bib) by an earlier desk test on the same server.
  await expect(page.getByTestId('packet-bib')).toHaveText(/^(\d+|Not checked in)$/);
  await expect(page.getByTestId('packet-last-seen-at')).toHaveText(/Dec 12, 2:30\sp\.m\./);
  await expect(page.getByTestId('packet-last-seen-location')).toHaveText('Top of the Pigeon chair');
  await expect(page.getByTestId('packet-reported-clothing')).toHaveText('Green jacket over red');
  await expect(page.getByTestId('packet-parent-clothing')).toHaveText('Red jacket, blue helmet');
  await expect(page.getByTestId('packet-equipment')).toHaveText('Blue skis');
  await expect(page.getByTestId('packet-alert')).toContainText('Condition: Asthma');
  await expect(page.getByTestId('packet-alert')).toContainText('Jacket left chest pocket');
  await expect(page.getByTestId('packet-contact-1')).toContainText('Ngozi Okafor · Mother');
  await expect(page.getByTestId('packet-contact-phone-1')).toHaveAttribute('href', 'tel:604-555-0121');
  await expect(page.getByTestId('packet-contact-2')).toContainText('Daniel Parr · Father');
  await expect(page.getByTestId('packet-contact-phone-2')).toHaveAttribute('href', 'tel:604-555-0122');
  await expect(page.getByTestId('escalation')).toHaveText(
    /^Follow resort procedure: escalate to police if not located by Dec 12, 3:30\sp\.m\.\. This app does not contact police or family\.$/,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  // Opening the packet is recorded: who, when, which incident.
  const incidentId = page.url().split('/patrol/incidents/')[1].split('?')[0];
  const actions = await auditActionsFor(page, incidentId);
  expect(actions[0]).toBe('incident_packet_viewed');
  await expect(page.getByTestId('audit-log').locator('li', { hasText: incidentId }).first()).toContainText('Rob Fournier');
});
