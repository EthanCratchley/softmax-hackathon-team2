// piezas-scenario: S-045 v=1
import { expect, test } from '@playwright/test';
import { signIn } from '../sign-in';

test('a parent starts a private instructor conversation', async ({ page }) => {
  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent/communications');
  await page.getByTestId('message-child-select').selectOption('chd_ava');
  await page.getByTestId('new-message-input').fill('Could you confirm the meeting point?');
  await page.getByTestId('new-conversation-form').getByRole('button', { name: 'Start private conversation' }).click();
  const thread = page.getByTestId('conversation-msg_parent_ava');
  await thread.getByRole('button').first().click();
  await expect(thread.getByText('Could you confirm the meeting point?')).toBeVisible();
  await expect(page.getByText('Dana Whitfield')).toHaveCount(0);
});
