import { all, append, get, piezas, put } from './store';
import { assignedChildren, incidents as readIncidents, readIncident, changeIncident } from './ledger';
import { practiceContext } from './practice-context';
import { resetPractice } from './practice';
import { allow, AppError, type Identity } from './auth';
import { escalation, lessonActive, lessonDay, missing, mountainNow, nextHeadcount, type Child, type Event, type Group, type Headcount, type Incident, type Member } from './model';

type Input=Record<string,unknown>;
function text(b:Input,key:string,required=false){const v=b[key];if(typeof v!=='string'||v.length>3000||(required&&!v.trim()))throw new AppError(`Enter ${key}.`);return v.trim();}
function now(){return new Date().toISOString();}
async function clock(){
  if(practiceContext())return {day:lessonDay,time:'10:00'};
  if(process.env.PIEZAS_TEST_API_KEY&&process.env.PIEZAS_API_KEY===process.env.PIEZAS_TEST_API_KEY){const fixed=await get<{id:string;day:string;time:string}>('clock','test-clock');if(fixed)return fixed;}
  return mountainNow();
}
function dayValue(b:Input){const day=text(b,'day',true);if(!/^\d{4}-\d{2}-\d{2}$/.test(day))throw new AppError('Choose a lesson day.');return day;}
export async function audit(who:Identity,action:string,resourceId:string,reason?:string){
  await piezas.admin.createAuditEvent(who.tenantId,{actorId:who.userId,actorType:'app_user',action,resourceType:'kestrel_safety',resourceId,metadata:reason?{reason}:{}});
  await append('audit',{id:crypto.randomUUID(),actor:who.name,userId:who.userId,action,resourceId,reason,at:now()});
}
async function childFor(who:Identity,id:string,roles:Identity['role'][]):Promise<Child>{
  allow(who,roles);const c=(await assignedChildren()).find(c=>c.id===id);if(!c)throw new AppError('Not found',404);
  if(who.role==='instructor'){const g=await get<Group>('group',c.groupId);if(g?.instructorId!==who.userId)throw new AppError('Not found',404);}
  return c;
}
function summary(c:Child){return {id:c.id,name:c.name,otherNames:c.otherNames,birthDate:c.birthDate,groupId:c.groupId,level:c.level,day:c.day,missing:missing(c)};}
export async function view(who:Identity,day:string){
  allow(who,['instructor','patrol']);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day))throw new AppError('Choose a lesson day.');
  const [cs,gs,incidents,hcs,beats]=await Promise.all([assignedChildren(),all<Group>('group'),readIncidents(),all<Headcount>('headcount'),all<{id:string;at:string}>('heartbeat')]);
  const groups=gs.filter(g=>g.day===day&&(who.role!=='instructor'||g.instructorId===who.userId));
  const children=cs.filter(c=>c.day===day&&(who.role!=='instructor'||groups.some(g=>g.id===c.groupId)));
  if(who.role==='instructor')await put('heartbeat',{id:who.userId,at:now()});
  const current=await clock();
  const flags=groups.map(g=>{
    const headcount=hcs.filter(h=>h.groupId===g.id&&h.day===day).sort((a,b)=>b.at.localeCompare(a.at))[0];
    const due=headcount?nextHeadcount(headcount.time):'10:00';
    const beat=beats.find(b=>b.id===g.instructorId);
    const overdueAt=Number(due.slice(0,2))*60+Number(due.slice(3))+10;
    return {groupId:g.id,due,confirmed:headcount?.time,overdue:current.day===day&&lessonActive(current.time)&&Number(current.time.slice(0,2))*60+Number(current.time.slice(3))>overdueAt,lostContact:current.day===day&&lessonActive(current.time)&&(!beat||Date.now()-Date.parse(beat.at)>1200000)};
  });
  if(who.role==='instructor')return {practice:!!practiceContext(),practiceSession:practiceContext()?.generation,who,groups,children:children.map(c=>({...summary(c),allergies:c.allergies,conditions:c.conditions,medications:c.medications,location:c.location,instructions:c.instructions})),events:[],incidents:incidents.filter(i=>i.day===day&&children.some(c=>c.id===i.childId)).map(i=>({id:i.id,childId:i.childId,status:i.status})),flags,clock:current};
  return {practice:!!practiceContext(),practiceSession:practiceContext()?.generation,who,groups:groups.map(g=>({id:g.id,number:g.number})),children:children.map(c=>({id:c.id,name:c.name,birthDate:c.birthDate,groupId:c.groupId})),incidents:incidents.filter(i=>i.day===day).map(i=>({id:i.id,childId:i.childId,status:i.status})),events:[],flags:[]};
}
export async function command(who:Identity,b:Input){
  allow(who,['instructor','patrol']);
  const action=text(b,'action',true);
  if(practiceContext()&&b.practiceSession!==practiceContext()!.generation)throw new AppError('This practice session changed. Refresh before continuing.',409);
  if(action==='reset-practice')return resetPractice(who,b.confirmation,audit);
  if(action==='medical'){allow(who,['instructor']);const c=await childFor(who,text(b,'childId',true),['instructor']);return {allergies:c.allergies,conditions:c.conditions,medications:c.medications,location:c.location,instructions:c.instructions};}
  if(action==='report'){
    const c=await childFor(who,text(b,'childId',true),['instructor','patrol']);const day=dayValue(b);if(day!==c.day)throw new AppError('Not found',404);
    const lastSeenAt=text(b,'lastSeenAt',true);if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(lastSeenAt)||lastSeenAt.slice(0,10)!==day)throw new AppError('Enter the last-seen time for this lesson day.');
    const existing=(await readIncidents()).find(i=>i.childId===c.id&&i.day===day&&i.status!=='Closed');if(existing)return {id:existing.id};
    const incident:Incident={id:crypto.randomUUID(),childId:c.id,day,reportedBy:who.name,lastSeenAt,place:text(b,'place',true),clothing:text(b,'clothing',true),helmet:text(b,'helmet',true),equipment:text(b,'equipment'),notes:text(b,'notes'),status:'Open',actions:[{type:'Missing report opened',staff:who.name,note:text(b,'notes'),at:now()}]};
    await audit(who,'incident.opened',incident.id);await append('incident',incident);return {id:incident.id};
  }
  if(action==='packet'||action==='incident-action'){
    allow(who,['patrol']);const incident=await readIncident(text(b,'incidentId',true));if(!incident)throw new AppError('Not found',404);
    const c=await childFor(who,incident.childId,['patrol']);
    if(action==='packet'){await audit(who,'packet.opened',incident.id);const group=await get<Group>('group',c.groupId);const events=await all<Event>('event');const {address:unusedAddress,parents:unusedParents,adults:unusedAdults,consent:unusedConsent,...packetChild}=c;return {incident,child:packetChild,group,escalation:escalation(incident.lastSeenAt),bib:events.find(e=>e.childId===c.id&&e.day===incident.day&&e.type==='checkin')?.bib};}
    const type=text(b,'type',true);const note=text(b,'note');
    if(practiceContext()&&type==='Shared with police or rescuers')throw new AppError('Practice sessions do not create real follow-up tasks. Record a practice note instead.');
    if(!['Family contacted','Shared with police or rescuers','Note','Located','Closed'].includes(type))throw new AppError('Choose an action.');
    const noticeClaim=crypto.randomUUID();
    const hana=type==='Shared with police or rescuers'?(await all<Member>('member')).find(m=>m.role==='admin'):undefined;
    if(type==='Shared with police or rescuers'&&!hana)throw new AppError('Hana needs an assigned account before sharing can be recorded.');
    await audit(who,`incident.${type}`,incident.id);
    const updated=await changeIncident(incident.id,async current=>{
      if(current.status==='Closed')throw new AppError('This incident is closed.');
      if(type==='Located'&&(current.status!=='Open'||!note))throw new AppError('Record where the child was located.');
      if(type==='Closed'&&current.status!=='Located')throw new AppError('Mark the child located before closing.');
      return {...current,noticeClaim:type==='Shared with police or rescuers'&&!current.noticeClaim&&!current.taskId?noticeClaim:current.noticeClaim,status:type==='Located'||type==='Closed'?type:current.status,actions:[...current.actions,{type,note,staff:who.name,at:now()}]};
    });
    // Claiming the notice is part of the immutable incident change. Only the
    // winning claimant performs the external task creation, never a retry of
    // a losing proposal. Other patrollers can continue recording their work.
    if(updated.noticeClaim===noticeClaim&&!updated.taskId){
      try{const task=await piezas.tasks.create({title:`Mail emergency disclosure notice: ${c.name}`,description:`Mail the family notice. Mailing address: ${c.address || 'Missing: ask the parent for a mailing address.'}`,assignedTo:hana!.userId,externalRecordId:updated.id,priority:'high'});await changeIncident(updated.id,async current=>({...current,taskId:task.id,noticeError:false}));}
      catch{await changeIncident(updated.id,async current=>({...current,noticeError:true}));throw new AppError('Sharing is recorded, but the mailing task could not be confirmed. Ask Hana to check her task list.',503);}
    }
    return {ok:true};
  }
  if(action==='headcount'){
    allow(who,['instructor']);const g=await get<Group>('group',text(b,'groupId',true));if(!g||g.instructorId!==who.userId)throw new AppError('Not found',404);
    const current=await clock();if(current.day!==g.day||!lessonActive(current.time))throw new AppError('Headcounts are paused outside lesson time.');
    const previous=(await all<Headcount>('headcount')).filter(h=>h.groupId===g.id&&h.day===g.day).sort((a,b)=>b.at.localeCompare(a.at))[0];
    if(current.time<(previous?nextHeadcount(previous.time):'10:00'))throw new AppError('The next headcount is not due yet.');
    const count=(await assignedChildren()).filter(c=>c.groupId===g.id).length;
    await append('headcount',{id:crypto.randomUUID(),groupId:g.id,day:g.day,at:now(),time:current.time,count});return {ok:true};
  }
  throw new AppError('Not found',404);
}

