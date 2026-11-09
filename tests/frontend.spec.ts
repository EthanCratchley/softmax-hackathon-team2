import { expect, test } from '@playwright/test';

test('the frontend starter renders each team workspace on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const response = await page.goto('/');
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Every child accounted for.');
  await expect(page.getByTestId('login-form')).toBeVisible();
  await expect(page.getByTestId('email')).toBeVisible();
  await expect(page.getByTestId('password')).toBeVisible();
  await expect(page.getByTestId('sign-in')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
