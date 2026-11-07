// piezas-scenario: S-003 v=ead43290d8f8
// S-003: Blank medical answers stay incomplete
//   Given a child with every detail filled in except conditions, which is blank
//   When the parent saves the profile
//   Then the status reads "Needs information" and names conditions as missing
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-003: Blank medical answers stay incomplete", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-003 has no test yet");
});
