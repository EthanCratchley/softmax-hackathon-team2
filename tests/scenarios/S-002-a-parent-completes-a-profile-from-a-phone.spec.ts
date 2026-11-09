// piezas-scenario: S-002 v=3f080b5c5f61
// S-002: A parent completes a profile from a phone
//   Given Ava's profile shows "Needs information" on a phone-sized screen
//   When her parent enters two contacts, the tree-nut allergy, "none" for conditions, the EpiPen and its location, one pickup adult, an address and their consent, then reloads
//   Then the saved values remain and the status reads "Complete"
import { expect, test } from '@playwright/test';
import { CHILD_IDS } from '../../lib/fixtures';
import { fillAvaProfile, openSection, PRIYA, saveProfile } from '../parent-helpers';
import { signIn } from '../sign-in';

test('S-002: a parent completes a profile from a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await signIn(page, PRIYA);
  await page.goto(`/parent/children/${CHILD_IDS.ava}`);
  await expect(page.getByTestId('profile-status')).toHaveText(/Needs information|Complete/);

  await fillAvaProfile(page, 'none');
  await saveProfile(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.reload();
  await expect(page.getByTestId('profile-status')).toHaveText('Complete');
  await expect(page.getByTestId('profile-progress')).toHaveCount(0);
  await expect(page.getByTestId('allergies').locator('textarea')).toHaveValue('Tree nuts');
  await expect(page.getByTestId('conditions').getByLabel('None')).toBeChecked();
  await expect(page.getByLabel('Medication name')).toHaveValue('EpiPen');
  await expect(page.getByLabel('Where is it kept?')).toHaveValue('Jacket right pocket');
  await expect(page.getByTestId('contact-2').getByLabel('Full name')).toHaveValue('Arjun Shah');
  await expect(page.getByTestId('contact-2').getByLabel('Phone')).toHaveValue('604-555-0102');
  await expect(page.getByTestId('pickup-adult-adl_ava_priya').getByLabel('Full name')).toHaveValue('Priya Shah');
  await expect(page.getByTestId('mailing-address')).toHaveValue('12 Alder Lane, Squamish, BC V0N 0A1');
  await openSection(page, 'section-consent');
  await expect(page.getByTestId('consent-record')).toBeVisible();

  await page.goto('/parent');
  await expect(page.getByTestId(`child-card-${CHILD_IDS.ava}`)).toContainText('Complete');
});
