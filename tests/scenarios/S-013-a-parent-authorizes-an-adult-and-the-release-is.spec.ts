// piezas-scenario: S-013 v=ec8c496bcf24
// S-013: A parent authorizes an adult and the release is recorded once
//   Given Lily's parent adds Mark Whitfield from their phone after the denial
//   When desk staff refresh, choose him, confirm the ID check and release her, then try to release her again
//   Then exactly one pickup record exists with the required details, the second attempt is blocked and shows who took her, and the record offers no edit or delete
import { expect, test } from '../scenario-test';
import { ADULT_IDS, CHILD_IDS, DEMO_LESSON_DATE } from '../../lib/fixtures';
import { CASEY, DANA, openSection, saveProfile } from '../parent-helpers';
import { signIn } from '../sign-in';

const pickupUrl = `/desk/children/${CHILD_IDS.lily}?day=${DEMO_LESSON_DATE}`;

test('S-013: a parent authorizes Mark, desk releases Lily once, and the record cannot be changed', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  // Mark asks to collect Lily; he is not active on her list, so desk denies him.
  await signIn(page, CASEY);
  await page.goto(pickupUrl);
  await expect(page.getByTestId('pickup-attendance')).toHaveText('Checked in');
  await expect(page.getByTestId(`adult-${ADULT_IDS.lilyUncle}`)).toHaveCount(0);
  await page.getByTestId('denial-name').fill('Mark Whitfield');
  await page.getByTestId('denial-reason').fill('Not on the active pickup list');
  await page.getByTestId('record-denial').click();
  await expect(page.getByTestId('pickup-action-message')).toHaveText('Denied pickup attempt recorded.');

  // Dana authorizes him from her phone.
  await signIn(page, DANA);
  await page.goto(`/parent/children/${CHILD_IDS.lily}`);
  await openSection(page, 'section-contacts');
  const mark = page.getByTestId(`pickup-adult-${ADULT_IDS.lilyUncle}`);
  await expect(mark.getByLabel('Full name')).toHaveValue('Mark Whitfield');
  await mark.getByLabel('Authorized to pick up').check();
  await saveProfile(page);

  // Desk refreshes, chooses Mark, confirms ID and releases.
  await signIn(page, CASEY);
  await page.goto(pickupUrl);
  const release = page.getByTestId('release-child');
  await page.getByTestId(`adult-${ADULT_IDS.lilyUncle}`).check();
  await expect(release).toBeDisabled();
  await page.getByTestId('id-confirmation').check();
  await release.click();
  await expect(page.getByTestId('pickup-action-message')).toHaveText('Released to Mark Whitfield.');
  const record = page.getByTestId('release-record');
  await expect(record).toContainText('Released to Mark Whitfield');
  await expect(record).toContainText(/Released at.*Pacific/);
  await expect(page.getByTestId('pickup-attendance')).toHaveText('Released');
  // The record offers no edit or delete.
  await expect(record.locator('button, a, input, select, textarea')).toHaveCount(0);

  // A second release is blocked and shows who took her.
  await page.reload();
  await expect(page.getByTestId('release-record')).toContainText('Released to Mark Whitfield');
  await expect(page.getByTestId('release-record')).toContainText('A second release is blocked.');
  await expect(page.getByTestId('release-child')).toBeDisabled();
  await expect(page.getByTestId(`adult-${ADULT_IDS.lilyFather}`)).toBeDisabled();

  // Exactly one pickup record exists.
  await signIn(page, DANA);
  await page.goto(`/parent/children/${CHILD_IDS.lily}`);
  await expect(page.getByTestId('activity-list').locator('li', { hasText: 'Picked up' })).toHaveCount(1);
  await expect(page.getByTestId('activity-list')).toContainText('Picked up by Mark Whitfield');
});
