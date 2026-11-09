// piezas-scenario: S-010 v=aadc9ddc311f
// S-010: Desk sees the pickup list and no medical details
//   Given Ava is checked in and has a recorded allergy
//   When desk staff open her pickup screen and also request her medical record directly from the server
//   Then they see only her active adults and state, and the medical request is refused
import { expect, test } from '../scenario-test';
import { ADULT_IDS, CHILD_IDS, DEMO_LESSON_DATE } from '../../lib/fixtures';
import { CASEY, openSection, PRIYA, saveProfile } from '../parent-helpers';
import { signIn } from '../sign-in';

test('S-010: desk sees active pickup adults and state, never medical details', async ({ page }) => {
  await signIn(page, PRIYA);
  await page.goto(`/parent/children/${CHILD_IDS.ava}`);
  await openSection(page, 'section-medical');
  await page.getByTestId('allergies').getByLabel('Add details').check();
  await page.getByTestId('allergies').locator('textarea').fill('Tree nuts');
  await saveProfile(page);

  await signIn(page, CASEY);
  // Ava is not checked in here: S-044 checks her in with a drop-off pass later in the same run.
  await page.goto(`/desk/children/${CHILD_IDS.ava}?day=${DEMO_LESSON_DATE}`);
  await expect(page.getByTestId('pickup-child-name')).toHaveText('Ava Shah');
  await expect(page.getByTestId('pickup-attendance')).toHaveText(/Expected|Checked in|Released/);
  await expect(page.getByTestId(`adult-${ADULT_IDS.avaMother}`)).toBeVisible();
  await expect(page.locator('[data-testid^="adult-adl_"]')).toHaveCount(1);
  const body = page.getByTestId('pickup-page');
  for (const hidden of [/tree nut/i, /allerg/i, /EpiPen/i, /Jacket right pocket/i, /604-555/]) await expect(body).not.toContainText(hidden);

  // Asking for the medical record directly is refused: the parent route sends desk staff away.
  await page.goto(`/parent/children/${CHILD_IDS.ava}`);
  await expect(page).not.toHaveURL(/\/parent\//);
  await expect(page.locator('body')).not.toContainText(/tree nut/i);
  await expect(page.getByTestId('parent-profile-form')).toHaveCount(0);
});
