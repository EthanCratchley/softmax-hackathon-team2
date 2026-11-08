import { expect, test } from '@playwright/test';

test('released roster cards show coherent synthetic attendance history', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/desk');
  await expect(page.getByTestId('check-in-time-leo').locator('time')).toHaveAttribute('datetime', '2026-12-12T09:12:00-08:00');
  await expect(page.getByTestId('check-in-staff-leo')).toHaveText('Jordan Ellis (demo desk staff)');
  await expect(page.getByTestId('attendance-incomplete-leo')).toHaveCount(0);
  await expect(page.getByTestId('check-in-details-leo')).toContainText('Bib 23');
  await expect(page.getByTestId('release-time-leo').locator('time')).toHaveAttribute('datetime', '2026-12-12T14:55:00-08:00');
  await expect(page.getByTestId('release-staff-leo')).toHaveText('Jordan Ellis (demo desk staff)');
  await expect(page.getByTestId('release-adult-leo')).toHaveText('Casey Martin');
  await expect(page.getByTestId('release-source-leo')).toHaveText('Parent pickup list');

  await page.getByTestId('pickup-lily').click();
  await page.getByTestId('adult-lily-grace').check();
  await page.getByTestId('id-confirmation').check();
  await page.getByTestId('release-child').click();
  const releaseTime = await page.getByTestId('release-record').locator('time').getAttribute('datetime');
  await page.getByTestId('back-to-desk').click();
  await expect(page.getByTestId('status-lily')).toHaveText('Released');
  await expect(page.getByTestId('check-in-details-lily')).toContainText('Bib 11');
  await expect(page.getByTestId('check-in-time-lily').locator('time')).toHaveAttribute('datetime', '2026-12-12T09:05:00-08:00');
  await expect(page.getByTestId('check-in-staff-lily')).toHaveText('Jordan Ellis (demo desk staff)');
  await expect(page.getByTestId('release-time-lily').locator('time')).toHaveAttribute('datetime', releaseTime!);
  await expect(page.getByTestId('release-staff-lily')).toHaveText('Jordan Ellis (demo desk staff)');
  await expect(page.getByTestId('release-adult-lily')).toHaveText('Grace Okafor');
  await expect(page.getByTestId('release-source-lily')).toHaveText('Parent pickup link');
  await expect(page.getByTestId('attendance-incomplete-lily')).toHaveCount(0);
  await expect(page.getByTestId('attendance-incomplete-leo')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
