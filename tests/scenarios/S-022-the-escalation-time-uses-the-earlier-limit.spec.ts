// piezas-scenario: S-022 v=e97b4583882c
import { test, expect, login, post, db, day, incident, attendance, updateChild, completeProfile, fillReport, setClock } from '../safety-fixtures';

test("S-022: The escalation time uses the earlier limit", async ({ page }) => {
  await page.goto('/login');
  const a=await incident('child-owen'); const b=await incident('child-ava',day+'T15:30'); await login(page,'patrol'); await page.goto('/patrol/incidents/'+a.id); await expect(page.getByTestId('escalation')).toContainText('15:30'); await page.goto('/patrol/incidents/'+b.id); await expect(page.getByTestId('escalation')).toContainText('16:00'); expect((await db.all('alert'))).toHaveLength(0);
});
