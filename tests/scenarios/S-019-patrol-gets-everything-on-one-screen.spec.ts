// piezas-scenario: S-019 v=1be617a3c22f
import { test, expect, login, post, db, day, incident, attendance, updateChild, completeProfile, fillReport, setClock } from '../safety-fixtures';

test("S-019: Patrol gets everything on one screen", async ({ page }) => {
  await page.goto('/login');
  const i=await incident(); await attendance('child-owen'); await page.setViewportSize({width:1024,height:900}); await login(page,'patrol'); await page.goto('/patrol/incidents/'+i.id); for(const v of ['Owen Parr','Owen Okafor-Parr','Group 14','Tyler Ng','Level 2','Top of the Pigeon chair','Asthma','Grace Okafor','Daniel Parr','KK-1088','Bib 14','Timeline'])await expect(page.getByTestId('emergency-packet')).toContainText(v); expect((await db.all('audit')).some(a=>a.action==='packet.opened'&&a.resourceId===i.id&&a.actor==='Casey Brooks'&&a.at)).toBe(true);
});

test('patrol refresh reads newly saved contacts and medical details',async({page,browser})=>{
  const i=await incident();await login(page,'patrol');await page.goto('/patrol/incidents/'+i.id);
  await expect(page.getByTestId('emergency-packet')).toContainText('Age 9');
  await expect(page.getByTestId('emergency-packet')).toContainText('Inhaler');
  const context=await browser.newContext();const parent=await context.newPage();
  await login(parent,'parent-owen');await parent.goto('/parent/children/child-owen');
  await parent.getByTestId('medications').fill('Updated rescue inhaler');
  await parent.getByTestId('contact-0-name').fill('Updated emergency contact');
  await parent.getByTestId('save-profile').click();await expect(parent.getByTestId('saved')).toBeVisible();
  await page.getByTestId('refresh').click();
  await expect(page.getByTestId('emergency-packet')).toContainText('Updated rescue inhaler');
  await expect(page.getByTestId('emergency-packet')).toContainText('Updated emergency contact');
  await context.close();
});
