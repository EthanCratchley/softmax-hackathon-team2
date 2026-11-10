// piezas-scenario: S-046 v=1
import { expect, test } from '../scenario-test';
import { signIn } from '../sign-in';

test('an instructor replies privately to a parent', async ({ page }) => {
  await signIn(page, 'jordan.lee@example.test');
  await page.goto('/instructor/communications');
  const thread = page.getByTestId('conversation-msg_parent_ava');
  await thread.getByRole('button').first().focus();
  await page.keyboard.press('Enter');
  await thread.getByTestId('reply-input-msg_parent_ava').fill('Meet at the green trail map.');
  await thread.getByTestId('reply-send-msg_parent_ava').click();
  await expect(thread.getByText('Meet at the green trail map.')).toBeVisible();
  await expect(page.getByText('Dana Whitfield')).toHaveCount(0);
});
