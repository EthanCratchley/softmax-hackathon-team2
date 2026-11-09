// piezas-scenario: S-020 v=9dbde1e1c3d6
import { test, expect, login, post, db, day, incident, attendance, updateChild, completeProfile, fillReport, setClock } from '../safety-fixtures';

test("S-020: Others cannot open the packet", async ({ page }) => {
  await page.goto('/login');
  const i=await incident(); for(const role of ['parent','desk','instructor']){await login(page,role); const r=await post(page,{action:'packet',incidentId:i.id}); expect(r.status()).toBe(404); expect(await r.text()).not.toContain('Asthma');} await login(page,'patrol'); await page.goto('/patrol/incidents/unknown'); await expect(page.getByTestId('error')).toContainText('Not found'); await expect(page.getByTestId('emergency-packet')).toHaveCount(0);
});
