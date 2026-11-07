// piezas-scenario: S-009 v=a0676f2a6c20
// S-009: Desk finds a child by any name and checks them in
//   Given Owen is expected today, listed as Owen Parr and also known as Owen Okafor-Parr, and his profile needs information
//   When desk staff search "Okafor" and check him in with bib 14
//   Then the time, staff member and bib are saved, he shows as checked in, and a "Needs information" flag appears with no medical details
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-009: Desk finds a child by any name and checks them in", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-009 has no test yet");
});
