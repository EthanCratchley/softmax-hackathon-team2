// Synthetic demo dataset — the ONE shared dataset for all four workstreams.
// Every person, phone number and address here is invented. Phones use the
// fictional 555-01xx range; emails use the reserved .test domain.
// IDs are stable: reference children/users by these constants, never by name.
import type {
  Attendance,
  AuthorizedAdult,
  Child,
  Consent,
  DeniedPickup,
  EmergencyContact,
  Incident,
  LessonDate,
  LessonGroup,
  MedicalProfile,
  PickupCorrection,
  PickupLog,
  AuditEvent,
  NoticeTask,
  LessonPass,
  User,
} from './domain/types';

export const DEMO_LESSON_DATE: LessonDate = '2026-12-12';
const SEEDED_AT = '2026-11-07T09:00:00-07:00';

export const USER_IDS = {
  parentAva: 'usr_parent_shah',
  parentLily: 'usr_parent_whitfield',
  parentOwen: 'usr_parent_okafor',
  parentOther: 'usr_parent_haddad',
  instructorGroup14: 'usr_instructor_lee',
  instructorGroup9: 'usr_instructor_rivera',
  desk: 'usr_desk_morgan',
  patrol: 'usr_patrol_fournier',
  admin: 'usr_admin_sato',
} as const;

export const CHILD_IDS = {
  ava: 'chd_ava',
  lily: 'chd_lily',
  owen: 'chd_owen',
  noor: 'chd_noor',
  mateo: 'chd_mateo',
  ella: 'chd_ella',
} as const;

export const GROUP_IDS = { group14: 'grp_14', group9: 'grp_09' } as const;

export const ADULT_IDS = {
  lilyFather: 'adl_lily_tom',
  /** Lily's uncle — seeded INACTIVE so Story B starts with a denial. */
  lilyUncle: 'adl_lily_mark',
  avaMother: 'adl_ava_priya',
  owenFather: 'adl_owen_daniel',
  noorMother: 'adl_noor_leila',
  mateoGuardian: 'adl_mateo_leila',
  ellaMother: 'adl_ella_leila',
} as const;

export const users: User[] = [
  { id: USER_IDS.parentAva, role: 'parent', displayName: 'Priya Shah', email: 'priya.shah@example.test' },
  { id: USER_IDS.parentLily, role: 'parent', displayName: 'Dana Whitfield', email: 'dana.whitfield@example.test' },
  { id: USER_IDS.parentOwen, role: 'parent', displayName: 'Ngozi Okafor', email: 'ngozi.okafor@example.test' },
  { id: USER_IDS.parentOther, role: 'parent', displayName: 'Leila Haddad', email: 'leila.haddad@example.test' },
  { id: USER_IDS.instructorGroup14, role: 'instructor', displayName: 'Jordan Lee', email: 'jordan.lee@example.test' },
  { id: USER_IDS.instructorGroup9, role: 'instructor', displayName: 'Sam Rivera', email: 'sam.rivera@example.test' },
  { id: USER_IDS.desk, role: 'desk', displayName: 'Casey Morgan', email: 'casey.morgan@example.test' },
  { id: USER_IDS.patrol, role: 'patrol', displayName: 'Rob Fournier', email: 'rob.fournier@example.test' },
  { id: USER_IDS.admin, role: 'admin', displayName: 'Hana Sato', email: 'hana.sato@example.test' },
];

const child = (c: Omit<Child, 'createdAt' | 'updatedAt'>): Child => ({ ...c, createdAt: SEEDED_AT, updatedAt: SEEDED_AT });

const medical = (m: Omit<MedicalProfile, 'updatedBy' | 'updatedAt'>, updatedBy: string | null = null): MedicalProfile => ({
  ...m,
  updatedBy,
  updatedAt: updatedBy ? SEEDED_AT : null,
});

export interface DemoState {
  users: User[];
  children: Child[];
  medical: MedicalProfile[];
  contacts: EmergencyContact[];
  adults: AuthorizedAdult[];
  consents: Consent[];
  groups: LessonGroup[];
  attendance: Attendance[];
  pickups: PickupLog[];
  corrections: PickupCorrection[];
  denials: DeniedPickup[];
  incidents: Incident[];
  audit: AuditEvent[];
  noticeTasks: NoticeTask[];
  passes: LessonPass[];
  passAttempts: { id: string; lessonDate: LessonDate; count: number; lockedUntil: string | null }[];
}

/** A fresh deep copy of the seed, so mocks and tests never share mutations. */
export function createDemoState(): DemoState {
  return structuredClone({
    users,
    groups: [
      { id: GROUP_IDS.group14, groupNumber: 14, day: DEMO_LESSON_DATE, skiLevel: 'Intermediate', instructorUserId: USER_IDS.instructorGroup14 },
      { id: GROUP_IDS.group9, groupNumber: 9, day: DEMO_LESSON_DATE, skiLevel: 'Novice', instructorUserId: USER_IDS.instructorGroup9 },
    ],
    children: [
      // Story A: starts with medical categories unanswered; parent adds tree-nut allergy.
      child({ id: CHILD_IDS.ava, firstName: 'Ava', lastName: 'Shah', otherNames: [], birthDate: '2018-03-14', skiLevel: 'Intermediate', groupId: GROUP_IDS.group14, parentUserIds: [USER_IDS.parentAva], liftPassNumber: 'KK-24-1001', mailingAddress: '12 Alder Lane, Squamish, BC V0N 0A1' }),
      // Story B: complete profile; uncle is not active.
      child({ id: CHILD_IDS.lily, firstName: 'Lily', lastName: 'Whitfield', otherNames: [], birthDate: '2017-07-02', skiLevel: 'Novice', groupId: GROUP_IDS.group9, parentUserIds: [USER_IDS.parentLily], liftPassNumber: 'KK-24-1002', mailingAddress: '48 Cedar Road, Whistler, BC V0N 0A2' }),
      // Story C: asthma + inhaler; missing consent so desk sees "Needs information".
      child({ id: CHILD_IDS.owen, firstName: 'Owen', lastName: 'Parr', otherNames: ['Owen Okafor-Parr', 'Okafor-Parr'], birthDate: '2016-11-20', skiLevel: 'Intermediate', groupId: GROUP_IDS.group14, parentUserIds: [USER_IDS.parentOwen], liftPassNumber: 'KK-24-1003', mailingAddress: '7 Spruce Court, Pemberton, BC V0N 0A3' }),
      // Complete; glucose gel held at the desk (S-014).
      child({ id: CHILD_IDS.noor, firstName: 'Noor', lastName: 'Haddad', otherNames: [], birthDate: '2015-05-09', skiLevel: 'Novice', groupId: GROUP_IDS.group9, parentUserIds: [USER_IDS.parentOther], liftPassNumber: 'KK-24-1004', mailingAddress: '3 Birch Way, Whistler, BC V0N 0A4' }),
      // Story D: missing second contact and consent.
      child({ id: CHILD_IDS.mateo, firstName: 'Mateo', lastName: 'Silva', otherNames: [], birthDate: '2019-01-25', skiLevel: 'Novice', groupId: GROUP_IDS.group9, parentUserIds: [USER_IDS.parentOther], liftPassNumber: 'KK-24-1005', mailingAddress: '3 Birch Way, Whistler, BC V0N 0A4' }),
      // Conditions left blank (S-003).
      child({ id: CHILD_IDS.ella, firstName: 'Ella', lastName: 'Haddad', otherNames: [], birthDate: '2017-09-30', skiLevel: 'Intermediate', groupId: GROUP_IDS.group14, parentUserIds: [USER_IDS.parentOther], liftPassNumber: 'KK-24-1006', mailingAddress: '3 Birch Way, Whistler, BC V0N 0A4' }),
    ],
    medical: [
      medical({ childId: CHILD_IDS.ava, allergies: null, conditions: null, medications: null, safetyInstructions: '' }),
      medical({ childId: CHILD_IDS.lily, allergies: 'none', conditions: 'none', medications: 'none', safetyInstructions: '' }, USER_IDS.parentLily),
      medical({ childId: CHILD_IDS.owen, allergies: 'none', conditions: ['Asthma'], medications: [{ name: 'Blue reliever inhaler', location: 'Jacket left chest pocket', heldAtDesk: false }], safetyInstructions: 'If wheezing, help him use the inhaler (2 puffs). Call patrol if no improvement in 5 minutes.' }, USER_IDS.parentOwen),
      medical({ childId: CHILD_IDS.noor, allergies: 'none', conditions: ['Type 1 diabetes'], medications: [{ name: 'Glucose gel', location: 'Ski school desk', heldAtDesk: true }], safetyInstructions: 'If shaky or pale, bring her to the desk for glucose gel.' }, USER_IDS.parentOther),
      medical({ childId: CHILD_IDS.mateo, allergies: 'none', conditions: 'none', medications: 'none', safetyInstructions: '' }, USER_IDS.parentOther),
      medical({ childId: CHILD_IDS.ella, allergies: 'none', conditions: null, medications: 'none', safetyInstructions: '' }, USER_IDS.parentOther),
    ],
    contacts: [
      { id: 'ec_ava_1', childId: CHILD_IDS.ava, name: 'Priya Shah', relationship: 'Mother', phone: '604-555-0101', priority: 1 },
      { id: 'ec_lily_1', childId: CHILD_IDS.lily, name: 'Dana Whitfield', relationship: 'Mother', phone: '604-555-0111', priority: 1 },
      { id: 'ec_lily_2', childId: CHILD_IDS.lily, name: 'Tom Whitfield', relationship: 'Father', phone: '604-555-0112', priority: 2 },
      { id: 'ec_owen_1', childId: CHILD_IDS.owen, name: 'Ngozi Okafor', relationship: 'Mother', phone: '604-555-0121', priority: 1 },
      { id: 'ec_owen_2', childId: CHILD_IDS.owen, name: 'Daniel Parr', relationship: 'Father', phone: '604-555-0122', priority: 2 },
      { id: 'ec_noor_1', childId: CHILD_IDS.noor, name: 'Leila Haddad', relationship: 'Mother', phone: '604-555-0131', priority: 1 },
      { id: 'ec_noor_2', childId: CHILD_IDS.noor, name: 'Karim Haddad', relationship: 'Father', phone: '604-555-0132', priority: 2 },
      { id: 'ec_mateo_1', childId: CHILD_IDS.mateo, name: 'Leila Haddad', relationship: 'Guardian', phone: '604-555-0131', priority: 1 },
      { id: 'ec_ella_1', childId: CHILD_IDS.ella, name: 'Leila Haddad', relationship: 'Mother', phone: '604-555-0131', priority: 1 },
      { id: 'ec_ella_2', childId: CHILD_IDS.ella, name: 'Karim Haddad', relationship: 'Father', phone: '604-555-0132', priority: 2 },
    ],
    adults: [
      { id: ADULT_IDS.avaMother, childId: CHILD_IDS.ava, name: 'Priya Shah', relationship: 'Mother', phone: '604-555-0101', isActive: true, updatedBy: USER_IDS.parentAva, updatedAt: SEEDED_AT },
      { id: ADULT_IDS.lilyFather, childId: CHILD_IDS.lily, name: 'Tom Whitfield', relationship: 'Father', phone: '604-555-0112', isActive: true, updatedBy: USER_IDS.parentLily, updatedAt: SEEDED_AT },
      { id: ADULT_IDS.lilyUncle, childId: CHILD_IDS.lily, name: 'Mark Whitfield', relationship: 'Uncle', phone: '604-555-0113', isActive: false, updatedBy: USER_IDS.parentLily, updatedAt: SEEDED_AT },
      { id: ADULT_IDS.owenFather, childId: CHILD_IDS.owen, name: 'Daniel Parr', relationship: 'Father', phone: '604-555-0122', isActive: true, updatedBy: USER_IDS.parentOwen, updatedAt: SEEDED_AT },
      { id: ADULT_IDS.noorMother, childId: CHILD_IDS.noor, name: 'Leila Haddad', relationship: 'Mother', phone: '604-555-0131', isActive: true, updatedBy: USER_IDS.parentOther, updatedAt: SEEDED_AT },
      { id: ADULT_IDS.mateoGuardian, childId: CHILD_IDS.mateo, name: 'Leila Haddad', relationship: 'Guardian', phone: '604-555-0131', isActive: true, updatedBy: USER_IDS.parentOther, updatedAt: SEEDED_AT },
      { id: ADULT_IDS.ellaMother, childId: CHILD_IDS.ella, name: 'Leila Haddad', relationship: 'Mother', phone: '604-555-0131', isActive: true, updatedBy: USER_IDS.parentOther, updatedAt: SEEDED_AT },
    ],
    consents: [
      { childId: CHILD_IDS.lily, parentUserId: USER_IDS.parentLily, typedName: 'Dana Whitfield', photoConsent: false, consentedAt: SEEDED_AT },
      { childId: CHILD_IDS.noor, parentUserId: USER_IDS.parentOther, typedName: 'Leila Haddad', photoConsent: true, consentedAt: SEEDED_AT },
      { childId: CHILD_IDS.ella, parentUserId: USER_IDS.parentOther, typedName: 'Leila Haddad', photoConsent: true, consentedAt: SEEDED_AT },
    ],
    attendance: [
      { id: 'att_ava', childId: CHILD_IDS.ava, lessonDate: DEMO_LESSON_DATE, status: 'Expected', bibNumber: null, clothingToday: null, checkedInAt: null, checkedInBy: null },
      { id: 'att_lily', childId: CHILD_IDS.lily, lessonDate: DEMO_LESSON_DATE, status: 'CheckedIn', bibNumber: '9', clothingToday: 'Purple jacket, white helmet', checkedInAt: '2026-12-12T09:05:00-07:00', checkedInBy: USER_IDS.desk },
      { id: 'att_owen', childId: CHILD_IDS.owen, lessonDate: DEMO_LESSON_DATE, status: 'Expected', bibNumber: null, clothingToday: 'Red jacket, blue helmet', checkedInAt: null, checkedInBy: null },
      { id: 'att_noor', childId: CHILD_IDS.noor, lessonDate: DEMO_LESSON_DATE, status: 'Expected', bibNumber: null, clothingToday: null, checkedInAt: null, checkedInBy: null },
      { id: 'att_mateo', childId: CHILD_IDS.mateo, lessonDate: DEMO_LESSON_DATE, status: 'Expected', bibNumber: null, clothingToday: null, checkedInAt: null, checkedInBy: null },
      { id: 'att_ella', childId: CHILD_IDS.ella, lessonDate: DEMO_LESSON_DATE, status: 'Expected', bibNumber: null, clothingToday: null, checkedInAt: null, checkedInBy: null },
    ],
    pickups: [],
    corrections: [],
    denials: [],
    incidents: [],
    audit: [],
    noticeTasks: [],
    passes: [],
    passAttempts: [],
  } satisfies DemoState);
}
