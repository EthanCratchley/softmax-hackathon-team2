// Shared domain types for Kestrel Kids. Owned by Platform (Dev 1).
// Change only by team agreement — every screen and service depends on these.

export type Id = string;
/** ISO 8601 timestamp, e.g. "2026-12-12T14:30:00-08:00". */
export type Timestamp = string;
/** Calendar date, "YYYY-MM-DD". */
export type LessonDate = string;

export type Role = 'parent' | 'instructor' | 'desk' | 'patrol' | 'admin';

export interface User {
  id: Id;
  role: Role;
  displayName: string;
  email: string;
}

/**
 * A user whose identity and role the server has verified from the session.
 * Only lib/session.ts produces these; never build one from browser input.
 */
export type VerifiedUser = User & { readonly __verified: true };

export type SkiLevel = 'Beginner' | 'Novice' | 'Intermediate' | 'Advanced';

export type ProfileStatus = 'Complete' | 'NeedsInformation';

export interface Child {
  id: Id;
  firstName: string;
  lastName: string;
  /** Other names the child is known by, e.g. a hyphenated surname. */
  otherNames: string[];
  birthDate: LessonDate;
  skiLevel: SkiLevel;
  groupId: Id | null;
  parentUserIds: Id[];
  liftPassNumber: string | null;
  mailingAddress: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * A medical category answer. `null` = not answered yet; `'none'` = parent
 * explicitly said none. A blank list never counts as "none".
 */
export type MedicalAnswer<T> = T[] | 'none' | null;

export interface Medication {
  name: string;
  /** Where it is kept, e.g. "Jacket left pocket" or "Ski school desk". */
  location: string;
  heldAtDesk: boolean;
}

export interface MedicalProfile {
  childId: Id;
  allergies: MedicalAnswer<string>;
  conditions: MedicalAnswer<string>;
  medications: MedicalAnswer<Medication>;
  /** What staff should do, e.g. "Give EpiPen, call patrol". */
  safetyInstructions: string;
  updatedBy: Id | null;
  updatedAt: Timestamp | null;
}

export interface EmergencyContact {
  id: Id;
  childId: Id;
  name: string;
  relationship: string;
  phone: string;
  priority: 1 | 2;
}

export interface AuthorizedAdult {
  id: Id;
  childId: Id;
  name: string;
  relationship: string;
  phone: string | null;
  isActive: boolean;
  updatedBy: Id;
  updatedAt: Timestamp;
}

export interface Consent {
  childId: Id;
  parentUserId: Id;
  typedName: string;
  photoConsent: boolean;
  consentedAt: Timestamp;
}

export interface LessonGroup {
  id: Id;
  groupNumber: number;
  day: LessonDate;
  skiLevel: SkiLevel;
  instructorUserId: Id;
}

export type AttendanceStatus = 'Expected' | 'CheckedIn' | 'Released';

export interface Attendance {
  id: Id;
  childId: Id;
  lessonDate: LessonDate;
  status: AttendanceStatus;
  bibNumber: string | null;
  /** Parent-given description of today's jacket/helmet. */
  clothingToday: string | null;
  checkedInAt: Timestamp | null;
  checkedInBy: Id | null;
}

/** Append-only. Never updated or deleted; corrections are separate entries. */
export interface PickupLog {
  id: Id;
  childId: Id;
  lessonDate: LessonDate;
  authorizedAdultId: Id;
  adultNameSnapshot: string;
  verifiedByUserId: Id;
  idChecked: true;
  releasedAt: Timestamp;
}

export interface PickupCorrection {
  id: Id;
  pickupLogId: Id;
  correctedBy: Id;
  reason: string;
  note: string;
  createdAt: Timestamp;
}

/** Append-only. */
export interface DeniedPickup {
  id: Id;
  childId: Id;
  lessonDate: LessonDate;
  statedAdultName: string;
  reason: string;
  staffUserId: Id;
  occurredAt: Timestamp;
}

export type IncidentStatus = 'Open' | 'Located' | 'Closed';

export type IncidentActionType =
  | 'search'
  | 'note'
  | 'family_contacted'
  | 'shared_with_police_or_rescuers'
  | 'status_change';

export interface IncidentAction {
  id: Id;
  type: IncidentActionType;
  note: string;
  staffUserId: Id;
  occurredAt: Timestamp;
}

export interface Incident {
  id: Id;
  childId: Id;
  lessonDate: LessonDate;
  reportedBy: Id;
  reportedAt: Timestamp;
  lastSeenAt: Timestamp;
  lastSeenLocation: string;
  clothingDescription: string;
  equipmentDescription: string;
  notes: string;
  status: IncidentStatus;
  actions: IncidentAction[];
  locatedAt: Timestamp | null;
  resolvedAt: Timestamp | null;
}

/** Hana's follow-up to mail the notice required after an emergency disclosure (R-030). */
export interface NoticeTask {
  id: Id;
  childId: Id;
  childName: string;
  incidentId: Id;
  mailingAddress: string | null;
  createdBy: Id;
  createdAt: Timestamp;
  status: 'Open' | 'Done';
}

export type AuditAction =
  | 'sign_in'
  | 'medical_updated'
  | 'contacts_updated'
  | 'pickup_adults_updated'
  | 'consent_given'
  | 'child_checked_in'
  | 'child_released'
  | 'pickup_denied'
  | 'pickup_corrected'
  | 'incident_reported'
  | 'incident_packet_viewed'
  | 'incident_updated'
  | 'admin_viewed_child_details'
  | 'group_assignment_changed'
  | 'notice_task_created'
  | 'pass_issued'
  | 'pass_redeemed'
  | 'pass_lookup_failed'
  | 'access_denied';

/** Append-only. `detailsSummary` never contains medical values. */
export interface AuditEvent {
  id: Id;
  actorUserId: Id;
  action: AuditAction;
  entityType: string;
  entityId: Id;
  occurredAt: Timestamp;
  detailsSummary: string;
}

export type PassPurpose = 'dropoff' | 'pickup';

/** Server-held bearer pass. The UI receives only the token/code for display. */
export interface LessonPass {
  id: Id;
  childId: Id;
  lessonDate: LessonDate;
  purpose: PassPurpose;
  adultId: Id | null;
  adultName: string | null;
  token: string;
  shortCode: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  redeemedAt: Timestamp | null;
  redeemedByStaffId: Id | null;
  idChecked: boolean;
}

export interface PassLookupView {
  passId: Id;
  childId: Id;
  childFirstName: string;
  childLastName: string;
  groupNumber: number | null;
  lessonDate: LessonDate;
  purpose: PassPurpose;
  adultName: string | null;
  adultOnList: boolean;
  expiresAt: Timestamp;
  redeemedAt: Timestamp | null;
  canRedeem: boolean;
  blockedReason: string | null;
}

export interface ParentActivityEvent {
  id: Id;
  kind: 'checked_in' | 'released';
  at: Timestamp;
  lessonDate: LessonDate;
  adultName?: string;
}

// ---------------------------------------------------------------------------
// Role-specific views returned by services (need-to-know projections)
// ---------------------------------------------------------------------------

export type MissingField =
  | 'parent'
  | 'emergencyContacts'
  | 'allergies'
  | 'conditions'
  | 'medications'
  | 'pickupAdult'
  | 'consent'
  | 'mailingAddress';

export interface Completion {
  status: ProfileStatus;
  missing: MissingField[];
}

/** Parent: summary card on /parent. */
export interface MyChildSummary {
  id: Id;
  firstName: string;
  lastName: string;
  groupNumber: number | null;
  skiLevel: SkiLevel | null;
  lessonDay: LessonDate | null;
  completion: Completion;
  updatedAt: Timestamp;
}

/** Parent (own child) or admin (with logged reason): the full editable profile. */
export interface ChildProfile {
  child: Child;
  medical: MedicalProfile;
  emergencyContacts: EmergencyContact[];
  authorizedAdults: AuthorizedAdult[];
  consent: Consent | null;
  /** Display name of whoever last changed the medical details (R-008). */
  medicalUpdatedByName: string | null;
  /** Parent-given jacket/helmet description per lesson day the child attends. */
  clothing: { lessonDate: LessonDate; description: string | null }[];
  completion: Completion;
}

/** The only medical information an instructor or patroller sees. */
export interface SafetyAlert {
  kind: 'allergy' | 'condition' | 'medication';
  summary: string;
  medicationLocation: string | null;
  instructions: string;
}

export interface InstructorRosterEntry {
  childId: Id;
  firstName: string;
  lastName: string;
  age: number;
  skiLevel: SkiLevel;
  alerts: SafetyAlert[];
  hasOpenIncident: boolean;
}

export interface InstructorRosterGroup {
  groupId: Id;
  groupNumber: number;
  skiLevel: SkiLevel;
  children: InstructorRosterEntry[];
}

export type DeskPickupState =
  | { kind: 'Expected' }
  | { kind: 'CheckedIn' }
  /** incidentToday: a resolved incident happened today — refer family questions to the admin. */
  | { kind: 'Released'; adultName: string; releasedAt: Timestamp; incidentToday: boolean }
  | { kind: 'OpenIncident' }
  | { kind: 'IncidentToday' };

export interface DeskRosterEntry {
  childId: Id;
  firstName: string;
  lastName: string;
  otherNames: string[];
  groupNumber: number | null;
  status: AttendanceStatus;
  bibNumber: string | null;
  checkedInAt: Timestamp | null;
  needsInformation: boolean;
  pickup: DeskPickupState;
}

/** Desk pickup screen: active adults and state, no medical data. */
export interface DeskPickupView {
  entry: DeskRosterEntry;
  authorizedAdults: Pick<AuthorizedAdult, 'id' | 'name' | 'relationship'>[];
  /** e.g. "Holds EpiPen for this child" — only for meds kept at the desk. */
  deskHeldMedications: string[];
}

export interface LastSeenDetails {
  lastSeenAt: Timestamp;
  lastSeenLocation: string;
  clothingDescription: string;
  equipmentDescription: string;
  notes: string;
}

export interface IncidentListItem {
  id: Id;
  childId: Id;
  childName: string;
  groupNumber: number | null;
  status: IncidentStatus;
  lastSeenAt: Timestamp;
  lastSeenLocation: string;
  escalateAt: Timestamp;
}

/** Patrol's one-screen emergency packet. */
export interface IncidentPacket {
  incident: Incident;
  child: {
    id: Id;
    firstName: string;
    lastName: string;
    otherNames: string[];
    age: number;
    skiLevel: SkiLevel;
    liftPassNumber: string | null;
    bibNumber: string | null;
  };
  group: { groupNumber: number; instructorName: string } | null;
  parentClothingToday: string | null;
  alerts: SafetyAlert[];
  emergencyContacts: Pick<EmergencyContact, 'name' | 'relationship' | 'phone' | 'priority'>[];
  /** The earlier of lastSeenAt + 60 minutes or 4:00 p.m. that day. */
  escalateAt: Timestamp;
  /** Display names for the staff ids in incident.actions and reportedBy. */
  staffNames: Record<Id, string>;
}

/** Patrol search before an incident exists: identity only. */
export interface ChildSearchResult {
  childId: Id;
  firstName: string;
  lastName: string;
  age: number;
  groupNumber: number | null;
}

export interface CompletionSummaryRow {
  childId: Id;
  firstName: string;
  lastName: string;
  groupNumber: number | null;
  missing: MissingField[];
}

export interface OperationsSnapshot {
  lessonDate: LessonDate;
  expected: number;
  checkedIn: number;
  released: number;
  openIncidents: IncidentListItem[];
  deniedPickups: (Pick<DeniedPickup, 'id' | 'childId' | 'statedAdultName' | 'occurredAt'> & { childName: string })[];
}

/** Admin: one release record with the names needed to review it, plus any corrections. */
export interface PickupRecordView extends PickupLog {
  childName: string;
  verifiedByName: string;
  corrections: PickupCorrection[];
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export interface ChildProfileChanges {
  allergies?: MedicalAnswer<string>;
  conditions?: MedicalAnswer<string>;
  medications?: MedicalAnswer<Medication>;
  safetyInstructions?: string;
  /** Replaces the full list. Exactly two requested. */
  emergencyContacts?: Omit<EmergencyContact, 'id' | 'childId'>[];
  /** Upsert by id; omit id to add. Deactivate with isActive:false. */
  authorizedAdults?: (Pick<AuthorizedAdult, 'name' | 'relationship' | 'phone' | 'isActive'> & { id?: Id })[];
  mailingAddress?: string;
  consent?: { typedName: string; photoConsent: boolean };
  /** Jacket/helmet for one lesson day; the child must be attending that day. */
  clothingToday?: { lessonDate: LessonDate; description: string };
}

export type IncidentUpdate =
  | { kind: 'action'; type: Exclude<IncidentActionType, 'status_change'>; note: string }
  | { kind: 'status'; status: IncidentStatus; note?: string };
