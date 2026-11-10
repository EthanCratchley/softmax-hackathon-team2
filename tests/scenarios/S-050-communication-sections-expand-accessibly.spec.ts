// piezas-scenario: S-050 v=1
import { expect, test } from '../scenario-test';
import { signIn } from '../sign-in';

test('communication sections expand with keyboard and respect reduced motion', async ({ page }) => {
  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent/communications');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const alertToggle = page.getByTestId('emergency-alert-alert_early_dismissal_demo').locator(':scope > .communication-toggle');
  expect((await alertToggle.boundingBox())?.height).toBeGreaterThanOrEqual(48);
  const announcement = page.getByTestId('announcement-ann_group14');
  const toggle = announcement.locator(':scope > .communication-toggle');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(announcement.locator('.communication-chevron')).toHaveClass(/is-open/);
  await expect.poll(async () => Number.parseFloat(await announcement.locator('.communication-chevron').evaluate((element) => getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(0.001);
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
