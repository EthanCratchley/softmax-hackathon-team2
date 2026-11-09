// piezas-scenario: S-026 v=2a1caa54d8c5
// S-026: Hana sees today's activity
//   Given a lesson day with check-ins, a release, a denied pickup and an open incident
//   When Hana opens the admin overview
//   Then the counts and lists match those events
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { expect, test } from '@playwright/test';
import { ADULT_IDS, CHILD_IDS, DEMO_LESSON_DATE } from '../../lib/fixtures';
import { signIn } from '../sign-in';

const count = async (page: import('@playwright/test').Page, key: string) => Number(await page.getByTestId(`admin-count-${key}`).textContent());

test("S-026: Hana's overview counts match the day's check-ins, releases and denials", async ({ page }) => {
  await signIn(page, 'hana.sato@example.test');
  await page.goto(`/admin?day=${DEMO_LESSON_DATE}`);
  const before = { expected: await count(page, 'expected'), checkedIn: await count(page, 'checkedIn'), released: await count(page, 'released') };

  await signIn(page, 'casey.morgan@example.test');
  await page.goto(`/desk/children/${CHILD_IDS.noor}?day=${DEMO_LESSON_DATE}`);
  await page.getByTestId('bib-number').fill('31');
  await page.getByTestId('check-in-child').click();
  await expect(page.getByTestId('pickup-attendance')).toHaveText('Checked in');
  await page.getByTestId('denial-name').fill('Unlisted Visitor');
  await page.getByTestId('denial-reason').fill('Not on the list');
  await page.getByTestId('record-denial').click();
  await expect(page.getByTestId('pickup-action-message')).toHaveText('Denied pickup attempt recorded.');
  await page.getByTestId(`adult-${ADULT_IDS.noorMother}`).check();
  await page.getByTestId('id-confirmation').check();
  await page.getByTestId('release-child').click();
  await expect(page.getByTestId('release-record')).toContainText('Leila Haddad');

  await signIn(page, 'hana.sato@example.test');
  await page.goto(`/admin?day=${DEMO_LESSON_DATE}`);
  expect(await count(page, 'expected')).toBe(before.expected);
  expect(await count(page, 'checkedIn')).toBe(before.checkedIn + 1);
  expect(await count(page, 'released')).toBe(before.released + 1);
  await expect(page.getByTestId('admin-denials')).toContainText('Attempted pickup: Unlisted Visitor');
});
