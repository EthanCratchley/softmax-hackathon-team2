import { expect, test } from '@playwright/test';

test('S-032: a link-authorized adult still requires a physical ID check (mock)', async ({ page }) => {
  await page.goto('/desk/children/lily');
  await page.getByTestId('adult-lily-grace').check();
  await expect(page.getByTestId('release-child')).toBeDisabled();
  await page.getByTestId('id-confirmation').check();
  await page.getByTestId('release-child').click();
  const record = page.getByTestId('release-record');
  await expect(record).toContainText('Grace Okafor');
  await expect(record).toContainText('Parent pickup link');
  await expect(record).toContainText('demo-lily-grace');
  await expect(record).toContainText('Jordan Ellis');
  await expect(record).toContainText('Confirmed');
  await expect(record.locator('time')).toHaveAttribute('datetime', /.+/);
  await expect(page.getByTestId('pickup-attendance')).toHaveText('Released');
  await expect(page.getByTestId('release-child')).toBeDisabled();
  await expect(page.getByTestId('release-blocked')).toContainText('already been released');
  await page.getByTestId('back-to-desk').click();
  await expect(page.getByTestId('status-lily')).toHaveText('Released');
  await expect(page.getByTestId('count-released')).toHaveText('2');
  await page.getByTestId('pickup-lily').click();
  await expect(page.getByTestId('release-record')).toHaveCount(1);
  await expect(page.getByTestId('release-child')).toBeDisabled();
});
