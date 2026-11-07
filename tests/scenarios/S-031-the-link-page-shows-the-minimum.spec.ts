// piezas-scenario: S-031 v=641789e53932
// S-031: The link page shows the minimum
//   Given a valid pickup link for Lily, who has a recorded medical condition
//   When someone opens the link without signing in
//   Then they see only her first name, the pickup place and time, the adult's name and "bring photo ID", and the opening is logged
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-031: The link page shows the minimum", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-031 has no test yet");
});
