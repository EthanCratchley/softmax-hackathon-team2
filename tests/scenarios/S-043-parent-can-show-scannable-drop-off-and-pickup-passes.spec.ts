// piezas-scenario: S-043 v=5663ad0a4ab7
import { expect, test } from '@playwright/test';

async function signIn(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill('kestrel');
  await page.getByTestId('login-submit').click();
}

test('S-043: A parent can show scannable drop-off and pickup passes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent/children/chd_ava');

  const dropoffCode = page.getByTestId('dropoff-pass-code');
  await expect(dropoffCode).toHaveText(/^\d{4} \d{4}$/);
  await expect(page.getByAltText('dropoff QR pass for Ava')).toBeVisible();
  await expect(page.getByText(/Valid until/)).toBeVisible();
  const savedDropoffCode = await dropoffCode.innerText();

  await page.reload();
  await expect(page.getByTestId('dropoff-pass-code')).toHaveText(savedDropoffCode);
  await page.getByRole('button', { name: 'Pick-up', exact: true }).click();
  await expect(page.getByAltText('pickup QR pass for Ava')).toBeVisible();
  await expect(page.getByTestId('pickup-pass-code')).toHaveText(/^\d{4} \d{4}$/);
  await expect(page.getByLabel('Authorized adult')).toHaveValue('adl_ava_priya');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
