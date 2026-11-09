// piezas-scenario: S-037 v=29e8a4de189c
import { test, expect, login, post, db, day, incident, attendance, updateChild, completeProfile, fillReport, setClock } from '../safety-fixtures';

test("S-037: An instructor confirms a headcount", async ({ page }) => {
  await page.goto('/login');
  await login(page,'instructor'); await page.getByTestId('all-here').click(); await expect(page.getByTestId('headcount-confirmed')).toContainText('10:00'); await expect(page.getByTestId('headcount-panel')).toContainText('10:30'); const h=(await db.all('headcount'))[0]; expect(h).toMatchObject({time:'10:00',count:2}); await page.reload(); await expect(page.getByTestId('headcount-confirmed')).toContainText('10:00');
});
