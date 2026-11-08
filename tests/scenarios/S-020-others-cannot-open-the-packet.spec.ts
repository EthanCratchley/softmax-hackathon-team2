// piezas-scenario: S-020 v=9dbde1e1c3d6
// S-020: Others cannot open the packet
//   Given Owen has an open incident
//   When an instructor, desk staff or a parent requests the packet, or patrol requests one for a child with no incident
//   Then the request is refused and no details are returned
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-020: Others cannot open the packet", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-020 has no test yet");
});
