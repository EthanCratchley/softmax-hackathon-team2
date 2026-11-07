// piezas-scenario: S-022 v=e97b4583882c
// S-022: The escalation time uses the earlier limit
//   Given one child last seen at 2:30 p.m. and another last seen at 3:30 p.m.
//   When patrol opens each packet
//   Then the first shows 3:30 p.m., the second shows 4:00 p.m., and no message is sent to police or family
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-022: The escalation time uses the earlier limit", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-022 has no test yet");
});
