// piezas-scenario: S-029 v=9d26e543fd6e
// S-029: Hana opens medical details only with a logged reason
//   Given Hana is on the admin overview and Ava has a recorded allergy
//   When Hana views the overview, then tries to open Ava's full details with no reason, then opens them with a reason
//   Then the overview shows no medical values, the attempt with no reason is refused, and the opening with a reason shows the details and logs who, when, which child and why
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-029: Hana opens medical details only with a logged reason", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-029 has no test yet");
});
