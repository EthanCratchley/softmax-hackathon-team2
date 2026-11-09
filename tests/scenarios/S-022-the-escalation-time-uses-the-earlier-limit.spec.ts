// piezas-scenario: S-022 v=e97b4583882c
// S-022: The escalation time uses the earlier limit
//   Given one child last seen at 2:30 p.m. and another last seen at 3:30 p.m.
//   When patrol opens each packet
//   Then the first shows 3:30 p.m., the second shows 4:00 p.m., and no message is sent to police or family
import { expect, test } from '@playwright/test';
import { escalationTime } from '../../lib/domain/rules';
import { closeIncidentsFor, instructorReports, patrolOpensPacket } from '../safety-helpers';

test('S-022: The escalation time uses the earlier limit', async ({ page }) => {
  // Rule check in resort time (UTC-7 on Dec 12).
  expect(escalationTime('2026-12-12T14:30:00-07:00', '2026-12-12')).toBe(new Date('2026-12-12T15:30:00-07:00').toISOString());
  expect(escalationTime('2026-12-12T15:30:00-07:00', '2026-12-12')).toBe(new Date('2026-12-12T16:00:00-07:00').toISOString());

  await closeIncidentsFor(page, 'chd_ella');
  await closeIncidentsFor(page, 'chd_owen');
  await instructorReports(page, 'chd_ella', { time: '14:30', location: 'Lift line' });
  await instructorReports(page, 'chd_owen', { time: '15:30', location: 'Terrain park' });

  await patrolOpensPacket(page, 'chd_ella');
  await expect(page.getByTestId('escalation')).toContainText(/not located by Dec 12, 3:30\sp\.m\./);
  await expect(page.getByTestId('escalation')).toContainText('This app does not contact police or family.');

  await patrolOpensPacket(page, 'chd_owen');
  await expect(page.getByTestId('escalation')).toContainText(/not located by Dec 12, 4:00\sp\.m\./);
  await expect(page.getByTestId('escalation')).toContainText('This app does not contact police or family.');
  // Nothing on the packet offers to message police or family.
  await expect(page.getByTestId('emergency-packet').locator('a[href^="mailto:"], a[href^="sms:"]')).toHaveCount(0);
});
