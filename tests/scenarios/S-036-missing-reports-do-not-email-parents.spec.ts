// piezas-scenario: S-036 v=17034d3a5a1f
import { test, expect, login, post, db, day, incident, attendance, updateChild, completeProfile, fillReport, setClock } from '../safety-fixtures';

test("S-036: Missing reports do not email parents", async ({ page }) => {
  await page.goto('/login');
  await login(page,'instructor'); await fillReport(page); expect(await db.all('alert')).toHaveLength(0); const i=(await db.all('incident'))[0]; await login(page,'patrol'); await page.goto('/patrol/incidents/'+i.id); await expect(page.getByTestId('emergency-packet')).toContainText('Grace Okafor'); expect(await db.all('alert')).toHaveLength(0);
});
