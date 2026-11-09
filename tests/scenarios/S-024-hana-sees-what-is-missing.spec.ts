// piezas-scenario: S-024 v=1880cd213327
// S-024: Hana sees what is missing
//   Given one child with a complete profile and one missing a second contact and consent
//   When Hana opens the admin overview
//   Then only the second child is listed, with those two fields named
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

test('S-024: Hana sees which children are missing details and which fields, without medical values', async ({ page }) => {
  await signIn(page, 'hana.sato@example.test');
  await page.goto('/admin');
  // Mateo is missing a second contact and consent; Noor is complete.
  await expect(page.getByTestId(`missing-${CHILD_IDS.mateo}-emergencyContacts`)).toHaveText('Emergency contacts');
  await expect(page.getByTestId(`missing-${CHILD_IDS.mateo}-consent`)).toHaveText('Signed consent');
  await expect(page.getByTestId(`incomplete-${CHILD_IDS.mateo}`).locator('li')).toHaveCount(2);
  await expect(page.getByTestId(`incomplete-${CHILD_IDS.noor}`)).toHaveCount(0);
  await expect(page.getByTestId('admin-dashboard')).not.toContainText(/Asthma|diabetes|Glucose gel|inhaler|2 puffs/i);
});
