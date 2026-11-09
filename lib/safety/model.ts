export type Role = 'parent' | 'instructor' | 'desk' | 'patrol' | 'admin';
export type Contact = { name: string; relationship: string; phone: string };
export type Adult = Contact & { id: string; active: boolean; date?: string; linkId?: string };
export type Child = {
  id: string; name: string; otherNames: string; birthDate: string; groupId: string; level: string;
  day: string; parents: string[]; pass: string; jacket: string; helmet: string;
  contacts: Contact[]; allergies: string; conditions: string; medications: string;
  location: string; instructions: string; adults: Adult[]; address: string;
  consent?: { name: string; userId: string; at: string; photos: boolean };
  changedBy?: string; changedAt?: string;
};
export type Group = { id: string; day: string; instructorId: string; instructor: string; level: string; number: number };
export type Member = { id: string; userId: string; role: Role; name: string };
export type Incident = { id: string; childId: string; day: string; reportedBy: string; lastSeenAt: string; place: string; clothing: string; helmet: string; equipment: string; notes: string; status: 'Open' | 'Located' | 'Closed'; taskId?: string; noticeClaim?: string; noticeError?: boolean; actions: { type: string; note: string; staff: string; at: string }[] };
export type Event = { id: string; childId: string; day: string; type: string; staff: string; at: string; adultId?: string; adultName?: string; idChecked?: boolean; linkId?: string; bib?: string; reason?: string; originalId?: string };
export type PickupLink = { id: string; childId: string; adultId: string; adultName: string; day: string; cancelled?: boolean; code: string };
export type Headcount = { id: string; groupId: string; day: string; at: string; time: string; count: number };
export const lessonDay = '2026-12-12';
export function missing(c: Child) {
  const fields: string[] = [];
  for (let i=0;i<2;i++) if (!c.contacts[i]?.name.trim() || !validPhone(c.contacts[i]?.phone ?? '')) fields.push(`Emergency contact ${i+1}`);
  for (const key of ['allergies','conditions','medications'] as const) if (!c[key]?.trim()) fields.push(key);
  if (!c.adults.some(a=>a.active && !a.date)) fields.push('Pickup adult');
  if (!c.consent) fields.push('Consent');
  if (!c.address.trim()) fields.push('Mailing address');
  return fields;
}
export function validPhone(phone: string) { return /^\d{10}$/.test(phone.replace(/\D/g,'')) || /^1\d{10}$/.test(phone.replace(/\D/g,'')); }
export function escalation(at: string) { const n=Math.min(Number(at.slice(11,13))*60+Number(at.slice(14,16))+60,960); return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`; }
export function lessonActive(time: string) { return time>='09:30' && time<'11:45' || time>='12:45' && time<'15:30'; }
export function nextHeadcount(time: string) { let n=Number(time.slice(0,2))*60+Number(time.slice(3))+30; if(n>=705 && n<765)n=765; return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`; }
export function mountainNow() { const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Vancouver',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()); const get=(t:string)=>parts.find(p=>p.type===t)?.value; return {day:`${get('year')}-${get('month')}-${get('day')}`,time:`${get('hour')}:${get('minute')}`}; }
