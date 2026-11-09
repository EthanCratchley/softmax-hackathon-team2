// piezas-scenario: S-015 v=eace9ac24deb
import { test, expect, login, post, db, day, incident, attendance, updateChild, completeProfile, fillReport, setClock } from '../safety-fixtures';

test("S-015: An instructor reports a child missing", async ({ page }) => {
  await page.goto('/login');
  await login(page,'instructor'); await fillReport(page); const i=(await db.all('incident'))[0]; await login(page,'patrol'); await page.goto('/patrol/incidents/'+i.id); await expect(page.getByTestId('emergency-packet')).toContainText('Top of the Pigeon chair'); await expect(page.getByTestId('emergency-packet')).toContainText('2026-12-12T14:30');
});
