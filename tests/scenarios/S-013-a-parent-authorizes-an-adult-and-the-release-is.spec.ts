// piezas-scenario: S-013 v=ec8c496bcf24
// S-013: A parent authorizes an adult and the release is recorded once
//   Given Lily's parent adds Mark Whitfield from their phone after the denial
//   When desk staff refresh, choose him, confirm the ID check and release her, then try to release her again
//   Then exactly one pickup record exists with the required details, the second attempt is blocked and shows who took her, and the record offers no edit or delete
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-013: A parent authorizes an adult and the release is recorded once", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-013 has no test yet");
});
