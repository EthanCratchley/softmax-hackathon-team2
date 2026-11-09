// piezas-scenario: S-003 v=ead43290d8f8
// S-003: Blank medical answers stay incomplete
//   Given a child with every detail filled in except conditions, which is blank
//   When the parent saves the profile
//   Then the status reads "Needs information" and names conditions as missing
import { expect, test } from '../scenario-test';
import { CHILD_IDS } from '../../lib/fixtures';
import { fillAvaProfile, PRIYA, saveProfile } from '../parent-helpers';
import { signIn } from '../sign-in';

test('S-003: a blank conditions answer keeps the profile incomplete and names conditions', async ({ page }) => {
  await signIn(page, PRIYA);
  await page.goto(`/parent/children/${CHILD_IDS.ava}`);
  // Everything filled in except conditions: "Add details" chosen but left empty.
  await fillAvaProfile(page, 'blank');
  await saveProfile(page);

  await page.reload();
  await expect(page.getByTestId('profile-status')).toHaveText('Needs information');
  await expect(page.getByTestId('missing-conditions')).toContainText('Medical conditions');
  await expect(page.getByTestId('profile-progress').locator('li')).toHaveCount(1);
  await expect(page.getByTestId('conditions').getByLabel('None')).not.toBeChecked();

  await page.goto('/parent');
  const card = page.getByTestId(`child-card-${CHILD_IDS.ava}`);
  await expect(card).toContainText('Needs information');
  await expect(card).toContainText(/Still needed:.*conditions/i);
});
