// piezas-scenario: S-041 v=734b4cade937
// S-041: Lost contact prompts a radio call
//   Given an instructor's roster last made contact 21 minutes ago in lesson time
//   When desk staff or Hana view today's list
//   Then they see "Instructor not responding: try the radio", with no claim about the battery, and it clears when the roster makes contact again
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-041: Lost contact prompts a radio call", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-041 has no test yet");
});
