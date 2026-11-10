import { expect, test } from './scenario-test';
import { CHILD_IDS, DEMO_LESSON_DATE } from '../lib/fixtures';
import { CASEY, openSection, saveProfile } from './parent-helpers';
import { signIn } from './sign-in';

test('fixing a newly added pickup adult edits that adult instead of adding a second one', async ({ page }) => {
  await signIn(page, 'leila.haddad@example.test');
  await page.goto(`/parent/children/${CHILD_IDS.ella}`);
  await openSection(page, 'section-contacts');
  const adding = page.getByTestId('new-pickup-adult');
  await adding.getByLabel('Full name').fill('Rosa Mendez-Haddadd');
  await adding.getByLabel('Relationship').fill('Neighbour');
  await saveProfile(page);

  // Without reloading, correct the typo on the adult that was just saved, and save again.
  const saved = page.locator('[data-testid^="pickup-adult-"]').filter({ has: page.locator('input[value="Rosa Mendez-Haddadd"]') });
  await expect(saved).toHaveCount(1);
  await saved.getByLabel('Full name').fill('Rosa Mendez-Haddad');
  await saveProfile(page);
  await expect(adding.getByLabel('Full name')).toHaveValue('');

  await signIn(page, CASEY);
  await page.goto(`/desk/children/${CHILD_IDS.ella}?day=${DEMO_LESSON_DATE}`);
  const adults = page.locator('[data-testid^="adult-adl_"]').locator('xpath=..');
  await expect(page.getByTestId('pickup-page')).toContainText('Rosa Mendez-Haddad');
  await expect(page.getByTestId('pickup-page')).not.toContainText('Rosa Mendez-Haddadd');
  expect(await adults.filter({ hasText: 'Rosa Mendez' }).count()).toBe(1);
});
