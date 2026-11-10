/** Feature-local messaging types. Keep these out of platform-owned domain/types.ts. */
export type CommMessage = {
  id: string;
  conversationId: string;
  senderUserId: string;
  body: string;
  sentAt: string;
  /** Optional for compatibility with messages persisted before announcement replies were linked. */
  announcementId?: string;
  /** Server-generated attendance notice stored in the existing message record stream. */
  attendanceNotice?: {
    eventKey: string;
    recipientUserId: string;
    childId: string;
    childName: string;
    eventType: 'checked_in' | 'released';
    occurredAt: string;
    lessonDate: string;
    pickupAdultName?: string;
  };
};

export type CommConversation = {
  id: string;
  parentUserId: string;
  instructorUserId: string;
  childId: string;
  groupId: string;
  createdAt: string;
};

export type CommAnnouncement = {
  id: string;
  instructorUserId: string;
  groupIds: string[];
  body: string;
  sentAt: string;
};

export type CommEmergencyAlert = {
  id: string;
  issuedByUserId: string;
  title: string;
  reason: string;
  pickupLocation: string;
  pickupTime: string;
  instructions: string;
  contactInfo: string | null;
  groupIds: string[] | null;
  createdAt: string;
};

export type CommAlertRecipient = {
  id: string;
  alertId: string;
  parentUserId: string;
  groupIds: string[];
  createdAt: string;
  viewedAt: string | null;
  acknowledgedAt: string | null;
};

export type CommReadState = {
  id: string;
  recipientUserId: string;
  targetType: 'conversation' | 'announcement';
  targetId: string;
  /** The last message actually present in the conversation when it was opened. */
  lastReadMessageId: string | null;
  readAt: string;
};

export type CommunicationWorkspace = {
  role: 'parent' | 'instructor' | 'admin';
  userId: string;
  displayName: string;
  groups: { id: string; groupNumber: number; instructorUserId: string }[];
  children: { id: string; name: string; groupId: string; groupNumber: number; instructorUserId: string; instructorName: string }[];
  conversations: {
    id: string; parentUserId: string; parentName: string; childName: string;
    instructorUserId: string; instructorName: string; groupId: string; groupNumber: number;
    messages: (CommMessage & {
      senderName: string;
      announcementContext: { id: string; title: string; excerpt: string; sentAt: string } | null;
    })[];
  }[];
  attendanceNotifications: NonNullable<CommMessage['attendanceNotice']>[];
  announcements: {
    id: string; instructorUserId: string; instructorName: string; groupIds: string[];
    groupNumbers: number[]; body: string; sentAt: string;
  }[];
  alerts: {
    id: string; issuerName: string; title: string; reason: string; pickupLocation: string;
    pickupTime: string; instructions: string; contactInfo: string | null; createdAt: string;
    groupIds: string[] | null;
    recipient: { createdAt: string; viewedAt: string | null; acknowledgedAt: string | null } | null;
    recipients: { userId: string; name: string; createdAt: string; viewedAt: string | null; acknowledgedAt: string | null }[];
  }[];
};

export type EmergencyAlertInput = {
  title: string;
  reason: string;
  pickupLocation: string;
  pickupTime: string;
  instructions: string;
  contactInfo?: string;
  allParents: boolean;
  groupIds: string[];
};
