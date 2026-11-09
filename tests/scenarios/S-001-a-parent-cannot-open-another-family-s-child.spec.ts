// piezas-scenario: S-001 v=98217f02599a
// S-001: A parent cannot open another family's child
//   Given Ava's parent is signed in and Lily belongs to another family
//   When Ava's parent opens the address of Lily's profile, or sends Lily's ID to the server
//   Then they see "not found" and none of Lily's details
import { expect, test } from '@playwright/test';
import { CHILD_IDS } from '../../lib/fixtures';
import { PRIYA } from '../parent-helpers';
import { signIn } from '../sign-in';

test("S-001: Ava's parent opening Lily's address sees not found", async ({ page }) => {
  await signIn(page, PRIYA);
  await page.goto(`/parent/children/${CHILD_IDS.lily}`);
  await expect(page.locator('body')).toContainText(/could not be found/i);
  for (const hidden of ['Lily', 'Whitfield', '604-555-0111', 'Cedar Road']) await expect(page.locator('body')).not.toContainText(hidden);
  await page.goto('/parent');
  await expect(page.getByTestId(`child-card-${CHILD_IDS.lily}`)).toHaveCount(0);
});

test("S-001: sending Lily's ID to the server from Ava's form is refused as not found", async ({ page }) => {
  await signIn(page, PRIYA);
  await page.goto(`/parent/children/${CHILD_IDS.ava}`);
  // Rewrite the save request so the server action receives Lily's ID instead of Ava's.
  let rewritten = false;
  await page.route(`**/parent/children/${CHILD_IDS.ava}`, async (route) => {
    const body = route.request().postData();
    if (route.request().method() !== 'POST' || !body?.includes(CHILD_IDS.ava)) return route.continue();
    rewritten = true;
    await route.continue({ postData: body.replaceAll(CHILD_IDS.ava, CHILD_IDS.lily) });
  });
  await page.getByTestId('save-profile').click();
  await expect(page.getByTestId('save-error')).toHaveText('Not found.');
  expect(rewritten).toBe(true);
  await expect(page.getByTestId('save-ok')).toHaveCount(0);
  for (const hidden of ['Lily', 'Whitfield', '604-555-0111']) await expect(page.locator('body')).not.toContainText(hidden);
});
