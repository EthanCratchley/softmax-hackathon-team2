// piezas-scenario: S-038 v=a669040e5041
import { test, expect, login, post, db, day, incident, attendance, updateChild, completeProfile, fillReport, setClock } from '../safety-fixtures';

test("S-038: A short headcount leads to a report", async ({ page }) => {
  await page.goto('/login');
  await login(page,'instructor'); await page.getByTestId('someone-missing').click(); await page.getByTestId('report-child-owen').click(); await expect(page.getByTestId('missing-report-form')).toContainText('Report Owen Parr missing');
});
