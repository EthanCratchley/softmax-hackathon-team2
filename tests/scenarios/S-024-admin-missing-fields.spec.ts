import { expect, test } from '@playwright/test';

test('S-024: Hana sees incomplete children and exact missing fields in the synthetic checklist', async ({ page }) => {
  await page.goto('/admin');
  await page.getByTestId('admin-lesson-day').selectOption('2026-12-13');
  await expect(page.getByTestId('incomplete-profiles').locator(':scope > li')).toHaveCount(2);
  await expect(page.getByTestId('missing-owen-contact2')).toHaveText('Second emergency contact with valid phone');
  await expect(page.getByTestId('missing-owen-consent')).toHaveText('Signed consent');
  await expect(page.getByTestId('incomplete-owen').locator('ul > li')).toHaveCount(2);
  await expect(page.getByTestId('missing-maya-address')).toHaveText('Mailing address');
  await expect(page.getByTestId('missing-maya-medications')).toHaveText('Medications answer or explicit none');
  await expect(page.getByTestId('missing-maya-pickup')).toHaveText('Active authorized pickup adult');
  await expect(page.getByTestId('incomplete-maya').locator('ul > li')).toHaveCount(3);
  for (const id of ['ava', 'lily', 'leo', 'sam']) await expect(page.getByTestId(`incomplete-${id}`)).toHaveCount(0);
  await expect(page.getByTestId('protected-child-details')).toHaveCount(0);
});
