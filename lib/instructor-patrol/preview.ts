'use client';

import { useSyncExternalStore } from 'react';

// Fictional, temporary design data. Not an authorization or persistence layer.
export const lessonDay = '2026-12-12';
export const instructorId = 'staff-instructor-1';
export const groups = [
  { id: 'group-1', day: lessonDay, level: 'Level 2', instructorId, instructor: 'Tyler Ng', number: 14 },
  { id: 'group-2', day: lessonDay, level: 'Level 1', instructorId: 'staff-instructor-2', instructor: 'Sam Lee', number: 5 },
];
export const children = [
  { id: 'child-ava', name: 'Ava Chen', otherNames: '', birthDate: '2018-03-20', groupId: 'group-1', level: 'Level 2', pass: 'KK-1042', bib: '12', jacket: 'Yellow jacket', helmet: 'Black helmet', alert: 'Tree-nut allergy', medication: 'EpiPen at Kestrel Kids Ski School Desk', instructions: 'Follow the emergency plan and radio patrol immediately if symptoms appear.', contacts: [{ name: 'Jamie Chen', relationship: 'Parent', phone: '604-555-0101' }, { name: 'Robin Chen', relationship: 'Parent', phone: '604-555-0102' }] },
  { id: 'child-owen', name: 'Owen Parr', otherNames: 'Owen Okafor-Parr', birthDate: '2017-07-14', groupId: 'group-1', level: 'Level 2', pass: 'KK-1088', bib: '14', jacket: 'Red jacket', helmet: 'Blue helmet', alert: 'Asthma', medication: 'Inhaler in instructor first-aid pack (synthetic demo location)', instructions: 'Follow the recorded asthma plan and radio patrol for breathing difficulty.', contacts: [{ name: 'Grace Okafor', relationship: 'Mother', phone: '604-555-0103' }, { name: 'Daniel Parr', relationship: 'Father', phone: '604-555-0104' }] },
  { id: 'child-lily', name: 'Lily Whitfield', otherNames: '', birthDate: '2019-04-06', groupId: 'group-2', level: 'Level 1', pass: 'KK-1102', bib: '21', jacket: 'Purple jacket', helmet: 'White helmet', alert: '', medication: '', instructions: '', contacts: [{ name: 'Taylor Whitfield', relationship: 'Parent', phone: '604-555-0105' }, { name: 'Jordan Whitfield', relationship: 'Parent', phone: '604-555-0106' }] },
];
export type Child = typeof children[number];
export type Incident = { id: string; childId: string; reportedBy: string; lastSeenAt: string; place: string; clothing: string; helmet: string; equipment: string; notes: string; status: 'Open' | 'Located' | 'Closed'; locatedAt?: string; locatedPlace?: string; actions: { type: string; note: string; staff: string; at: string }[] };
const initial: { incidents: Incident[]; headcounts: Record<string, string>; noticeTasks: string[] } = {
  incidents: [{ id: 'incident-owen', childId: 'child-owen', reportedBy: 'Tyler Ng', lastSeenAt: `${lessonDay}T14:30:00`, place: 'Top of the Pigeon chair', clothing: 'Blue jacket', helmet: 'White helmet', equipment: 'Skis and poles', notes: 'Separated while the group regrouped by the trail sign.', status: 'Open', actions: [{ type: 'Missing report opened', note: 'Radio patrol and follow resort procedure.', staff: 'Tyler Ng', at: `${lessonDay}T14:40:00-08:00` }] }], headcounts: {}, noticeTasks: [],
};
let state = initial;
const listeners = new Set<() => void>();
export function usePreview() { return useSyncExternalStore((fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => state, () => initial); }
function update(next: typeof state) { state = next; listeners.forEach(fn => fn()); }
export function age(child: Child, day: string) { const birth = child.birthDate; return Number(day.slice(0, 4)) - Number(birth.slice(0, 4)) - (day.slice(5) < birth.slice(5) ? 1 : 0); }
export function escalation(lastSeen: string) { const minutes = Number(lastSeen.slice(11, 13)) * 60 + Number(lastSeen.slice(14, 16)); const limit = Math.min(minutes + 60, 16 * 60); return `${String(Math.floor(limit / 60)).padStart(2, '0')}:${String(limit % 60).padStart(2, '0')}`; }
export function lessonActive(time: string) { return (time >= '09:30' && time < '11:45') || (time >= '12:45' && time < '15:30'); }
export function confirmHeadcount(groupId: string, time: string) { update({ ...state, headcounts: { ...state.headcounts, [groupId]: time } }); }
export function nextHeadcount(time: string) { const total = Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) + 30; const result = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`; return result >= '11:45' && result < '12:45' ? '12:45' : result; }
export function createIncident(input: Omit<Incident, 'id' | 'status' | 'actions'>) {
  const existing = state.incidents.find(i => i.childId === input.childId && i.status !== 'Closed');
  if (existing) return existing.id;
  const id = `incident-${crypto.randomUUID()}`;
  update({ ...state, incidents: [...state.incidents, { ...input, id, status: 'Open', actions: [{ type: 'Missing report opened', note: input.notes, staff: input.reportedBy, at: new Date().toISOString() }] }] });
  return id;
}
export function addAction(id: string, type: string, note: string, status?: Incident['status']) {
  const incident = state.incidents.find(i => i.id === id);
  if (!incident || incident.status === 'Closed') return;
  if (status && !((incident.status === 'Open' && status === 'Located' && note.trim()) || (incident.status === 'Located' && status === 'Closed'))) return;
  const now = new Date();
  update({ ...state, noticeTasks: type === 'Shared with police or rescuers' && !state.noticeTasks.includes(id) ? [...state.noticeTasks, id] : state.noticeTasks, incidents: state.incidents.map(i => i.id === id ? { ...i, status: status ?? i.status, locatedAt: status === 'Located' ? now.toISOString() : i.locatedAt, locatedPlace: status === 'Located' ? note.trim() : i.locatedPlace, actions: [...i.actions, { type, note, staff: 'Casey Brooks · Patrol', at: now.toISOString() }] } : i) });
}
