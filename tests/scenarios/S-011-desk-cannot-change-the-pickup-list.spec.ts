// piezas-scenario: S-011 v=24ebb19a1be5
// S-011: Desk cannot change the pickup list
//   Given desk staff are signed in
//   When they try to add an authorized adult to Lily's list by a direct server call
//   Then the request is refused and the list stays the same
import { expect, test, type Page } from '@playwright/test';
import { CHILD_IDS, DEMO_LESSON_DATE } from '../../lib/fixtures';
import { CASEY, DANA, openSection } from '../parent-helpers';
import { signIn } from '../sign-in';

const deskAdults = async (page: Page) => {
  await page.goto(`/desk/children/${CHILD_IDS.lily}?day=${DEMO_LESSON_DATE}`);
  await expect(page.getByTestId('pickup-child-name')).toHaveText('Lily Whitfield');
  return page.locator('[data-testid^="adult-adl_"]').evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-testid')));
};

test("S-011: desk cannot change Lily's pickup list, by screen or by a direct server call", async ({ page }) => {
  // Capture the parent's real "save profile" server call without letting it through.
  await signIn(page, DANA);
  await page.goto(`/parent/children/${CHILD_IDS.lily}`);
  let captured: { headers: Record<string, string>; body: string } | null = null;
  await page.route(`**/parent/children/${CHILD_IDS.lily}`, async (route) => {
    const request = route.request();
    if (request.method() !== 'POST' || !request.headers()['next-action']) return route.continue();
    captured = { headers: request.headers(), body: request.postData() ?? '' };
    await route.abort();
  });
  await openSection(page, 'section-contacts');
  await page.getByTestId('save-profile').click();
  await expect.poll(() => captured).not.toBeNull();
  await page.unroute(`**/parent/children/${CHILD_IDS.lily}`);
  const call = captured!;

  await signIn(page, CASEY);
  const before = await deskAdults(page);
  // The desk screen offers no way to add or edit adults.
  await expect(page.getByTestId('parent-profile-form')).toHaveCount(0);
  await expect(page.getByTestId('pickup-page')).not.toContainText(/Add a pick-up adult|Authorized to pick up/);

  // Replay the parent's server call with desk's session, adding an adult.
  const body = call.body.replace('"authorizedAdults":[', '"authorizedAdults":[{"name":"Desk Added","relationship":"Friend","phone":"","isActive":true},');
  expect(body).not.toBe(call.body);
  const response = await page.request.post(`/parent/children/${CHILD_IDS.lily}`, {
    headers: { 'next-action': call.headers['next-action'], 'content-type': call.headers['content-type'], accept: 'text/x-component' },
    data: Buffer.from(body),
    maxRedirects: 0,
  });
  expect(await response.text()).not.toContain('Saved');

  expect(await deskAdults(page)).toEqual(before);
  await expect(page.getByTestId('pickup-page')).not.toContainText('Desk Added');

  // The parent route itself sends desk staff away.
  await page.goto(`/parent/children/${CHILD_IDS.lily}`);
  await expect(page).not.toHaveURL(/\/parent\//);

  await signIn(page, DANA);
  await page.goto(`/parent/children/${CHILD_IDS.lily}`);
  await openSection(page, 'section-contacts');
  await expect(page.getByTestId('section-contacts')).not.toContainText('Desk Added');
  await expect(page.locator('[data-testid^="pickup-adult-"]')).toHaveCount(2);
});
