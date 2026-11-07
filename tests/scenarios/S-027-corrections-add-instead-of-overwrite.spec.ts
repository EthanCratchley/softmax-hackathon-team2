// piezas-scenario: S-027 v=0f48eb73ae3c
// S-027: Corrections add instead of overwrite
//   Given a recorded pickup with a wrong detail
//   When Hana adds a correction with a reason
//   Then the original stays unchanged and the correction appears beside it, naming Hana
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-027: Corrections add instead of overwrite", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-027 has no test yet");
});
