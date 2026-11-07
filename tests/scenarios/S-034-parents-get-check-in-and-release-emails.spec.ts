// piezas-scenario: S-034 v=ed069f7d0867
// S-034: Parents get check-in and release emails
//   Given a child has two linked parents
//   When desk staff check the child in and later release them
//   Then each parent gets one email for each event, with the first name, time and, at release, the adult's name, and no medical details
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-034: Parents get check-in and release emails", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-034 has no test yet");
});
