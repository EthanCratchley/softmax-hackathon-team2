// piezas-scenario: S-018 v=89922aa7b6b5
// S-018: Patrol opens an incident from a radio call
//   Given patrol hears by radio that a child is missing and no incident exists
//   When a patroller searches the child's name and opens an incident
//   Then the search showed only name, age and group, the incident now exists, and the action is logged
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-018: Patrol opens an incident from a radio call", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-018 has no test yet");
});
