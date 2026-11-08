import { expect, test } from '@playwright/test';

test('S-012: an unlisted adult is denied without releasing the child (mock)', async ({ page }) => {
  await page.goto('/desk/children/lily');
  await page.getByTestId('denial-name').fill('Mark Whitfield');
  await page.getByTestId('record-denial').click();
  await expect(page.getByTestId('denial-message')).toContainText('Release blocked');
  await expect(page.getByTestId('denial-record')).toContainText('Mark Whitfield');
  await expect(page.getByTestId('denial-record')).toContainText('Jordan Ellis');
  await expect(page.getByTestId('denial-record')).toContainText('Contact an authorized parent or Hana');
  await expect(page.getByTestId('denial-record').locator('time')).toHaveAttribute('datetime', /.+/);
  await expect(page.getByTestId('release-record')).toHaveCount(0);
  await expect(page.getByTestId('pickup-attendance')).toHaveText('Checked in');
  await expect(page.getByTestId('release-child')).toBeDisabled();
  await page.getByTestId('back-to-desk').click();
  await page.getByTestId('pickup-lily').click();
  await expect(page.getByTestId('denial-record')).toHaveCount(1);
  await page.reload();
  await expect(page.getByTestId('denial-record')).toHaveCount(0);
});
