import { all, append, get } from './store';
import { AppError } from './auth';
import type { Child, Incident } from './model';
type Revision<T>={id:string;scope:string;revision:number;requestId:string;value:T};
async function latest<T>(scope:string){return (await all<Revision<T>>('revision')).filter(r=>r.scope===scope).sort((a,b)=>b.revision-a.revision)[0];}
// The import operation atomically owns one idempotency key. Each revision is
// immutable: concurrent proposals for the same revision have only one winner.
// Losing writers reload and validate against that winner before trying again.
async function commit<T>(scope:string,initial:()=>Promise<T>,change:(value:T)=>Promise<T>):Promise<T>{
  const requestId=crypto.randomUUID();
  for(let attempt=0;attempt<8;attempt++){
    const prior=await latest<T>(scope);const revision=(prior?.revision??0)+1;
    const candidate:Revision<T>={id:`${scope}-${String(revision).padStart(9,'0')}`,scope,revision,requestId,value:await change(prior?.value??await initial())};
    try{const winner=await append('revision',candidate);if(winner?.requestId===requestId)return winner.value;}
    catch(error){
      const status=(error as {status?:number}).status;
      if(status!==409&&status!==422)throw error;
      const winner=await get<Revision<T>>('revision',candidate.id);
      // Piezas reports a different body for an existing idempotency key as
      // 422. Retry only when a competing revision demonstrably exists.
      if(!winner||winner.requestId===requestId)throw error;
    }
  }
  throw new AppError('Another staff member is updating this information. Refresh and try again.',409);
}
export async function assignedChildren(){const [children,revision]=await Promise.all([all<Child>('child'),latest<Record<string,string>>('assignments')]);return children.map(c=>({...c,groupId:revision?.value[c.id]??c.groupId}));}
export async function assignChild(childId:string,groupId:string){
  return commit<Record<string,string>>('assignments',async()=>({}),async assignments=>{
    const children=await all<Child>('child');
    if(children.filter(c=>c.id!==childId&&(assignments[c.id]??c.groupId)===groupId).length>=6)throw new AppError('A group cannot exceed six children.');
    return {...assignments,[childId]:groupId};
  });
}
export async function readIncident(id:string){const revision=await latest<Incident>(`incident-${id}`);return revision?.value??get<Incident>('incident',id);}
export async function incidents(){const base=await all<Incident>('incident');return Promise.all(base.map(async i=>(await readIncident(i.id))!));}
export async function changeIncident(id:string,change:(value:Incident)=>Promise<Incident>){return commit<Incident>(`incident-${id}`,async()=>{const i=await get<Incident>('incident',id);if(!i)throw new AppError('Not found',404);return i;},change);}
