import { expect, test } from '@playwright/test';

test('S-029: every protected mock opening needs a reason and logs child, staff and time', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByTestId('protected-child-details')).toHaveCount(0);
  await page.getByTestId('details-child').selectOption('ava');
  await page.getByTestId('details-reason').fill('   ');
  await expect(page.getByTestId('open-child-details')).toBeDisabled();
  await expect(page.getByTestId('admin-access-entry')).toHaveCount(0);
  await page.getByTestId('details-reason').fill('Follow up on a parent question.');
  await page.getByTestId('open-child-details').click();
  await expect(page.getByTestId('protected-child-details')).toContainText('Ava Chen');
  await expect(page.getByTestId('protected-child-details')).toContainText('value not supplied');
  await expect(page.getByTestId('admin-access-entry')).toContainText('Ava Chen (ava)');
  await expect(page.getByTestId('admin-access-entry')).toContainText('Hana Sato (demo admin)');
  await expect(page.getByTestId('admin-access-entry')).toContainText('Follow up on a parent question.');
  await expect(page.getByTestId('admin-access-entry').locator('time')).toHaveAttribute('datetime', /.+/);
  await page.getByTestId('close-child-details').click();
  await expect(page.getByTestId('protected-child-details')).toHaveCount(0);
  await expect(page.getByTestId('open-child-details')).toBeDisabled();
  await page.getByTestId('details-reason').fill('A second documented opening.');
  await page.getByTestId('open-child-details').click();
  await expect(page.getByTestId('admin-access-entry')).toHaveCount(2);
  await page.getByTestId('admin-lesson-day').selectOption('2026-12-13');
  await expect(page.getByTestId('protected-child-details')).toHaveCount(0);
});
