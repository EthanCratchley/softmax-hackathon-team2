// piezas-scenario: S-020 v=9dbde1e1c3d6
// S-020: Others cannot open the packet
//   Given Owen has an open incident
//   When an instructor, desk staff or a parent requests the packet, or patrol requests one for a child with no incident
//   Then the request is refused and no details are returned
import { expect, test } from '../scenario-test';
import { CASEY, closeIncidentsFor, HANA, JORDAN, patrolReports, PRIYA, ROB, signInAs } from '../safety-helpers';

test('S-020: Others cannot open the packet', async ({ page }) => {
  await closeIncidentsFor(page, 'chd_owen');
  await patrolReports(page, 'chd_owen', 'Owen', { time: '14:30', location: 'Top of the Pigeon chair' });
  const packetUrl = new URL(page.url()).pathname;

  for (const email of [JORDAN, CASEY, PRIYA, HANA]) {
    await signInAs(page, email);
    await page.goto(packetUrl);
    await expect(page, email).toHaveURL(/\/$/);
    await expect(page.getByTestId('emergency-packet')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('604-555-0121');
  }

  await signInAs(page, ROB);
  await page.goto('/patrol/incidents/inc_does_not_exist');
  await expect(page.getByTestId('packet-error')).toHaveText('Not found');
  await expect(page.getByTestId('emergency-packet')).toHaveCount(0);
});
