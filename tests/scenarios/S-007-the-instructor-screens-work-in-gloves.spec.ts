// piezas-scenario: S-007 v=477a096fa124
// S-007: The instructor screens work in gloves
//   Given an instructor on a 375-pixel-wide phone screen
//   When they open their roster
//   Then nothing scrolls sideways, tap targets are at least 48 pixels, and each child's missing-report button is one tap away
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-007: The instructor screens work in gloves", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-007 has no test yet");
});
