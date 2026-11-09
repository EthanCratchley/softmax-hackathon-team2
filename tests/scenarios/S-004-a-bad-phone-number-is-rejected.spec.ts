// piezas-scenario: S-004 v=7d3d856710d7
// S-004: A bad phone number is rejected
//   Given a parent editing an emergency contact
//   When they enter the 9-digit number 604555-187 and save
//   Then the app refuses it with a clear message and the old value stays
import { expect, test } from '@playwright/test';
import { CHILD_IDS } from '../../lib/fixtures';
import { DANA, openSection } from '../parent-helpers';
import { signIn } from '../sign-in';

test('S-004: a 9-digit emergency phone is refused and the old number stays', async ({ page }) => {
  await signIn(page, DANA);
  await page.goto(`/parent/children/${CHILD_IDS.lily}`);
  await openSection(page, 'section-contacts');
  const contact = page.getByTestId('contact-1');
  await expect(contact.getByLabel('Phone')).toHaveValue('604-555-0111');

  await contact.getByLabel('Phone').fill('604555-187');
  await page.getByTestId('save-profile').click();
  await expect(page.getByTestId('save-error')).toHaveText('Please fix the highlighted fields.');
  await expect(contact.locator('.field-error')).toHaveText('Enter a 10-digit phone number, e.g. 604-555-0101.');
  await expect(page.getByTestId('save-ok')).toHaveCount(0);

  await page.reload();
  await openSection(page, 'section-contacts');
  await expect(page.getByTestId('contact-1').getByLabel('Phone')).toHaveValue('604-555-0111');
});
