import { test as base, expect, type Page } from '@playwright/test';
import { loadEnvFile } from 'node:process';
import { seedChildren, seedGroups } from '../lib/safety/seed-data';
import type { Child, Event, Incident, Member } from '../lib/safety/model';
loadEnvFile('.env');loadEnvFile('.env.test-users');
if(!process.env.PIEZAS_TEST_API_KEY)throw new Error('A separate test app is required.');
process.env.PIEZAS_API_KEY=process.env.PIEZAS_TEST_API_KEY;
const rawDb=await import('../lib/safety/store');
type Kind=import('../lib/safety/store').Kind;
const db={...rawDb,all:<T=any>(kind:Kind)=>rawDb.all<T>(kind),get:async<T=any>(kind:Kind,id:string):Promise<T>=>{const value=await rawDb.get<T>(kind,id);if(!value)throw new Error(`Missing test record: ${kind} ${id}`);return value;}};
export {expect,db};
export const day='2026-12-12';
export const test=base.extend<{prepared:void}>({prepared:[async({},use)=>{
  const stores=await db.stores();
  for(const kind of ['event','incident','headcount','pickupLink','heartbeat','alert','audit','revision'] as const){const store=stores[`safety_${kind.toLowerCase()}`];for(;;){const list=await store.list({limit:100});if(!list.data.length)break;await Promise.all(list.data.map(r=>store.delete(r.id)));}}
  const childStore=stores.safety_child;const children=await childStore.list({limit:100});await Promise.all(children.data.filter(r=>!['child-ava','child-owen','child-lily'].includes(String(r.data.key))).map(r=>childStore.delete(r.id)));
  const members=await db.all<Member>('member');const user=(role:string)=>members.find(m=>m.id===`member-${role}`)!.userId;
  for(const group of seedGroups)await db.put('group',{...group,instructorId:user(group.id==='group-1'?'instructor':'instructor-other')});
  for(const child of seedChildren)await db.put('child',{...child,parents:[user(child.id==='child-ava'?'parent':child.id==='child-lily'?'parent-lily':'parent-owen')],...(child.id==='child-lily'?{consent:{name:'Taylor Whitfield',userId:user('parent-lily'),at:'2026-11-01T10:00:00Z',photos:false}}:{})});
  await setClock('10:00');await use();
},{auto:true}]});
export async function setClock(time:string){await db.put('clock',{id:'test-clock',day,time,runId:crypto.randomUUID()});}
export async function login(page:Page,role:string){
  await page.context().clearCookies();await page.goto('/login');await page.getByTestId('email').fill(`${role}@example.test`);await page.getByTestId('password').fill(process.env.SAFETY_DEMO_PASSWORD!);await page.getByTestId('sign-in').click();await expect(page.getByTestId('safety-workspace')).toBeVisible();await expect(page.getByTestId('child-child-ava').or(page.getByTestId('child-child-lily')).or(page.getByTestId('child-child-owen')).first()).toBeVisible();
}
export async function post(page:Page,body:Record<string,unknown>){return page.request.post('/api/safety',{data:body,headers:{origin:new URL(page.url()).origin}});}
export async function updateChild(id:string,patch:Partial<Child>){const c=(await db.get<Child>('child',id))!;await db.put('child',{...c,...patch});}
export async function incident(childId='child-owen',lastSeenAt=`${day}T14:30`){
  const i:Incident={id:`incident-${childId}`,childId,day,reportedBy:'Tyler Ng',lastSeenAt,place:'Top of the Pigeon chair',clothing:'Blue jacket',helmet:'White helmet',equipment:'Skis and poles',notes:'Separated at trail sign.',status:'Open',actions:[{type:'Missing report opened',note:'Radio patrol',staff:'Tyler Ng',at:'2026-12-12T22:40:00Z'}]};await db.put('incident',i);return i;
}
export async function attendance(childId='child-lily') {await db.put<Event>('event',{id:`checkin-${childId}-${day}`,childId,day,type:'checkin',staff:'Morgan Vale',at:'2026-12-12T17:30:00Z',bib:'14'});}
export async function fillReport(page:Page,childId='child-owen',role='instructor'){
  await page.goto(`/${role}/report-missing/${childId}`);await page.getByTestId('place').fill('Top of the Pigeon chair');await page.getByTestId('clothing').fill('Blue jacket');await page.getByTestId('helmet').fill('White helmet');await page.getByTestId('equipment').fill('Skis and poles');await page.getByTestId('notes').fill('Separated at trail sign.');await page.getByTestId('submit-report').click();await expect(page.getByTestId('saved')).toBeVisible();
}
export async function completeProfile(page:Page){
  await page.goto('/parent/children/child-ava');await page.getByTestId('allergies').fill('Tree-nut allergy');await page.getByTestId('conditions').fill('none');await page.getByTestId('medications').fill('EpiPen');await page.getByTestId('location').fill('Kestrel Kids Ski School Desk');await page.getByTestId('consent').check();await page.getByTestId('consent-name').fill('Jamie Chen');await page.getByTestId('save-profile').click();await expect(page.getByTestId('completion')).toHaveText('Complete');
}
