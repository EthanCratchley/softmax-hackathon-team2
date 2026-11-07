// piezas-scenario: S-012 v=8fc3880dbab4
// S-012: An unlisted adult is blocked
//   Given Mark Whitfield is not on Lily's list
//   When he asks to collect her and desk staff record the denial
//   Then the screen says release is blocked and whom to contact, the denial is logged, and no pickup record exists
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-012: An unlisted adult is blocked", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-012 has no test yet");
});
