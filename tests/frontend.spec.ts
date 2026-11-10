import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { demoPassword } from '../lib/piezas-schema';
import { signIn } from './sign-in';

if (!process.env.DEMO_ACCOUNT_SECRET && existsSync('.env')) process.loadEnvFile('.env');

test('signed-out visitors land on sign-in, which fits a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const response = await page.goto('/');
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign in');
  await expect(page.getByTestId('current-user')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const id of ['login-email', 'login-password', 'login-submit']) {
    const box = await page.getByTestId(id).boundingBox();
    expect(box!.height, id).toBeGreaterThanOrEqual(48);
  }
});

test('each role signs in and sees only its own authorized summary', async ({ page }) => {
  const secret = process.env.DEMO_ACCOUNT_SECRET;
  expect(secret, 'DEMO_ACCOUNT_SECRET must be set (in .env) for the sign-in check').toBeTruthy();
  const cases = [
    ['priya.shah@example.test', 'Priya Shah · Parent', 'Some required details are missing. Review the list and update each child’s profile before lesson day.'],
    ['jordan.lee@example.test', 'Jordan Lee · Instructor', 'Group 14 · 3 children · 1 with safety alerts'],
    ['casey.morgan@example.test', 'Casey Morgan · Desk', '6 expected · 1 checked in · 0 released'],
    ['rob.fournier@example.test', 'Rob Fournier · Patrol', '0 open incident(s)'],
    ['hana.sato@example.test', 'Hana Sato · Admin', '4 child profile(s) need information'],
  ];
  for (const [email, who, summary] of cases) {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(demoPassword(secret!, email));
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('current-user')).toHaveText(who);
    await expect(page.getByTestId('home-summary')).toHaveText(summary);
    await page.getByTestId('sign-out').click();
    await expect(page).toHaveURL(/\/login$/);
  }
});

test('a wrong password shows an error and no session', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-email').fill('priya.shah@example.test');
  await page.getByTestId('login-password').fill('definitely-wrong');
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('login-error')).toBeVisible();
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});

test('a parent and assigned instructor exchange a private message that survives refresh and account change', async ({ page }) => {
  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent/communications');
  await page.getByTestId('message-child-select').selectOption('chd_ava');
  await page.getByTestId('new-message-input').fill('Synthetic persistence check from parent.');
  await page.getByTestId('new-conversation-form').getByRole('button', { name: 'Start private conversation' }).click();
  const thread = page.locator('[data-testid^="conversation-conv_"]').first();
  await expect(thread).toBeVisible();

  await signIn(page, 'jordan.lee@example.test');
  await expect(page.getByTestId('messages-nav-link')).toHaveAttribute('aria-label', 'Messages, 1 unread item');
  await page.goto('/instructor/communications');
  const instructorThread = page.locator('[data-testid^="conversation-conv_"]').first();
  await instructorThread.locator(':scope > .communication-toggle').click();
  await expect(page.getByTestId('messages-nav-link')).toHaveAttribute('aria-label', 'Messages, 0 unread items');
  await expect(instructorThread.getByText('Synthetic persistence check from parent.')).toBeVisible();
  const conversationId = (await instructorThread.getAttribute('data-testid'))!.replace('conversation-', '');
  await instructorThread.getByTestId(`reply-input-${conversationId}`).fill('Synthetic reply from instructor.');
  await instructorThread.getByTestId(`reply-send-${conversationId}`).click();

  await signIn(page, 'priya.shah@example.test');
  await expect(page.getByTestId('messages-nav-link')).toHaveAttribute('aria-label', 'Messages, 1 unread item');
  await page.goto('/parent/communications');
  const parentThread = page.getByTestId(`conversation-${conversationId}`);
  await parentThread.locator(':scope > .communication-toggle').click();
  await expect(parentThread.getByText('Synthetic persistence check from parent.')).toBeVisible();
  await expect(parentThread.getByText('Synthetic reply from instructor.')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId(`conversation-${conversationId}`)).toBeVisible();
});

test('group announcements reach only parents in the group and replies stay private', async ({ page }) => {
  await signIn(page, 'jordan.lee@example.test');
  await page.goto('/instructor/communications');
  await page.getByTestId('announcement-input').fill('Synthetic Group 14 announcement.');
  await page.getByRole('button', { name: 'Post announcement' }).click();
  const postedNotice = page.getByRole('status').filter({ hasText: 'Announcement posted to the selected lesson groups.' });
  await expect(postedNotice).toBeVisible();
  await expect(postedNotice).toHaveClass(/ok/);
  await expect(postedNotice).not.toHaveClass(/danger/);

  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent/communications');
  const announcement = page.locator('[data-testid^="announcement-ann_"]').filter({ hasText: 'Synthetic Group 14 announcement.' }).first();
  await announcement.locator(':scope > .communication-toggle').click();
  await announcement.getByTestId(/announcement-private-reply-ann_/).fill('Synthetic private follow-up.');
  await announcement.getByRole('button', { name: 'Reply privately' }).click();
  const replyNotice = page.getByRole('status').filter({ hasText: 'Private reply sent to your instructor.' });
  await expect(replyNotice).toBeVisible();
  await expect(replyNotice).toHaveClass(/ok/);
  const privateThread = page.getByTestId(/conversation-conv_/).filter({ hasText: 'Synthetic private follow-up.' }).first();
  await expect(privateThread).toContainText('Synthetic private follow-up.');
  const conversationId = (await privateThread.getAttribute('data-testid'))!.replace('conversation-', '');

  await signIn(page, 'jordan.lee@example.test');
  await page.goto('/instructor/communications');
  await page.getByRole('button', { name: 'Announcement replies' }).click();
  const instructorThread = page.getByTestId(`conversation-${conversationId}`);
  await instructorThread.locator(':scope > .communication-toggle').click();
  const context = instructorThread.locator('.announcement-reply-context');
  await expect(context).toBeVisible();
  await expect(context).toContainText('Replying to announcement');
  await expect(context).toContainText('Group 14 announcement');
  await expect(context).toContainText('Synthetic Group 14 announcement.');
  await expect(instructorThread).toContainText('Synthetic private follow-up.');
  await instructorThread.getByTestId(`reply-input-${conversationId}`).fill('Synthetic instructor response to announcement reply.');
  await instructorThread.getByTestId(`reply-send-${conversationId}`).click();

  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent/communications');
  const parentThread = page.getByTestId(`conversation-${conversationId}`);
  await parentThread.locator(':scope > .communication-toggle').click();
  await expect(parentThread.locator('.announcement-reply-context')).toContainText('Group 14 announcement');
  await expect(parentThread).toContainText('Synthetic instructor response to announcement reply.');

  await signIn(page, 'dana.whitfield@example.test');
  await page.goto('/parent/communications');
  await expect(page.getByText('Synthetic Group 14 announcement.')).toHaveCount(0);
  await expect(page.getByText('Synthetic private follow-up.')).toHaveCount(0);
});

test('an admin alert shows details and the admin can distinguish targeted, viewed, and acknowledged parents', async ({ page }) => {
  await signIn(page, 'hana.sato@example.test');
  await page.goto('/admin/communications');
  await page.locator('input[name="groupIds"][value="grp_09"]').uncheck();
  await page.locator('[name="title"]').fill('Synthetic early pickup notice');
  await page.locator('[name="reason"]').fill('Synthetic high-wind reason.');
  await page.locator('[name="pickupLocation"]').fill('Synthetic south entrance.');
  await page.locator('[name="pickupTime"]').fill('12:30 p.m. synthetic.');
  await page.locator('[name="instructions"]').fill('Use the desk and present photo ID.');
  await page.getByRole('button', { name: 'Create urgent alert' }).click();
  await expect(page.getByText('Urgent alert posted in the parent portal.')).toBeVisible();

  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent/communications');
  const parentAlert = page.locator('[data-testid^="emergency-alert-alert_"]').filter({ hasText: 'Synthetic early pickup notice' }).first();
  await parentAlert.locator(':scope > .communication-toggle').click();
  for (const detail of ['Synthetic high-wind reason.', 'Synthetic south entrance.', '12:30 p.m. synthetic.', 'Use the desk and present photo ID.']) await expect(parentAlert.getByText(detail)).toBeVisible();
  await parentAlert.getByRole('button', { name: 'I’ve received this alert' }).click();

  await signIn(page, 'hana.sato@example.test');
  await page.goto('/admin/communications');
  const adminAlert = page.locator('[data-testid^="admin-alert-alert_"]').filter({ hasText: 'Synthetic early pickup notice' }).first();
  await expect(adminAlert).toContainText('3 targeted · 1 viewed · 1 acknowledged');
  await adminAlert.locator(':scope > .communication-toggle').click();
  await expect(adminAlert).toContainText('Priya Shah');
  await expect(adminAlert).toContainText('Acknowledged');

  await signIn(page, 'dana.whitfield@example.test');
  await page.goto('/parent/communications');
  await expect(page.getByText('Synthetic early pickup notice')).toHaveCount(0);
});

test('messaging disclosures fit a phone and respect keyboard and reduced-motion preferences', async ({ page }) => {
  await signIn(page, 'jordan.lee@example.test');
  await page.goto('/instructor/communications');
  await page.getByTestId('announcement-input').fill('Synthetic mobile disclosure check.');
  await page.getByRole('button', { name: 'Post announcement' }).click();
  await signIn(page, 'priya.shah@example.test');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/parent/communications');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const announcement = page.locator('[data-testid^="announcement-ann_"]').filter({ hasText: 'Synthetic mobile disclosure check.' }).first();
  const toggle = announcement.locator(':scope > .communication-toggle');
  expect((await toggle.boundingBox())?.height).toBeGreaterThanOrEqual(48);
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(announcement.locator('.communication-chevron')).toHaveClass(/is-open/);
  await expect.poll(async () => Number.parseFloat(await announcement.locator('.communication-chevron').evaluate((element) => getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(0.001);
});
