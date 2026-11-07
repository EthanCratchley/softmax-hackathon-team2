// piezas-scenario: S-006 v=6d9326943c83
// S-006: An unrelated instructor is denied
//   Given an instructor who is not assigned Ava's group
//   When they request Ava's alerts or try to change her medical details by address or direct server call
//   Then they are refused and no details are returned
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-006: An unrelated instructor is denied", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-006 has no test yet");
});
