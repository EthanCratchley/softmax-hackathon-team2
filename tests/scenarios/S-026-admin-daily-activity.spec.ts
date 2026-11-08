import { expect, test } from '@playwright/test';

test('S-026: daily counts, incidents and denied pickups follow the selected mock lesson day', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByTestId('admin-count-expected')).toHaveText('3');
  await expect(page.getByTestId('admin-count-checkedIn')).toHaveText('1');
  await expect(page.getByTestId('admin-count-released')).toHaveText('1');
  await expect(page.getByTestId('admin-count-missing')).toHaveText('1');
  await expect(page.getByTestId('incident-owen')).toContainText('Owen Parr');
  await expect(page.getByTestId('admin-denial')).toContainText('Lily Whitfield · Mark Whitfield');
  await page.getByTestId('admin-lesson-day').selectOption('2026-12-13');
  await expect(page.getByTestId('admin-count-expected')).toHaveText('1');
  await expect(page.getByTestId('admin-count-missing')).toHaveText('0');
  await expect(page.getByTestId('admin-denial')).toHaveCount(0);
  await expect(page.getByTestId('incident-owen')).toHaveCount(0);
  await page.getByTestId('admin-lesson-day').selectOption('2026-12-19');
  for (const key of ['expected', 'checkedIn', 'released', 'missing']) await expect(page.getByTestId(`admin-count-${key}`)).toHaveText('0');
});
