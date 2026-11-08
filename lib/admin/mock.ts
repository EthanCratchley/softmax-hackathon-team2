import { initialRoster, type DeskChild } from '../desk/fixtures';
import { createMockDeskState, incidentFor, type DenialRecord, type ReleaseRecord } from '../desk/pickup-mock';

export const demoAdmin = 'Hana Sato (demo admin)';
export const requiredFields = {
  contact1: 'First emergency contact with valid phone',
  contact2: 'Second emergency contact with valid phone',
  allergies: 'Allergies answer or explicit none',
  conditions: 'Conditions answer or explicit none',
  medications: 'Medications answer or explicit none',
  pickup: 'Active authorized pickup adult',
  consent: 'Signed consent',
  address: 'Mailing address',
} as const;
export type RequiredField = keyof typeof requiredFields;
// Synthetic completion metadata, not inferred medical values. The desk's boolean
// flags alone cannot tell us which fields are missing. Existing fixtures stay intact.
export const missingFields: Record<string, RequiredField[]> = {
  owen: ['contact2', 'consent'], maya: ['address', 'medications', 'pickup'],
  ava: [], lily: [], leo: [], sam: [],
};
export const instructors = [
  { id: 'demo-instructor-a', name: 'Demo instructor A' },
  { id: 'demo-instructor-b', name: 'Demo instructor B' },
  { id: 'demo-instructor-c', name: 'Demo instructor C' },
];
export type AdminGroup = { id: string; name: string; day: string; instructorId: string };
export type AccessEntry = { childId: string; reason: string; staff: string; at: string };
export type Correction = { target: string; childId: string; note: string; reason: string; staff: string; at: string };
export type Headcount = { groupId: string; day: string; dueAt: string; confirmedAt?: string };
export type InstructorContact = { instructorId: string; day: string; lastContactAt: string };
export type AdminState = {
  roster: DeskChild[];
  groups: AdminGroup[];
  releases: ReleaseRecord[];
  denials: DenialRecord[];
  access: AccessEntry[];
  corrections: Correction[];
  headcounts: Headcount[];
  instructorContacts: InstructorContact[];
  openedChildId: string | null;
  error: string;
  message: string;
};
export type AdminAction =
  | { type: 'assign-child'; childId: string; groupId: string; day: string }
  | { type: 'assign-instructor'; groupId: string; instructorId: string; day: string }
  | { type: 'open-details'; childId: string; reason: string; at: string }
  | { type: 'close-details' }
  | { type: 'correct'; target: string; note: string; reason: string; at: string };

export function createAdminState(): AdminState {
  const desk = createMockDeskState();
  const groups: AdminGroup[] = [];
  for (const child of initialRoster) {
    if (!groups.some(group => group.day === child.lessonDay && group.name === child.group)) {
      groups.push({ id: `${child.lessonDay}-${child.group.toLowerCase().replaceAll(' ', '-')}`, name: child.group, day: child.lessonDay, instructorId: instructors[groups.length % instructors.length].id });
    }
  }
  return {
    roster: desk.roster, releases: desk.releases, groups,
    // A labeled, synthetic Story B example; not a live denial from the desk session.
    denials: [{ childId: 'lily', lessonDay: '2026-12-12', adultName: 'Mark Whitfield', reason: 'Adult not listed. Contact an authorized parent or Hana.', staff: 'Jordan Ellis (demo desk staff)', recordedAt: '2026-12-12T14:40:00-08:00' }],
    headcounts: groups.map((group, index) => ({ groupId: group.id, day: group.day, dueAt: `${group.day}T14:30:00-08:00`, ...(index === 0 ? {} : { confirmedAt: `${group.day}T14:31:00-08:00` }) })),
    instructorContacts: [...new Set(groups.map(group => group.day))].flatMap(day => instructors.map((person, index) => ({ instructorId: person.id, day, lastContactAt: `${day}T${index === 0 ? '14:45' : '15:05'}:00-08:00` }))),
    access: [], corrections: [], openedChildId: null, error: '', message: '',
  };
}

export const groupChildren = (state: AdminState, group: AdminGroup) => state.roster.filter(child => child.lessonDay === group.day && child.group === group.name);

export function adminReducer(state: AdminState, action: AdminAction): AdminState {
  const fail = (error: string) => ({ ...state, error, message: '' });
  if (action.type === 'close-details') return { ...state, openedChildId: null, error: '', message: '' };
  if (action.type === 'assign-child') {
    const child = state.roster.find(row => row.id === action.childId && row.lessonDay === action.day);
    const group = state.groups.find(row => row.id === action.groupId && row.day === action.day);
    if (!child || !group) return fail('Choose a child and a group for the selected lesson day.');
    if (child.group !== group.name && groupChildren(state, group).length >= 6) return fail('Group is full. A group cannot exceed six children.');
    return { ...state, error: '', message: `${child.name} assigned to ${group.name}.`, roster: state.roster.map(row => row === child ? { ...row, group: group.name } : row) };
  }
  if (action.type === 'assign-instructor') {
    const group = state.groups.find(row => row.id === action.groupId && row.day === action.day);
    const instructor = instructors.find(row => row.id === action.instructorId);
    if (!group || !instructor) return fail('Choose a group and instructor for the selected lesson day.');
    return { ...state, error: '', message: `${instructor.name} assigned to ${group.name}.`, groups: state.groups.map(row => row === group ? { ...row, instructorId: instructor.id } : row) };
  }
  if (action.type === 'open-details') {
    if (!state.roster.some(child => child.id === action.childId)) return { ...fail('Child not found.'), openedChildId: null };
    const reason = action.reason.trim();
    if (!reason || reason.length > 500) return { ...fail('Give a reason before opening protected child details (up to 500 characters).'), openedChildId: null };
    return { ...state, error: '', message: 'Protected details opened; reason added to the temporary mock access log.', openedChildId: action.childId, access: [...state.access, { childId: action.childId, reason, staff: demoAdmin, at: action.at }] };
  }
  const match = /^(pickup|access):(\d+)$/.exec(action.target);
  const original = match ? (match[1] === 'pickup' ? state.releases[Number(match[2])] : state.access[Number(match[2])]) : undefined;
  if (!original) return fail('Choose an existing pickup record or access entry to correct.');
  const reason = action.reason.trim();
  const note = action.note.trim();
  if (!reason || reason.length > 500 || !note || note.length > 1000) return fail('Enter a correction and a reason. The original record will remain unchanged.');
  return {
    ...state, error: '', message: 'Correction added beside the original record.',
    corrections: [...state.corrections, { target: action.target, childId: original.childId, note, reason, staff: demoAdmin, at: action.at }],
  };
}

export function dailySummary(state: AdminState, day: string) {
  const children = state.roster.filter(child => child.lessonDay === day);
  return {
    expected: children.filter(child => child.status === 'expected').length,
    checkedIn: children.filter(child => child.status === 'checked-in').length,
    released: children.filter(child => child.status === 'released').length,
    missing: children.filter(child => incidentFor(child.id, day) === 'open').length,
  };
}

// Deterministic lesson-time snapshot. No timers, emails, or real background jobs.
export const demoNow = (day: string) => `${day}T15:10:00-08:00`;
export function operationalWarnings(state: AdminState, day: string, at = demoNow(day), lessonInProgress = true) {
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Vancouver' }).format(new Date(at));
  if (!lessonInProgress || (time >= '11:45' && time < '12:45')) return { overdue: [], lostContact: [] };
  const groups = state.groups.filter(group => group.day === day);
  const overdue = groups.filter(group => state.headcounts.some(record => record.groupId === group.id && record.day === day && !record.confirmedAt && Date.parse(at) - Date.parse(record.dueAt) > 10 * 60_000));
  const lostContact = groups.filter(group => state.instructorContacts.some(record => record.instructorId === group.instructorId && record.day === day && Date.parse(at) - Date.parse(record.lastContactAt) >= 20 * 60_000));
  return { overdue, lostContact };
}

export const failedEmails = [{ id: 'demo-email-lily-checkin', childId: 'lily', day: '2026-12-12', type: 'Check-in', at: '2026-12-12T09:05:00-08:00', message: 'Synthetic delivery failure; no email was actually sent.' }];
export const pendingNotices = [{ id: 'demo-notice-owen', childId: 'owen', day: '2026-12-12', title: 'Mail emergency disclosure notice', cause: 'Synthetic example: information shared with police or rescuers.' }];
