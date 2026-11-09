// piezas-scenario: S-042 v=27bf8d4c2c6e
// S-042: A parent sees their child's drop-off and pickup history
//   Given a parent with one linked child who has a check-in and release record
//   When the parent opens that child's lesson activity
//   Then they see the check-in time, release time and authorized pickup adult, with the latest event first and no unrelated child's activity
//
import { expect, test } from '@playwright/test';
import { ADULT_IDS, CHILD_IDS, DEMO_LESSON_DATE } from '../../lib/fixtures';
import { signIn } from '../sign-in';

test("S-042: a parent sees their child's drop-off and pick-up, latest first, and nothing about other children", async ({ page }) => {
  // Lily is already checked in (seed). The desk releases her to her father.
  await signIn(page, 'casey.morgan@example.test');
  await page.goto(`/desk/children/${CHILD_IDS.lily}?day=${DEMO_LESSON_DATE}`);
  await page.getByTestId(`adult-${ADULT_IDS.lilyFather}`).check();
  await page.getByTestId('id-confirmation').check();
  await page.getByTestId('release-child').click();
  await expect(page.getByTestId('release-record')).toContainText('Tom Whitfield');

  await signIn(page, 'dana.whitfield@example.test');
  await page.goto(`/parent/children/${CHILD_IDS.lily}`);
  const events = page.getByTestId('activity-list').locator('li');
  await expect(events).toHaveCount(2);
  await expect(page.getByTestId('activity-list')).toContainText('Picked up by Tom Whitfield');
  await expect(page.getByTestId('activity-list')).toContainText('Dropped off');
  // Newest first, by the recorded times (the seeded check-in is dated on lesson day).
  const times = await events.locator('time').evaluateAll((nodes) => nodes.map((n) => Date.parse(n.getAttribute('datetime') ?? '')));
  expect(times.every((t) => !Number.isNaN(t))).toBe(true);
  expect(times).toEqual([...times].sort((a, b) => b - a));
  await expect(page.getByTestId('parent-child-page')).not.toContainText(/Ava|Owen|Noor/);
});
