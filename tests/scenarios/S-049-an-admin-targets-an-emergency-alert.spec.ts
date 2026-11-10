// piezas-scenario: S-049 v=1
import { expect, test } from '@playwright/test';
import { signIn } from '../sign-in';

test('an admin targets an emergency alert to selected groups', async ({ page }) => {
  await signIn(page, 'hana.sato@example.test');
  await page.goto('/admin/communications');
  await page.locator('input[name="groupIds"][value="grp_09"]').uncheck();
  await page.locator('[name="title"]').fill('Group 14 pickup update');
  await page.locator('[name="reason"]').fill('A weather change requires early pickup.');
  await page.locator('[name="pickupLocation"]').fill('South entrance');
  await page.locator('[name="pickupTime"]').fill('12:30 p.m.');
  await page.locator('[name="instructions"]').fill('Collect your child from the desk; staff will check photo ID.');
  await page.getByRole('button', { name: 'Create urgent alert' }).click();
  const alert = page.getByTestId(/^admin-alert-alert_/).filter({ hasText: 'Group 14 pickup update' }).first();
  await expect(alert).toContainText('3 targeted · 0 viewed · 0 acknowledged');
  await alert.getByRole('button').click();
  await expect(alert.getByText('Priya Shah')).toBeVisible();
  await expect(alert.getByText('Ngozi Okafor')).toBeVisible();
  await expect(alert.getByText('Leila Haddad')).toBeVisible();
  await expect(alert.getByText('Dana Whitfield')).toHaveCount(0);
});
