// piezas-scenario: S-047 v=1
import { expect, test } from '../scenario-test';
import { signIn } from '../sign-in';

test('an instructor announces to an assigned group and parents reply privately', async ({ page }) => {
  // Jordan (Group 14) posts a new announcement to his group.
  await signIn(page, 'jordan.lee@example.test');
  await page.goto('/instructor/communications');
  const form = page.getByTestId('announcement-form');
  await form.getByTestId('announcement-input').fill('Hot chocolate break moves to 11:30 today.');
  await form.getByRole('button', { name: 'Post announcement' }).click();
  await expect(form.getByTestId('announcement-input')).toHaveValue('');

  // A Group 9 family never sees it.
  await signIn(page, 'dana.whitfield@example.test');
  await page.goto('/parent/communications');
  await expect(page.getByText('Hot chocolate break moves to 11:30 today.')).toHaveCount(0);

  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent/communications');
  await expect(page.getByText('Group 14 announcement').first()).toBeVisible();
  const announcement = page.getByTestId('announcement-ann_group14');
  await announcement.getByRole('button').click();
  await announcement.getByTestId('announcement-private-reply-ann_group14').fill('Will the meeting point be the same tomorrow?');
  await announcement.getByRole('button', { name: 'Reply privately' }).click();
  await expect(page.getByRole('status')).toHaveText('Private reply sent to your instructor.');
  const privateThread = page.getByTestId('conversation-msg_parent_ava');
  await privateThread.locator(':scope > .communication-toggle').click();
  await expect(privateThread.getByText('Will the meeting point be the same tomorrow?')).toBeVisible();
  await expect(announcement.getByText('Will the meeting point be the same tomorrow?')).toHaveCount(0);
});
