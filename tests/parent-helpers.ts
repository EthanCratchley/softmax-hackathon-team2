// Shared steps for the parent-portal scenarios. Everything goes through the UI.
import { expect, type Page } from '@playwright/test';

export const PRIYA = 'priya.shah@example.test';
export const DANA = 'dana.whitfield@example.test';
export const NGOZI = 'ngozi.okafor@example.test';
export const CASEY = 'casey.morgan@example.test';

/** Opens a collapsible profile section if it is closed. */
export async function openSection(page: Page, testId: string) {
  const section = page.getByTestId(testId);
  if (!(await section.evaluate((el) => (el as HTMLDetailsElement).open))) await section.locator('summary').click();
}

export async function saveProfile(page: Page) {
  await page.getByTestId('save-profile').click();
  await expect(page.getByTestId('save-ok')).toHaveText(/^Saved /);
  await expect(page.getByTestId('save-error')).toHaveCount(0);
}

/**
 * Fills every part of Ava's profile: two contacts, tree-nut allergy, EpiPen, her
 * mother as pickup adult, address and (if not yet given) consent. Conditions are
 * "none" or left blank.
 */
export async function fillAvaProfile(page: Page, conditions: 'none' | 'blank') {
  await openSection(page, 'section-medical');
  await page.getByTestId('allergies').getByLabel('Add details').check();
  await page.getByTestId('allergies').locator('textarea').fill('Tree nuts');
  if (conditions === 'none') await page.getByTestId('conditions').getByLabel('None').check();
  else {
    await page.getByTestId('conditions').getByLabel('Add details').check();
    await page.getByTestId('conditions').locator('textarea').fill('');
  }
  const meds = page.getByTestId('section-medical').locator('fieldset', { hasText: 'Medications and where they are kept' });
  await meds.getByLabel('Add details').check();
  await page.getByLabel('Medication name').fill('EpiPen');
  await page.getByLabel('Where is it kept?').fill('Jacket right pocket');
  await page.getByLabel('Instructions for staff').fill('Give EpiPen in outer thigh, then call patrol.');

  await openSection(page, 'section-contacts');
  const first = page.getByTestId('contact-1');
  await first.getByLabel('Full name').fill('Priya Shah');
  await first.getByLabel('Relationship').fill('Mother');
  await first.getByLabel('Phone').fill('604-555-0101');
  const second = page.getByTestId('contact-2');
  await second.getByLabel('Full name').fill('Arjun Shah');
  await second.getByLabel('Relationship').fill('Father');
  await second.getByLabel('Phone').fill('604-555-0102');
  await expect(page.getByTestId('pickup-adult-adl_ava_priya').getByLabel('Authorized to pick up')).toBeChecked();

  await openSection(page, 'section-consent');
  await page.getByTestId('mailing-address').fill('12 Alder Lane, Squamish, BC V0N 0A1');
  if ((await page.getByTestId('consent-record').count()) === 0) {
    await page.getByTestId('consent-given').check();
    await page.getByTestId('consent-name').fill('Priya Shah');
  }
}
