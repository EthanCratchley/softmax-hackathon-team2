// piezas-scenario: S-027 v=0f48eb73ae3c
// S-027: Corrections add instead of overwrite
//   Given a recorded pickup with a wrong detail
//   When Hana adds a correction with a reason
//   Then the original stays unchanged and the correction appears beside it, naming Hana
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { expect, test } from '../scenario-test';
import { ADULT_IDS, CHILD_IDS, DEMO_LESSON_DATE } from '../../lib/fixtures';
import { signIn } from '../sign-in';

test('S-027: a correction is added beside the original pickup record, naming Hana', async ({ page }) => {
  // Use Noor's release for the day, recording it at the desk if no other scenario has yet.
  await signIn(page, 'casey.morgan@example.test');
  await page.goto(`/desk/children/${CHILD_IDS.noor}?day=${DEMO_LESSON_DATE}`);
  const attendance = page.getByTestId('pickup-attendance');
  if ((await attendance.textContent()) === 'Expected') {
    await page.getByTestId('bib-number').fill('32');
    await page.getByTestId('check-in-child').click();
    await expect(attendance).toHaveText('Checked in');
  }
  if ((await attendance.textContent()) === 'Checked in') {
    await page.getByTestId(`adult-${ADULT_IDS.noorMother}`).check();
    await page.getByTestId('id-confirmation').check();
    await page.getByTestId('release-child').click();
  }
  await expect(page.getByTestId('release-record')).toContainText('Leila Haddad');

  await signIn(page, 'hana.sato@example.test');
  await page.goto(`/admin?day=${DEMO_LESSON_DATE}`);
  const record = page.locator(`[data-testid^="pickup-record-"][data-child="${CHILD_IDS.noor}"]`);
  await expect(record).toHaveCount(1);
  const id = (await record.getAttribute('data-testid'))!.replace('pickup-record-', '');
  const original = page.getByTestId(`pickup-original-${id}`);
  const before = await original.textContent();
  expect(before).toContain('Released to Leila Haddad · verified by Casey Morgan');

  // Both fields are required by the service.
  await page.getByTestId(`correction-submit-${id}`).click();
  await expect(page.getByTestId(`correction-reason-error-${id}`)).toHaveText('Enter why this correction is needed.');
  await expect(page.getByTestId(`correction-note-error-${id}`)).toHaveText('Enter the correction.');

  const reason = `Wrong adult named ${Date.now()}`;
  await page.getByTestId(`correction-reason-${id}`).fill(reason);
  await page.getByTestId(`correction-note-${id}`).fill('Noor was collected by Karim Haddad (father) with Leila present.');
  await page.getByTestId(`correction-submit-${id}`).click();
  await expect(page.getByTestId(`correction-message-${id}`)).toHaveText('Correction added beside the original record.');

  const correction = record.locator('[data-testid^="pickup-correction-"]').filter({ hasText: reason });
  await expect(correction).toContainText('Correction by Hana Sato');
  await expect(correction).toContainText(`Reason: ${reason}`);
  await expect(correction).toContainText('Karim Haddad (father)');
  await page.reload();
  expect(await page.getByTestId(`pickup-original-${id}`).textContent()).toBe(before);
  await expect(record.locator('[data-testid^="pickup-correction-"]').filter({ hasText: reason })).toHaveCount(1);
});
