// piezas-scenario: S-038 v=a669040e5041
// S-038: A short headcount leads to a report
//   Given a headcount is due for an instructor's group
//   When the instructor says someone is missing and picks Owen
//   Then the missing-child report opens for Owen
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-038: A short headcount leads to a report", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-038 has no test yet");
});
