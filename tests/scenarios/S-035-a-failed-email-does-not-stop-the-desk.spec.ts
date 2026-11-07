// piezas-scenario: S-035 v=e10417e8d5b1
// S-035: A failed email does not stop the desk
//   Given a parent's email address cannot receive mail
//   When desk staff check in and release that child
//   Then both actions finish as normal and Hana sees the failed alerts listed
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-035: A failed email does not stop the desk", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-035 has no test yet");
});
