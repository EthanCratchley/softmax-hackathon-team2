import { Piezas, type EntityClient } from '@piezas/sdk';
import { createHash } from 'node:crypto';
import { practiceContext } from './practice-context';
import { seedChildren } from './seed-data';
import type { Child } from './model';

// Only this server module and the local setup script instantiate the SDK.
export const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY, apiBaseUrl: process.env.PIEZAS_API_URL });
const kinds = ['member','child','group','incident','event','pickupLink','headcount','heartbeat','audit','alert','clock','revision'] as const;
export type Kind = typeof kinds[number];
let ready: Promise<Record<string, EntityClient>> | undefined;
export function stores() {
  if (!ready) ready = piezas.defineEntities(Object.fromEntries(kinds.map(k=>[`safety_${k.toLowerCase()}`,{fields:{key:{type:'text',required:true},payload:{type:'longtext',required:true}}}]))).catch(e=>{ready=undefined;throw e;});
  return ready;
}
const practiceKinds = new Set<Kind>(['incident', 'event', 'pickupLink', 'headcount', 'heartbeat', 'audit', 'alert', 'clock', 'revision']);
const privateStores = new Map<string, Promise<EntityClient>>();
async function store(kind: Kind) {
  const context = practiceContext();
  if (!context || !practiceKinds.has(kind)) return (await stores())[`safety_${kind.toLowerCase()}`];
  const slug = `practice_${context.namespace}_${kind.toLowerCase()}`;
  let result = privateStores.get(slug);
  if (!result) {
    result = piezas.defineEntities({ [slug]: { fields: { key: { type: 'text', required: true }, payload: { type: 'longtext', required: true } } } })
      .then(entities => entities[slug]).catch(error => { privateStores.delete(slug); throw error; });
    privateStores.set(slug, result);
  }
  return result;
}
function recordKey(kind: Kind, id: string) {
  const context = practiceContext();
  return context && practiceKinds.has(kind) && kind !== 'audit' ? `${context.generation}:${id}` : id;
}
function permitWrite(kind: Kind) {
  if (practiceContext() && !practiceKinds.has(kind)) throw new Error('Practice cannot change shared profiles, groups, or accounts.');
}
export async function all<T>(kind:Kind):Promise<T[]> {
  const context = practiceContext();
  if (context && kind === 'group') return structuredClone(context.groups) as T[];
  const s=await store(kind); const result:T[]=[];
  for(let offset=0;;offset+=100) { const page=await s.list({limit:100,offset}); result.push(...page.data.filter(r=>!context||!practiceKinds.has(kind)||kind==='audit'||String(r.data.key).startsWith(`${context.generation}:`)).map(r=>JSON.parse(String(r.data.payload)) as T)); if(page.data.length<100)break; }
  if (context && kind === 'child') return (result as Child[]).filter(c=>seedChildren.some(seed=>seed.id===c.id)).map(c=>{
    const seed=seedChildren.find(seed=>seed.id===c.id)!;
    return {...c,groupId:seed.groupId,day:seed.day};
  }) as T[];
  return result;
}
export async function get<T>(kind:Kind,id:string):Promise<T|undefined> {
  if (practiceContext() && (kind === 'group' || kind === 'child')) return (await all<{id:string}>(kind)).find(r=>r.id===id) as T|undefined;
  const page=await (await store(kind)).list({filter:{key:recordKey(kind,id)},limit:2});
  return page.data[0] ? JSON.parse(String(page.data[0].data.payload)) as T : undefined;
}
export async function put<T extends {id:string}>(kind:Kind,value:T) {
  permitWrite(kind);
  const key=recordKey(kind,value.id);
  const s=await store(kind);const page=await s.list({filter:{key},limit:2});
  const input={title:value.id,data:{key,payload:JSON.stringify(value)}};
  if(page.data[0]) await s.update(page.data[0].id,input); else await s.create(input);
  return value;
}
export async function idempotencyKey(value:string){
  let suffix='';
  const context=practiceContext();
  if(context)return createHash('sha256').update(`kestrel-practice-${context.namespace}-${context.generation}-${value}`).digest('hex');
  if(process.env.PIEZAS_TEST_API_KEY&&process.env.PIEZAS_API_KEY===process.env.PIEZAS_TEST_API_KEY){const clock=await get<{runId?:string}>('clock','test-clock');suffix=clock?.runId?`-${clock.runId}`:'';}
  return createHash('sha256').update(`kestrel-${value}${suffix}`).digest('hex');
}
export async function append<T extends {id:string}>(kind:Kind,value:T) {
  permitWrite(kind);
  // Bulk import is the platform's idempotent create operation.
  const existing=await get<T>(kind,value.id);if(existing)return existing;
  const key=await idempotencyKey(`${kind}-${value.id}`);
  try{await (await store(kind)).import({records:[{title:value.id,data:{key:recordKey(kind,value.id),payload:JSON.stringify(value)}}]},key);}
  catch(error){const status=(error as {status?:number}).status;if(status!==409&&status!==422)throw error;const winner=await get<T>(kind,value.id);if(winner)return winner;throw error;}
  const saved=await get<T>(kind,value.id);if(!saved)throw new Error('Piezas did not return the saved record.');return saved;
}
