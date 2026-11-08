import { expect, test } from '@playwright/test';

test('S-027: a correction requires a reason and leaves the original mock pickup unchanged', async ({ page }) => {
  await page.goto('/admin');
  const original = page.getByTestId('original-release-leo');
  const before = await original.innerText();
  await page.getByTestId('correction-target').selectOption('pickup:0');
  await page.getByTestId('correction-note').fill('Desk note: confirm the recorded release time with staff.');
  await expect(page.getByTestId('add-correction')).toBeDisabled();
  await page.getByTestId('correction-reason').fill('Reconcile a reported timing discrepancy.');
  await page.getByTestId('add-correction').click();
  await expect(original).toHaveText(before, { useInnerText: true });
  await expect(page.getByTestId('admin-correction')).toContainText('Reconcile a reported timing discrepancy.');
  await expect(page.getByTestId('admin-correction')).toContainText('Hana Sato (demo admin)');
  await expect(page.getByTestId('admin-correction').locator('time')).toHaveAttribute('datetime', /.+/);
  await page.reload();
  await expect(page.getByTestId('admin-correction')).toHaveCount(0);
  await expect(original).toHaveText(before, { useInnerText: true });
});
