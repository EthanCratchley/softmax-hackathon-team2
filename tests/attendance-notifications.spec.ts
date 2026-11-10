import { expect, test } from './scenario-test';
import { signIn } from './sign-in';

test.skip(process.env.KESTREL_DATA !== 'mock', 'This workflow test must use the in-memory service mock.');

test('mock QR flow confirms server success, notifies the parent, and rejects repeat scans', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 375, height: 812 });
  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent');
  await page.getByRole('link', { name: /Open Ava.*profile/ }).click();
  const dropoffCode = (await page.getByTestId('dropoff-pass-code').innerText()).replace(/\s/g, '');
  await page.context().clearCookies();

  await signIn(page, 'casey.morgan@example.test');
  await page.goto('/desk/scan');
  await page.getByTestId('pass-input').fill(dropoffCode);
  await page.getByTestId('pass-lookup').click();
  await page.getByTestId('pass-bib-number').fill('7');
  await page.getByTestId('pass-redeem').click();
  const confirmed = page.getByTestId('scan-confirmation');
  await expect(confirmed).toContainText('Drop-Off Confirmed');
  await expect(confirmed).toContainText('Ava');
  await expect(confirmed.locator('time')).toHaveAttribute('datetime', /2026/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.getByRole('button', { name: 'Scan another pass' }).click();
  await page.getByTestId('pass-input').fill(dropoffCode);
  await page.getByTestId('pass-lookup').click();
  const failure = page.getByTestId('scan-failure');
  await expect(failure).toContainText('Pass Not Confirmed');
  await expect(failure).toContainText('already been used');
  await expect(failure.getByRole('link', { name: 'Get staff assistance' })).toHaveAttribute('href', '/desk');

  await page.context().clearCookies();
  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent/communications');
  const notification = page.getByTestId('attendance-notification-checkin:att_ava');
  await expect(notification).toContainText('Ava · Checked In');
  await expect(notification.locator('time')).toBeVisible();

  await page.goto('/parent');
  await page.getByRole('link', { name: /Open Ava.*profile/ }).click();
  await page.getByRole('button', { name: 'Pick-up', exact: true }).click();
  const pickupCode = (await page.getByTestId('pickup-pass-code').innerText()).replace(/\s/g, '');
  await page.context().clearCookies();

  await signIn(page, 'casey.morgan@example.test');
  await page.goto('/desk/scan');
  await page.getByTestId('pass-input').fill(pickupCode);
  await page.getByTestId('pass-lookup').click();
  await page.getByTestId('pass-id-check').check();
  await page.getByTestId('pass-redeem').click();
  const released = page.getByTestId('scan-confirmation');
  await expect(released).toContainText('Pick-Up Confirmed');
  await expect(released).toContainText('Released to Priya Shah');

  await page.context().clearCookies();
  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent/communications');
  const releaseNotice = page.getByTestId(/^attendance-notification-release:/).first();
  await expect(releaseNotice).toContainText('Ava · Released');
  await expect(releaseNotice).toContainText('Picked up by Priya Shah');
});

test('invalid scan shows a safe reason and retry option', async ({ page }) => {
  await signIn(page, 'casey.morgan@example.test');
  await page.goto('/desk/scan');
  await page.getByTestId('pass-input').fill('00000000');
  await page.getByTestId('pass-lookup').click();
  const failure = page.getByTestId('scan-failure');
  await expect(failure).toContainText('No active pass matches that code for today.');
  await expect(failure.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(failure).not.toContainText('Ava');
});
