// piezas-scenario: S-018 v=89922aa7b6b5
import { test, expect, login, post, db, day, incident, attendance, updateChild, completeProfile, fillReport, setClock } from '../safety-fixtures';

test("S-018: Patrol opens an incident from a radio call", async ({ page }) => {
  await page.goto('/login');
  await login(page,'patrol'); await page.getByTestId('search').fill('Owen'); await expect(page.getByTestId('child-child-owen')).not.toContainText('Asthma'); await page.getByTestId('child-child-owen').getByText('Open incident from radio call').click(); await page.getByTestId('place').fill('Pigeon chair'); await page.getByTestId('clothing').fill('Red jacket'); await page.getByTestId('helmet').fill('Blue helmet'); await page.getByTestId('submit-report').click(); await expect(page.getByTestId('saved')).toBeVisible(); expect((await db.all('audit')).some(a=>a.action==='incident.opened'&&a.actor==='Casey Brooks')).toBe(true);
});
