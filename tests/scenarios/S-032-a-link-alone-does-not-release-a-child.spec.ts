// piezas-scenario: S-032 v=b3c467af9959
// S-032: A link alone does not release a child
//   Given Grace Okafor holds a valid link for Lily
//   When desk staff choose Grace and confirm her ID matches
//   Then one pickup record exists noting the link, and there is no way to release Lily from the link page
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-032: A link alone does not release a child", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-032 has no test yet");
});
