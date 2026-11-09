// piezas-scenario: S-014 v=8c9a3d231c37
// S-014: Medication held at the desk shows without the rest
//   Given a child's medication location is the desk and they also have a recorded condition
//   When desk staff open that child
//   Then they see "holds [medication] for this child" and not the condition
//
import { existsSync } from 'node:fs';
import { expect, test } from '../scenario-test';
import { demoPassword } from '../../lib/piezas-schema';
import { CHILD_IDS, DEMO_LESSON_DATE } from '../../lib/fixtures';

for (const file of ['.env.local', '.env']) if (!process.env.DEMO_ACCOUNT_SECRET && existsSync(file)) process.loadEnvFile(file);

test('S-014: the desk sees which medication it holds, but not the condition', async ({ page }) => {
  const secret = process.env.DEMO_ACCOUNT_SECRET;
  expect(secret, 'DEMO_ACCOUNT_SECRET must be configured for the test copy').toBeTruthy();
  const email = 'casey.morgan@example.test';
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(demoPassword(secret!, email));
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL('/');
  await page.goto(`/desk/children/${CHILD_IDS.noor}?day=${DEMO_LESSON_DATE}`);
  await expect(page.getByTestId('medication-held-indicator')).toHaveText('Holds Glucose gel for this child');
  await expect(page.getByTestId('pickup-page')).not.toContainText(/diabetes|shaky or pale/i);
});
