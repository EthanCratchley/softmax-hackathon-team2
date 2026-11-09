// piezas-scenario: S-007 v=477a096fa124
// S-007: The instructor screens work in gloves
//   Given an instructor on a 375-pixel-wide phone screen
//   When they open their roster
//   Then nothing scrolls sideways, tap targets are at least 48 pixels, and each child's missing-report button is one tap away
import { expect, test, type Page } from '../scenario-test';
import { DAY, JORDAN, signInAs } from '../safety-helpers';

const noSideScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

async function tall(page: Page, testId: string) {
  const box = await page.getByTestId(testId).boundingBox();
  expect(box, testId).not.toBeNull();
  expect(box!.height, testId).toBeGreaterThanOrEqual(48);
}

test('S-007: The instructor screens work in gloves', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await signInAs(page, JORDAN);
  await page.goto(`/instructor?day=${DAY}`);
  await expect(page.getByTestId('group-grp_14')).toBeVisible();
  expect(await noSideScroll(page)).toBe(true);

  // Ava and Ella never have an incident opened by other scenarios, so their buttons are always there.
  for (const id of ['report-chd_ava', 'report-chd_ella', 'lesson-day', 'lesson-day-go']) await tall(page, id);

  await page.getByTestId('report-chd_ava').click();
  await expect(page.getByTestId('missing-report-form')).toBeVisible();
  expect(await noSideScroll(page)).toBe(true);
  for (const id of ['last-seen-at', 'lastSeenLocation', 'clothingDescription', 'equipmentDescription', 'notes', 'submit-report', 'back-to-roster']) await tall(page, id);
});
