// piezas-scenario: S-036 v=17034d3a5a1f
// S-036: Missing reports do not email parents
//   Given a child has linked parents
//   When the child is reported missing
//   Then no email goes to the parents, and patrol's packet shows the contacts for a person to call
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-036: Missing reports do not email parents", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-036 has no test yet");
});
