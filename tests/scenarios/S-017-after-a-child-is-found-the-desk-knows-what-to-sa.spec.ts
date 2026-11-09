// piezas-scenario: S-017 v=4d364150a082
// S-017: After a child is found the desk knows what to say
//   Given Owen's incident has been marked Located
//   When desk staff open Owen's screen
//   Then release is available and a note says an incident happened today and to refer family questions to Hana
import { expect, test } from '@playwright/test';
import { ADULT_IDS, CHILD_IDS, DEMO_LESSON_DATE } from '../../lib/fixtures';
import { CASEY, closeIncidentsFor, instructorReports, patrolOpensPacket } from '../safety-helpers';
import { signIn } from '../sign-in';

const pickupUrl = `/desk/children/${CHILD_IDS.owen}?day=${DEMO_LESSON_DATE}`;

test('S-017: after Owen is marked Located, desk can release him and knows to refer families to Hana', async ({ page }) => {
  await closeIncidentsFor(page, CHILD_IDS.owen);
  // Owen may already be checked in by an earlier desk test on the same server.
  await signIn(page, CASEY);
  await page.goto(pickupUrl);
  if ((await page.getByTestId('pickup-attendance').textContent()) === 'Expected') {
    await page.getByTestId('bib-number').fill('14');
    await page.getByTestId('check-in-child').click();
  }
  await expect(page.getByTestId('pickup-attendance')).toHaveText('Checked in');

  await instructorReports(page, CHILD_IDS.owen, { time: '14:30', location: 'Top of the Pigeon chair' });
  await patrolOpensPacket(page, CHILD_IDS.owen);
  await page.getByTestId('status-located').click();
  await expect(page.getByTestId('packet-status')).toHaveText('Located');

  await signIn(page, CASEY);
  await page.goto(pickupUrl);
  await expect(page.getByTestId('release-blocked')).toHaveCount(0);
  await expect(page.getByTestId('incident-located')).toHaveText('An incident happened today. Refer family questions to Hana.');
  await expect(page.getByTestId('pickup-page')).not.toContainText('Pigeon chair');
  await page.getByTestId(`adult-${ADULT_IDS.owenFather}`).check();
  await page.getByTestId('id-confirmation').check();
  await expect(page.getByTestId('release-child')).toBeEnabled();
});
