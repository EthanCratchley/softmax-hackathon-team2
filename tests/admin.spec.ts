import { expect, test } from '@playwright/test';

test('admin shows spec-supported operational warnings without child details in headcount flags', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/admin');
  await expect(page.getByTestId('admin-headcounts')).toContainText('Snow Owls');
  await expect(page.getByTestId('admin-headcounts')).toContainText('more than 10 minutes overdue');
  await expect(page.getByTestId('admin-headcounts')).not.toContainText('Owen');
  await expect(page.getByTestId('admin-contact-warnings')).toContainText('Instructor not responding: try the radio');
  await expect(page.getByTestId('admin-contact-warnings')).not.toContainText('battery');
  await expect(page.getByTestId('admin-failed-emails')).toContainText('Lily Whitfield · Check-in');
  await expect(page.getByTestId('admin-notice-tasks')).toContainText('Mail emergency disclosure notice · Owen Parr');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByTestId('admin-lesson-day').selectOption('2026-12-19');
  await expect(page.getByTestId('admin-headcounts').locator('li')).toHaveCount(0);
  await expect(page.getByTestId('admin-contact-warnings').locator('li')).toHaveCount(0);
  await expect(page.getByTestId('admin-failed-emails').locator('li')).toHaveCount(0);
  await expect(page.getByTestId('admin-notice-tasks').locator('li')).toHaveCount(0);
});

test('admin assigns existing children and instructors without duplicating memberships', async ({ page }) => {
  await page.goto('/admin');
  const group = '2026-12-12-snow-owls';
  await page.getByTestId('assign-child').selectOption('lily');
  await page.getByTestId('assign-child-group').selectOption(group);
  await page.getByTestId('save-child-assignment').click();
  await expect(page.getByTestId(`group-count-${group}`)).toHaveText('3/6');
  await expect(page.getByTestId(`group-${group}`)).toContainText('Lily Whitfield');
  await page.getByTestId('save-child-assignment').click();
  await expect(page.getByTestId(`group-count-${group}`)).toHaveText('3/6');
  await page.getByTestId('assign-instructor-group').selectOption(group);
  await page.getByTestId('assign-instructor').selectOption('demo-instructor-c');
  await page.getByTestId('save-instructor-assignment').click();
  await expect(page.getByTestId(`group-instructor-${group}`)).toHaveText('Demo instructor C');
  await page.reload();
  await expect(page.getByTestId(`group-count-${group}`)).toHaveText('2/6');
  await expect(page.getByTestId(`group-instructor-${group}`)).toHaveText('Demo instructor A');
});

test('a reasoned correction can be added beside an access log without replacing it', async ({ page }) => {
  await page.goto('/admin');
  await page.getByTestId('details-child').selectOption('ava');
  await page.getByTestId('details-reason').fill('Parent follow-up.');
  await page.getByTestId('open-child-details').click();
  const original = page.getByTestId('original-access-0');
  const before = await original.innerText();
  await page.getByTestId('correction-target').selectOption('access:0');
  await page.getByTestId('correction-note').fill('Clarification: question came from a guardian.');
  await page.getByTestId('correction-reason').fill('Clarify the original reason.');
  await page.getByTestId('add-correction').click();
  await expect(original).toHaveText(before, { useInnerText: true });
  await expect(page.getByTestId('admin-access-entry')).toContainText('Clarification: question came from a guardian.');
});
