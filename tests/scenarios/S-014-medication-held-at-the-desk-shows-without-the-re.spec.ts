// piezas-scenario: S-014 v=8c9a3d231c37
// S-014: Medication held at the desk shows without the rest
//   Given a child's medication location is the desk and they also have a recorded condition
//   When desk staff open that child
//   Then they see "holds [medication] for this child" and not the condition
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-014: Medication held at the desk shows without the rest", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-014 has no test yet");
});
