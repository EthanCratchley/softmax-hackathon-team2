// piezas-scenario: S-048 v=1
import { expect, test } from '../scenario-test';
import { signIn } from '../sign-in';

test('a parent expands and acknowledges an emergency alert', async ({ page }) => {
  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent/communications');
  const alert = page.getByTestId('emergency-alert-alert_early_dismissal_demo');
  await alert.getByRole('button').click();
  for (const detail of ['A weather change has made it necessary to end lessons early.', 'Kestrel Kids base lodge, south entrance', '12:30 p.m. today', 'Staff will release children only to an active authorized adult after checking photo ID.', '(604) 555-0142']) await expect(alert.getByText(detail)).toBeVisible();
  await alert.getByTestId('acknowledge-alert_early_dismissal_demo').click();
  await expect(alert.getByRole('status')).toContainText('Acknowledged');
});
