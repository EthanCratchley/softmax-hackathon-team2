// piezas-scenario: S-029 v=9d26e543fd6e
// S-029: Hana opens medical details only with a logged reason
//   Given Hana is on the admin overview and Ava has a recorded allergy
//   When Hana views the overview, then tries to open Ava's full details with no reason, then opens them with a reason
//   Then the overview shows no medical values, the attempt with no reason is refused, and the opening with a reason shows the details and logs who, when, which child and why
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { expect, test } from '../scenario-test';
import { CHILD_IDS } from '../../lib/fixtures';
import { signIn } from '../sign-in';

const medicalValues = /tree nut|peanut|Asthma|diabetes|Glucose gel|inhaler|EpiPen|2 puffs/i;

test('S-029: Hana opens medical details only with a logged reason', async ({ page }) => {
  // Ava's parent records an allergy, so there is a medical value to protect.
  await signIn(page, 'priya.shah@example.test');
  await page.goto(`/parent/children/${CHILD_IDS.ava}`);
  const medical = page.getByTestId('section-medical');
  if (!(await medical.evaluate((el) => (el as HTMLDetailsElement).open))) await medical.locator('summary').click();
  await page.getByTestId('allergies').getByLabel('Add details').check();
  await page.getByTestId('allergies').locator('textarea').fill('Tree nuts');
  await page.getByTestId('conditions').getByLabel('None').check();
  await medical.locator('fieldset', { hasText: 'Medications and where they are kept' }).getByLabel('Add details').check();
  await page.getByLabel('Medication name').fill('EpiPen');
  await page.getByLabel('Where is it kept?').fill('Jacket right pocket');
  await page.getByLabel('Instructions for staff').fill('Give EpiPen in outer thigh, then call patrol.');
  await page.getByTestId('save-profile').click();
  await expect(page.getByTestId('parent-profile-form').getByRole('status').filter({ hasText: /^Saved / })).toBeVisible();

  await signIn(page, 'hana.sato@example.test');
  await page.goto('/admin');
  await expect(page.getByTestId('admin-dashboard')).toBeVisible();
  await expect(page.getByTestId('admin-dashboard')).not.toContainText(medicalValues);

  await page.getByTestId('details-child-select').selectOption(CHILD_IDS.ava);
  await page.getByTestId('details-child-open').click();
  await expect(page).toHaveURL(`/admin/children/${CHILD_IDS.ava}`);
  await expect(page.getByTestId('admin-child-name')).toHaveText('Ava Shah');
  await expect(page.getByTestId('child-details')).toHaveCount(0);

  await page.getByTestId('details-open').click();
  await expect(page.getByTestId('details-reason-error')).toHaveText('Give a reason to open these details.');
  await expect(page.getByTestId('child-details')).toHaveCount(0);

  const reason = `Parent called about lunch plan ${Date.now()}`;
  await page.getByTestId('details-reason').fill(reason);
  await page.getByTestId('details-open').click();
  await expect(page.getByTestId('child-details')).toBeVisible();
  await expect(page.getByTestId('details-address')).toHaveText('12 Alder Lane, Squamish, BC V0N 0A1');
  await expect(page.getByTestId('details-contacts')).toContainText('Priya Shah (Mother) · 604-555-0101');
  await expect(page.getByTestId('details-allergies')).toHaveText('Tree nuts');
  // Neither the reason nor the details travel in the address bar.
  expect(page.url()).toBe(new URL(`/admin/children/${CHILD_IDS.ava}`, page.url()).href);

  await page.goto('/admin/audit');
  const entry = page.getByTestId('audit-log').locator('li[data-action="admin_viewed_child_details"]').filter({ hasText: reason });
  await expect(entry).toHaveCount(1);
  await expect(entry).toContainText('Hana Sato (usr_admin_sato)');
  await expect(entry).toContainText(`Child ${CHILD_IDS.ava}`);
  await expect(entry).toContainText(`Reason: ${reason}`);
  await expect(entry.locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}T/);
  await expect(page.getByTestId('audit-log')).not.toContainText(medicalValues);
});
