// piezas-scenario: S-039 v=f570884545c9
import { test, expect, login, post, db, day, incident, attendance, updateChild, completeProfile, fillReport, setClock } from '../safety-fixtures';

test("S-039: No headcount prompts during lunch", async ({ page }) => {
  await page.goto('/login');
  await setClock('12:00'); await login(page,'instructor'); await page.getByTestId('refresh').click(); await expect(page.getByTestId('headcount-paused')).toBeVisible(); await expect(page.getByTestId('headcount-panel')).toHaveCount(0); await login(page,'desk'); await page.getByTestId('refresh').click(); await expect(page.getByTestId('group-status-group-1')).not.toContainText('Headcount overdue');
});
