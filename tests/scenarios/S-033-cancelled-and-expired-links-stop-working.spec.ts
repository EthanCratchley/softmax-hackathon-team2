// piezas-scenario: S-033 v=ade1ae4bd4eb
// S-033: Cancelled and expired links stop working
//   Given one link the parent has cancelled and another from a past lesson date
//   When someone opens either link and desk staff look for those adults on the pickup list
//   Then the page says the link is no longer valid, shows no child details, and those adults cannot be chosen
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-033: Cancelled and expired links stop working", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-033 has no test yet");
});
