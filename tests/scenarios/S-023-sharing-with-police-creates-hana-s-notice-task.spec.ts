// piezas-scenario: S-023 v=d560a1d28b87
// S-023: Sharing with police creates Hana's notice task
//   Given a patroller records "shared with police or rescuers" on an incident
//   When Hana opens her task list
//   Then a task to mail the notice names the child and shows the family's mailing address
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { expect, test } from '@playwright/test';
import { CHILD_IDS } from '../../lib/fixtures';
import { closeIncidentsFor, DAY, HANA } from '../safety-helpers';
import { signIn } from '../sign-in';

test("S-023: Sharing with police creates Hana's notice task", async ({ page }) => {
  await closeIncidentsFor(page, CHILD_IDS.owen);
  await page.goto(`/patrol?day=${DAY}&q=Owen`);
  await page.getByTestId(`open-incident-${CHILD_IDS.owen}`).click();
  await expect(page.getByTestId('emergency-packet')).toBeVisible();
  const incidentId = page.url().split('/patrol/incidents/')[1].split('?')[0];

  await page.getByTestId('incident-action-type').selectOption('shared_with_police_or_rescuers');
  await page.getByTestId('incident-action-note').fill('Description shared with RCMP Sea to Sky');
  await page.getByTestId('incident-action-save').click();
  await expect(page.getByTestId('saved')).toHaveText('Action recorded.');

  await signIn(page, HANA);
  await page.goto('/admin');
  const task = page.getByTestId('notice-tasks').locator('li').filter({ hasText: `Incident ${incidentId}` });
  await expect(task).toHaveCount(1);
  await expect(task).toContainText('Mail the notice: Owen Parr');
  await expect(task).toContainText('7 Spruce Court, Pemberton, BC V0N 0A3');

  // Leave Owen without an open incident for the scenarios that follow.
  await closeIncidentsFor(page, CHILD_IDS.owen);
});
