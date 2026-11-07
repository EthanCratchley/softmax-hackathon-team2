// piezas-scenario: S-010 v=aadc9ddc311f
// S-010: Desk sees the pickup list and no medical details
//   Given Ava is checked in and has a recorded allergy
//   When desk staff open her pickup screen and also request her medical record directly from the server
//   Then they see only her active adults and state, and the medical request is refused
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-010: Desk sees the pickup list and no medical details", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-010 has no test yet");
});
