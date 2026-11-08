// piezas-scenario: S-004 v=7d3d856710d7
// S-004: A bad phone number is rejected
//   Given a parent editing an emergency contact
//   When they enter the 9-digit number 604555-187 and save
//   Then the app refuses it with a clear message and the old value stays
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-004: A bad phone number is rejected", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-004 has no test yet");
});
