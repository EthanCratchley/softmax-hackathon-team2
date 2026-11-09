// piezas-scenario: S-009 v=a0676f2a6c20
// S-009: Desk finds a child by any name and checks them in
//   Given Owen is expected today, listed as Owen Parr and also known as Owen Okafor-Parr, and his profile needs information
//   When desk staff search "Okafor" and check him in with bib 14
//   Then the time, staff member and bib are saved, he shows as checked in, and a "Needs information" flag appears with no medical details
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { expect, test } from '../scenario-test';
import { CHILD_IDS, DEMO_LESSON_DATE } from '../../lib/fixtures';
import { signIn } from '../sign-in';

test('S-009: desk finds Owen by another name and checks him in with bib 14', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await signIn(page, 'casey.morgan@example.test');
  await page.goto(`/desk?day=${DEMO_LESSON_DATE}`);
  await page.getByTestId('roster-search').fill('Okafor');
  await expect(page.getByTestId(`child-${CHILD_IDS.owen}`)).toBeVisible();
  await expect(page.getByTestId(`child-${CHILD_IDS.ava}`)).toHaveCount(0);
  await expect(page.getByTestId(`profile-${CHILD_IDS.owen}`)).toContainText('Needs information');

  await page.getByTestId(`pickup-${CHILD_IDS.owen}`).click();
  await page.getByTestId('bib-number').fill('14');
  await page.getByTestId('check-in-child').click();
  await expect(page.getByTestId('pickup-attendance')).toHaveText('Checked in');
  await expect(page.getByTestId('pickup-check-in-bib')).toHaveText('14');
  await expect(page.getByTestId('pickup-check-in-time')).toHaveAttribute('datetime', /\d{4}-\d{2}-\d{2}T/);
  await expect(page.getByTestId('pickup-page')).toContainText('Needs information');
  await expect(page.getByTestId('pickup-page')).not.toContainText(/asthma|inhaler/i);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
