// piezas-scenario: S-006 v=6d9326943c83
import { test, expect, login, post, db, day, incident, attendance, updateChild, completeProfile, fillReport, setClock } from '../safety-fixtures';

test("S-006: An unrelated instructor is denied", async ({ page }) => {
  await page.goto('/login');
  await login(page,'instructor-other'); await page.goto('/instructor/report-missing/child-ava'); await expect(page.getByTestId('not-found')).toBeVisible(); for(const action of ['medical','profile']){const r=await post(page,{action,childId:'child-ava',profile:{allergies:'none'}}); expect(r.status()).toBe(404); expect(await r.text()).not.toContain('Tree-nut');}
});
