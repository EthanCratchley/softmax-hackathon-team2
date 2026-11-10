// The shared service contract (SPEC §6). UI code calls ONLY these functions,
// via `services` from '@/lib/services' and the user from `requireUser()`.
// The mock and Piezas implementations both satisfy this interface, so swapping
// them changes no UI logic.
import type {
  AuditEvent,
  AuthorizedAdult,
  ChildProfile,
  ChildProfileChanges,
  ChildSearchResult,
  CompletionSummaryRow,
  DeniedPickup,
  DeskPickupView,
  DeskRosterEntry,
  Id,
  Incident,
  IncidentListItem,
  IncidentPacket,
  IncidentUpdate,
  InstructorRosterGroup,
  LastSeenDetails,
  LessonDate,
  LessonPass,
  PassLookupView,
  ParentActivityEvent,
  MyChildSummary,
  NoticeTask,
  OperationsSnapshot,
  PickupCorrection,
  PickupLog,
  PickupRecordView,
  GroupOverview,
  VerifiedUser,
} from '../domain/types';
import type { CommunicationWorkspace, EmergencyAlertInput } from '../domain/communications';

export type ServiceErrorCode =
  /** Missing, or exists but the actor may not know it exists. */
  | 'not_found'
  /** Actor's role may never do this. */
  | 'forbidden'
  /** Input failed validation; see `fields`. */
  | 'invalid'
  /** Business rule blocks it (already released, unlisted adult, open incident, group full). */
  | 'blocked';

export interface ServiceError {
  code: ServiceErrorCode;
  /** Safe to show the user. Never contains another child's data. */
  message: string;
  /** Field path → message, for form validation. */
  fields?: Record<string, string>;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: ServiceError };

export interface KestrelServices {
  // Communications ---------------------------------------------------------
  getCommunicationWorkspace(user: VerifiedUser): Promise<Result<CommunicationWorkspace>>;
  getCommunicationUnreadCount(user: VerifiedUser): Promise<Result<number>>;
  markConversationRead(conversationId: Id, lastVisibleMessageId: Id, user: VerifiedUser): Promise<Result<{ readAt: string }>>;
  markAnnouncementRead(announcementId: Id, user: VerifiedUser): Promise<Result<{ readAt: string }>>;
  startPrivateConversation(childId: Id, body: string, user: VerifiedUser): Promise<Result<{ conversationId: Id }>>;
  replyToAnnouncement(announcementId: Id, childId: Id, body: string, user: VerifiedUser): Promise<Result<{ conversationId: Id }>>;
  replyToConversation(conversationId: Id, body: string, user: VerifiedUser): Promise<Result<{ conversationId: Id }>>;
  createGroupAnnouncement(groupIds: Id[], body: string, user: VerifiedUser): Promise<Result<{ announcementId: Id }>>;
  createEmergencyAlert(input: EmergencyAlertInput, user: VerifiedUser): Promise<Result<{ alertId: Id }>>;
  markEmergencyAlertViewed(alertId: Id, user: VerifiedUser): Promise<Result<{ viewedAt: string }>>;
  acknowledgeEmergencyAlert(alertId: Id, user: VerifiedUser): Promise<Result<{ acknowledgedAt: string }>>;

  // Parent ------------------------------------------------------------------
  getMyChildren(user: VerifiedUser): Promise<Result<MyChildSummary[]>>;
  /** Parent: own child only (else not_found). Admin: use openChildDetailsWithReason. */
  getChildProfile(childId: Id, user: VerifiedUser): Promise<Result<ChildProfile>>;
  updateChildProfile(childId: Id, changes: ChildProfileChanges, user: VerifiedUser): Promise<Result<ChildProfile>>;
  issueLessonPass(childId: Id, input: { lessonDate: LessonDate; purpose: 'dropoff' | 'pickup'; adultId?: Id }, user: VerifiedUser): Promise<Result<LessonPass>>;
  listLessonPasses(childId: Id, lessonDate: LessonDate, user: VerifiedUser): Promise<Result<LessonPass[]>>;
  resolveLessonPass(value: string, lessonDate: LessonDate, user: VerifiedUser): Promise<Result<PassLookupView>>;
  redeemLessonPass(passId: Id, input: { idChecked: boolean; bibNumber?: string }, user: VerifiedUser): Promise<Result<{ redeemedAt: string; occurredAt: string; adultName: string | null; childName: string; eventType: 'checked_in' | 'released' }>>;
  listParentActivity(childId: Id, user: VerifiedUser): Promise<Result<ParentActivityEvent[]>>;

  // Instructor --------------------------------------------------------------
  getInstructorRoster(lessonDate: LessonDate, user: VerifiedUser): Promise<Result<InstructorRosterGroup[]>>;

  // Desk --------------------------------------------------------------------
  /** Optional query matches first, last or other names, or group number. */
  getDeskRoster(lessonDate: LessonDate, user: VerifiedUser, query?: string): Promise<Result<DeskRosterEntry[]>>;
  getDeskPickupView(childId: Id, lessonDate: LessonDate, user: VerifiedUser): Promise<Result<DeskPickupView>>;
  checkInChild(childId: Id, lessonDate: LessonDate, bibNumber: string, user: VerifiedUser): Promise<Result<DeskRosterEntry>>;
  getAuthorizedAdults(childId: Id, user: VerifiedUser): Promise<Result<Pick<AuthorizedAdult, 'id' | 'name' | 'relationship'>[]>>;
  /** Blocked if not checked in, already released, adult not active, idChecked false, or open incident. */
  recordPickup(childId: Id, authorizedAdultId: Id, idChecked: boolean, lessonDate: LessonDate, user: VerifiedUser): Promise<Result<PickupLog>>;
  recordDeniedPickup(childId: Id, statedAdultName: string, reason: string, lessonDate: LessonDate, user: VerifiedUser): Promise<Result<DeniedPickup>>;

  // Incidents ---------------------------------------------------------------
  /** Assigned instructor, desk, or patrol. */
  reportMissingChild(childId: Id, lessonDate: LessonDate, details: LastSeenDetails, user: VerifiedUser): Promise<Result<Incident>>;
  /** Patrol only. Identity fields only — no medical data before an incident exists. */
  searchChildren(query: string, lessonDate: LessonDate, user: VerifiedUser): Promise<Result<ChildSearchResult[]>>;
  /** Patrol (and admin, for the dashboard). */
  listOpenIncidents(user: VerifiedUser): Promise<Result<IncidentListItem[]>>;
  /** Patrol only. Every successful call is audit-logged. */
  getIncidentPacket(incidentId: Id, user: VerifiedUser): Promise<Result<IncidentPacket>>;
  updateIncident(incidentId: Id, update: IncidentUpdate, user: VerifiedUser): Promise<Result<Incident>>;

  // Admin -------------------------------------------------------------------
  /** Never includes medical values. */
  getProfileCompletionSummary(user: VerifiedUser): Promise<Result<CompletionSummaryRow[]>>;
  getOperationsSnapshot(lessonDate: LessonDate, user: VerifiedUser): Promise<Result<OperationsSnapshot>>;
  /** Requires a non-empty reason; logged with who, when, which child and why. */
  openChildDetailsWithReason(childId: Id, reason: string, user: VerifiedUser): Promise<Result<ChildProfile>>;
  /** Blocked if the group already has six children. */
  assignChildToGroup(childId: Id, groupId: Id, user: VerifiedUser): Promise<Result<{ childId: Id; groupId: Id }>>;
  /** Target must be an instructor account. */
  assignInstructorToGroup(groupId: Id, instructorUserId: Id, user: VerifiedUser): Promise<Result<{ groupId: Id; instructorUserId: Id }>>;
  /** Admin: each group with its instructor and children (no medical data). */
  listGroups(user: VerifiedUser): Promise<Result<GroupOverview[]>>;
  /** Admin: the day's release records, each with its corrections. Never edited. */
  listPickups(lessonDate: LessonDate, user: VerifiedUser): Promise<Result<PickupRecordView[]>>;
  /** Adds a correction beside the original; the original pickup log is never changed. */
  addPickupCorrection(pickupLogId: Id, reason: string, note: string, user: VerifiedUser): Promise<Result<PickupCorrection>>;
  /** Hana's open "mail the notice" tasks, created when patrol records sharing with police or rescuers. */
  getNoticeTasks(user: VerifiedUser): Promise<Result<NoticeTask[]>>;
  /** Admin marks the notice as mailed; done tasks drop off the open list. */
  completeNoticeTask(taskId: Id, user: VerifiedUser): Promise<Result<NoticeTask>>;
  /** Newest first. Entries never contain medical values. */
  getAuditLog(user: VerifiedUser): Promise<Result<AuditEvent[]>>;
}
