// piezas-scenario: S-006 v=6d9326943c83
// S-006: An unrelated instructor is denied
//   Given an instructor who is not assigned Ava's group
//   When they request Ava's alerts or try to change her medical details by address or direct server call
//   Then they are refused and no details are returned
import { expect, test } from '../scenario-test';
import { DAY, JORDAN, SAM, signInAs } from '../safety-helpers';
import { signIn } from '../sign-in';

test('S-006: An unrelated instructor is denied', async ({ page }) => {
  await signInAs(page, SAM);
  await page.goto(`/instructor?day=${DAY}`);
  await expect(page.getByTestId('group-grp_09')).toBeVisible();
  await expect(page.getByTestId('child-chd_ava')).toHaveCount(0);

  // By address: Ava's report page returns nothing about her.
  await page.goto(`/instructor/report-missing/chd_ava?day=${DAY}`);
  await expect(page.getByTestId('not-found')).toHaveText('Not found');
  await expect(page.getByTestId('missing-report-form')).toHaveCount(0);
  await expect(page.getByTestId('report-missing-page')).not.toContainText('Ava');

  // The patrol packet and search are not reachable for an instructor.
  await page.goto('/patrol?q=Ava');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId('search-results')).toHaveCount(0);
});

test("S-006: an unrelated instructor's direct server call cannot change Ava's medical details", async ({ page }) => {
  // Capture Ava's parent's real save call without letting it through.
  await signIn(page, 'priya.shah@example.test');
  await page.goto('/parent/children/chd_ava');
  let captured: { headers: Record<string, string>; body: string } | null = null;
  await page.route('**/parent/children/chd_ava', async (route) => {
    const request = route.request();
    if (request.method() !== 'POST' || !request.headers()['next-action']) return route.continue();
    captured = { headers: request.headers(), body: request.postData() ?? '' };
    await route.abort();
  });
  await page.getByTestId('save-profile').click();
  await expect.poll(() => captured).not.toBeNull();
  await page.unroute('**/parent/children/chd_ava');
  const call = captured!;

  // Replay it with Sam's session, injecting an allergy.
  await signIn(page, SAM);
  const body = call.body.replace(/"allergies":(\[[^\]]*\]|"none"|null)/, '"allergies":["Injected by Sam"]');
  expect(body).not.toBe(call.body);
  const response = await page.request.post('/parent/children/chd_ava', {
    headers: { 'next-action': call.headers['next-action'], 'content-type': call.headers['content-type'], accept: 'text/x-component' },
    data: Buffer.from(body),
    maxRedirects: 0,
  });
  const text = await response.text();
  expect(text).not.toContain('Saved');
  expect(text).not.toMatch(/Tree nuts|Alder Lane|604-555/);

  // Ava's assigned instructor never sees the injected value.
  await signInAs(page, JORDAN);
  await page.goto(`/instructor?day=${DAY}`);
  await expect(page.getByTestId('instructor-page')).not.toContainText('Injected by Sam');
});

