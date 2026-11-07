// piezas-scenario: S-016 v=4062b5be3c95
// S-016: Desk reports for an instructor with a dead phone
//   Given an instructor radios the desk that Owen is missing
//   When desk staff file the report and then open Owen's pickup screen
//   Then an open incident exists, the screen says "Call patrol" with no details, and release is blocked
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-016: Desk reports for an instructor with a dead phone", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-016 has no test yet");
});
