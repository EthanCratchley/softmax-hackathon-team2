// piezas-scenario: S-021 v=2ffc57bb2b8c
import { test, expect, login, post, db, day, incident, attendance, updateChild, completeProfile, fillReport, setClock } from '../safety-fixtures';

test("S-021: Patrol logs actions and closes an incident", async ({ page }) => {
  await page.goto('/login');
  const i=await incident(); await login(page,'patrol'); await page.goto('/patrol/incidents/'+i.id); await page.getByTestId('incident-action').selectOption('Family contacted'); await page.getByTestId('save-action').click(); await expect(page.getByTestId('emergency-packet')).toContainText('Family contacted'); await page.getByTestId('incident-action').selectOption('Located'); await page.getByTestId('action-note').fill('Found at learning area'); await page.getByTestId('save-action').click(); await expect(page.getByTestId('emergency-packet')).toContainText('Located'); await page.getByTestId('incident-action').selectOption('Closed'); await page.getByTestId('save-action').click(); await expect(page.getByTestId('emergency-packet')).toContainText('Closed'); await expect(page.getByTestId('timeline-entry').last()).toContainText('Closed'); await expect(page.getByTestId('timeline-entry').last()).toContainText('Casey Brooks'); expect((await db.all('audit')).filter(a=>a.resourceId===i.id&&a.action.startsWith('incident.'))).toHaveLength(3);
});

test('simultaneous patrol notes both remain in the timeline',async({page})=>{
  const i=await incident();await login(page,'patrol');await page.goto('/patrol/incidents/'+i.id);
  const results=await Promise.all(['Radio search started','Desk updated'].map(note=>post(page,{action:'incident-action',incidentId:i.id,type:'Note',note})));
  for(const result of results)expect(result.status()).toBe(200);
  await page.getByTestId('refresh').click();
  await expect(page.getByTestId('emergency-packet')).toContainText('Radio search started');
  await expect(page.getByTestId('emergency-packet')).toContainText('Desk updated');
});
