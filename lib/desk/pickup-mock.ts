import { initialRoster, mockDeskStaff, type DeskChild } from './fixtures';

export type PickupAdult = {
  id: string;
  childId: string;
  name: string;
  relationship: string;
  active: boolean;
  validFrom?: string;
  validUntil?: string;
  source: 'Parent pickup list' | 'Parent pickup link';
  linkId?: string;
};

// Date windows are evaluated against the selected demo lesson day, inclusively.
// No medical information or credentials belong in this desk-safe mock.
export const pickupAdults: PickupAdult[] = [
  { id: 'lily-parent', childId: 'lily', name: 'Sarah Whitfield', relationship: 'Parent', active: true, source: 'Parent pickup list' },
  { id: 'lily-grace', childId: 'lily', name: 'Grace Okafor', relationship: 'Family friend', active: true, validFrom: '2026-12-12', validUntil: '2026-12-12', source: 'Parent pickup link', linkId: 'demo-lily-grace' },
  { id: 'lily-expired', childId: 'lily', name: 'Robin Whitfield', relationship: 'Relative', active: true, validUntil: '2026-12-11', source: 'Parent pickup list' },
  { id: 'lily-cancelled', childId: 'lily', name: 'Taylor Whitfield', relationship: 'Relative', active: false, source: 'Parent pickup link', linkId: 'demo-cancelled' },
  { id: 'lily-future', childId: 'lily', name: 'Alex Whitfield', relationship: 'Relative', active: true, validFrom: '2026-12-13', source: 'Parent pickup list' },
  { id: 'owen-parent', childId: 'owen', name: 'Nia Parr', relationship: 'Parent', active: true, source: 'Parent pickup list' },
  { id: 'ava-parent', childId: 'ava', name: 'Jamie Chen', relationship: 'Parent', active: true, source: 'Parent pickup list' },
  { id: 'maya-expired', childId: 'maya', name: 'Morgan Brooks', relationship: 'Relative', active: true, validUntil: '2026-12-11', source: 'Parent pickup list' },
  { id: 'leo-parent', childId: 'leo', name: 'Casey Martin', relationship: 'Parent', active: true, source: 'Parent pickup list' },
  { id: 'sam-parent', childId: 'sam', name: 'Riley Rivera', relationship: 'Parent', active: true, source: 'Parent pickup list' },
];

export type ReleaseRecord = {
  childId: string;
  lessonDay: string;
  adultId: string;
  adultName: string;
  staff: string;
  idChecked: true;
  releasedAt: string;
  source: PickupAdult['source'];
  linkId?: string;
};
export type DenialRecord = {
  childId: string;
  lessonDay: string;
  adultName: string;
  reason: string;
  staff: string;
  recordedAt: string;
};
export type MockDeskState = { roster: DeskChild[]; releases: ReleaseRecord[]; denials: DenialRecord[]; error: string };
export type MockDeskAction =
  | { type: 'check-in'; childId: string; day: string; bib: string; at: string }
  | { type: 'release'; childId: string; day: string; adultId: string; idChecked: boolean; at: string }
  | { type: 'deny'; childId: string; day: string; adultName: string; at: string }
  | { type: 'clear-error' };

export function createMockDeskState(): MockDeskState {
  return {
    roster: initialRoster.map(child => ({ ...child })),
    releases: [{ childId: 'leo', lessonDay: '2026-12-12', adultId: 'leo-parent', adultName: 'Casey Martin', staff: mockDeskStaff, idChecked: true, releasedAt: '2026-12-12T14:55:00-08:00', source: 'Parent pickup list' }],
    denials: [], error: '',
  };
}

export function authorizedAdults(childId: string, day: string, adults = pickupAdults) {
  return adults.filter(adult => adult.childId === childId && adult.active && (!adult.validFrom || adult.validFrom <= day) && (!adult.validUntil || adult.validUntil >= day));
}

export function incidentFor(childId: string, day: string): 'open' | 'located' | undefined {
  if (childId === 'owen' && day === '2026-12-12') return 'open';
  if (childId === 'sam' && day === '2026-12-13') return 'located';
}

export function releaseBlock(state: MockDeskState, child: DeskChild) {
  if (child.status === 'released' || state.releases.some(record => record.childId === child.id && record.lessonDay === child.lessonDay)) return 'Release blocked: this child has already been released.';
  if (incidentFor(child.id, child.lessonDay) === 'open') return 'Release blocked: Call patrol. A missing-child incident is open.';
  if (child.status !== 'checked-in') return 'Release blocked: check this child in at the desk first.';
  if (!authorizedAdults(child.id, child.lessonDay).length) return 'Release blocked: no active authorization for this lesson day. Contact an authorized parent or Hana.';
  return '';
}

// Pure mock transitions, kept outside the UI for replacement by Ethan's services.
// These checks protect demo interactions only, not real records or concurrent clients.
export function mockDeskReducer(state: MockDeskState, action: MockDeskAction): MockDeskState {
  if (action.type === 'clear-error') return { ...state, error: '' };
  const child = state.roster.find(row => row.id === action.childId && row.lessonDay === action.day);
  if (!child) return { ...state, error: 'Child not found for this lesson day.' };
  const fail = (error: string) => ({ ...state, error });
  if (action.type === 'check-in') {
    if (child.status !== 'expected') return fail('This child is already checked in or released.');
    if (!/^[1-9]\d{0,2}$/.test(action.bib)) return fail('Enter a bib number from 1 to 999.');
    if (state.roster.some(row => row.lessonDay === action.day && row.status === 'checked-in' && row.bib === action.bib)) return fail(`Bib ${action.bib} is already in use for this lesson day.`);
    return { ...state, error: '', roster: state.roster.map(row => row === child ? { ...row, status: 'checked-in', bib: action.bib, checkedInAt: action.at, checkedInBy: mockDeskStaff } : row) };
  }
  if (action.type === 'deny') {
    const adultName = action.adultName.trim();
    if (!adultName || adultName.length > 100) return fail('Enter the attempted pickup adult’s name (up to 100 characters).');
    return { ...state, error: '', denials: [...state.denials, { childId: child.id, lessonDay: action.day, adultName, reason: 'Adult is not on the current authorized pickup list. Contact an authorized parent or Hana.', staff: mockDeskStaff, recordedAt: action.at }] };
  }
  const block = releaseBlock(state, child);
  if (block) return fail(block);
  // Re-resolve authorization at submission; never trust the selected adult's name.
  const adult = authorizedAdults(child.id, action.day).find(candidate => candidate.id === action.adultId);
  if (!adult) return fail('Release blocked: adult is unlisted, inactive, or outside the authorized dates. Contact an authorized parent or Hana.');
  if (!action.idChecked) return fail('Release blocked: physically check the adult’s ID and confirm it matches.');
  return {
    ...state, error: '',
    roster: state.roster.map(row => row === child ? { ...row, status: 'released' } : row),
    releases: [...state.releases, { childId: child.id, lessonDay: action.day, adultId: adult.id, adultName: adult.name, staff: mockDeskStaff, idChecked: true, releasedAt: action.at, source: adult.source, linkId: adult.linkId }],
  };
}
