// piezas-scenario: S-042 v=27bf8d4c2c6e
// S-042: A parent sees their child's drop-off and pickup history
//   Given a parent with one linked child who has a check-in and release record
//   When the parent opens that child's lesson activity
//   Then they see the check-in time, release time and authorized pickup adult, with the latest event first and no unrelated child's activity
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-042: A parent sees their child's drop-off and pickup history", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-042 has no test yet");
});
