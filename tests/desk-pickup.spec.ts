import { expect, test } from '@playwright/test';

test('only active, lesson-day-valid adults appear; ID confirmation resets when selection changes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/desk/children/lily');
  await expect(page.getByTestId('pickup-child-name')).toHaveText('Lily Whitfield');
  await expect(page.getByTestId('pickup-child-details')).toContainText('Little Kestrels · Bib 11');
  await expect(page.getByTestId('adult-lily-expired')).toHaveCount(0);
  await expect(page.getByTestId('adult-lily-cancelled')).toHaveCount(0);
  await expect(page.getByTestId('adult-lily-future')).toHaveCount(0);
  await expect(page.getByTestId('adult-ava-parent')).toHaveCount(0);
  await page.getByTestId('adult-lily-parent').check();
  await page.getByTestId('id-confirmation').check();
  await expect(page.getByTestId('release-child')).toBeEnabled();
  await page.getByTestId('adult-lily-grace').check();
  await expect(page.getByTestId('id-confirmation')).not.toBeChecked();
  await expect(page.getByTestId('release-child')).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('roster check-in carries its bib to pickup and release carries back to roster', async ({ page }) => {
  await page.goto('/desk');
  await page.getByTestId('bib-ava').fill('15');
  await page.getByTestId('check-in-ava').click();
  await page.getByTestId('pickup-ava').click();
  await expect(page.getByTestId('pickup-child-details')).toContainText('Bib 15');
  await expect(page.getByTestId('pickup-attendance')).toHaveText('Checked in');
  await page.getByTestId('adult-ava-parent').check();
  await page.getByTestId('id-confirmation').check();
  await page.getByTestId('release-child').click();
  await expect(page.getByTestId('release-record')).toContainText('Jamie Chen');
  await expect(page.getByTestId('release-record')).toContainText('Parent pickup list');
  await page.getByTestId('back-to-desk').click();
  await expect(page.getByTestId('status-ava')).toHaveText('Released');
  await page.getByTestId('pickup-ava').click();
  await expect(page.getByTestId('release-record')).toHaveCount(1);
  await expect(page.getByTestId('release-child')).toBeDisabled();
});

test('open incident, expected attendance, expired authorization and prior release block pickup', async ({ page }) => {
  await page.goto('/desk/children/owen');
  await expect(page.getByTestId('release-blocked')).toContainText('Call patrol');
  await expect(page.getByTestId('release-child')).toBeDisabled();
  await expect(page.getByTestId('release-record')).toHaveCount(0);
  await page.goto('/desk/children/ava');
  await expect(page.getByTestId('release-blocked')).toContainText('check this child in');
  await expect(page.getByTestId('release-child')).toBeDisabled();
  await page.goto('/desk');
  await page.getByTestId('bib-maya').fill('24');
  await page.getByTestId('check-in-maya').click();
  await page.getByTestId('pickup-maya').click();
  await expect(page.getByTestId('no-authorized-adults')).toBeVisible();
  await expect(page.getByTestId('release-blocked')).toContainText('no active authorization');
  await expect(page.getByTestId('release-child')).toBeDisabled();
  await page.goto('/desk/children/leo');
  await expect(page.getByTestId('release-record')).toContainText('Casey Martin');
  await expect(page.getByTestId('release-blocked')).toContainText('already been released');
  await expect(page.getByTestId('release-child')).toBeDisabled();
});

test('second lesson day keeps its date and located-incident guidance', async ({ page }) => {
  await page.goto('/desk');
  await page.getByTestId('lesson-day').selectOption('2026-12-13');
  await page.getByTestId('bib-sam').fill('14');
  await page.getByTestId('check-in-sam').click();
  await page.getByTestId('pickup-sam').click();
  await expect(page).toHaveURL(/sam\?day=2026-12-13/);
  await expect(page.getByTestId('incident-located')).toContainText('Refer family questions to Hana');
  await page.getByTestId('adult-sam-parent').check();
  await page.getByTestId('id-confirmation').check();
  await page.getByTestId('release-child').click();
  await expect(page.getByTestId('release-record')).toContainText('2026-12-13');
  await page.getByTestId('back-to-desk').click();
  await expect(page.getByTestId('lesson-day')).toHaveValue('2026-12-13');
  await expect(page.getByTestId('status-sam')).toHaveText('Released');
});

test('unknown children and mismatched lesson days return not found', async ({ page }) => {
  const unknown = await page.goto('/desk/children/unknown');
  expect(unknown?.status()).toBe(404);
  const wrongDay = await page.goto('/desk/children/lily?day=2026-12-13');
  expect(wrongDay?.status()).toBe(404);
});
