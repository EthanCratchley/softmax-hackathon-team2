// piezas-scenario: S-007 v=477a096fa124
import { test, expect, login, post, db, day, incident, attendance, updateChild, completeProfile, fillReport, setClock } from '../safety-fixtures';

test("S-007: The instructor screens work in gloves", async ({ page }) => {
  await page.goto('/login');
  await page.setViewportSize({width:375,height:812}); await login(page,'instructor'); await page.getByTestId('refresh').click(); await expect(page.getByTestId('alert-child-ava')).toBeVisible(); expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true); for(const c of await page.getByTestId('safety-workspace').locator('a,button,input').all()){const b=await c.boundingBox(); expect(b?.height).toBeGreaterThanOrEqual(48);} await page.getByTestId('report-child-owen').click(); await expect(page.getByTestId('missing-report-form')).toBeVisible();
});
