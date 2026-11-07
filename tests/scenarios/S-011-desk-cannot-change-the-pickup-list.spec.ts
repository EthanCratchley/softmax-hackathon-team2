// piezas-scenario: S-011 v=24ebb19a1be5
// S-011: Desk cannot change the pickup list
//   Given desk staff are signed in
//   When they try to add an authorized adult to Lily's list by a direct server call
//   Then the request is refused and the list stays the same
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-011: Desk cannot change the pickup list", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-011 has no test yet");
});
