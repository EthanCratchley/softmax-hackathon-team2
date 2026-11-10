// piezas-scenario: S-047 v=1
import { expect, test } from '@playwright/test';
import { signIn } from '../sign-in';

test('an instructor announces to an assigned group and parents reply privately', async ({ page }) => {
  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent/communications');
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
