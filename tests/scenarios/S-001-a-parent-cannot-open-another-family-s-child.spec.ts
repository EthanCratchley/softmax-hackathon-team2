// piezas-scenario: S-001 v=98217f02599a
// S-001: A parent cannot open another family's child
//   Given Ava's parent is signed in and Lily belongs to another family
//   When Ava's parent opens the address of Lily's profile, or sends Lily's ID to the server
//   Then they see "not found" and none of Lily's details
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-001: A parent cannot open another family's child", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-001 has no test yet");
});
