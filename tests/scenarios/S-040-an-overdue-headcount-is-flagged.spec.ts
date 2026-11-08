// piezas-scenario: S-040 v=73c6f9dd1132
// S-040: An overdue headcount is flagged
//   Given a group's 10:00 a.m. headcount has not been confirmed by 10:11 a.m.
//   When desk staff or Hana view today's list
//   Then the group is flagged as overdue with no child's details, and the flag clears when the headcount is confirmed
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-040: An overdue headcount is flagged", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-040 has no test yet");
});
