// Synthetic, UI-only communications data for the Piezas mock-first review.
// No message or alert in this module is sent to a real person.
import { createDemoState, GROUP_IDS, USER_IDS } from './fixtures';
import type { VerifiedUser } from './domain/types';

export type DemoMessage = { id: string; senderId: string; senderName: string; body: string; sentAt: string };
export type DemoConversation = {
  id: string; parentUserId: string; parentName: string; childName: string;
  instructorUserId: string; instructorName: string; groupId: string; groupNumber: number;
  messages: DemoMessage[];
};
export type DemoAnnouncement = {
  id: string; instructorUserId: string; instructorName: string; groupId: string;
  groupNumber: number; body: string; sentAt: string;
};
export type DemoAlert = {
  id: string; title: string; reason: string; pickupLocation: string; pickupTime: string;
  instructions: string; contactInfo: string | null; createdAt: string;
  audienceGroupIds: string[] | null; recipients: { userId: string; name: string; acknowledgedAt: string | null }[];
};
export type DemoWorkspace = {
  role: 'parent' | 'instructor' | 'admin'; userId: string; displayName: string;
  groups: { id: string; groupNumber: number; instructorUserId: string }[];
  children: { id: string; name: string; groupId: string; groupNumber: number; instructorUserId: string; instructorName: string }[];
  parentGroups: { userId: string; name: string; groupId: string }[];
  conversations: DemoConversation[]; announcements: DemoAnnouncement[]; alerts: DemoAlert[];
};

const conversations: DemoConversation[] = [
  { id: 'msg_parent_ava', parentUserId: USER_IDS.parentAva, parentName: 'Priya Shah', childName: 'Ava', instructorUserId: USER_IDS.instructorGroup14, instructorName: 'Jordan Lee', groupId: GROUP_IDS.group14, groupNumber: 14, messages: [
    { id: 'm_ava_1', senderId: USER_IDS.parentAva, senderName: 'Priya Shah', body: 'Could you confirm where Group 14 meets after lunch?', sentAt: '2026-12-11T18:10:00-07:00' },
    { id: 'm_ava_2', senderId: USER_IDS.instructorGroup14, senderName: 'Jordan Lee', body: 'We will meet by the green trail map beside the learning area.', sentAt: '2026-12-11T18:24:00-07:00' },
  ] },
  { id: 'msg_parent_owen', parentUserId: USER_IDS.parentOwen, parentName: 'Ngozi Okafor', childName: 'Owen', instructorUserId: USER_IDS.instructorGroup14, instructorName: 'Jordan Lee', groupId: GROUP_IDS.group14, groupNumber: 14, messages: [
    { id: 'm_owen_1', senderId: USER_IDS.parentOwen, senderName: 'Ngozi Okafor', body: 'Is the regular morning meeting point still in use?', sentAt: '2026-12-11T17:38:00-07:00' },
  ] },
  { id: 'msg_parent_lily', parentUserId: USER_IDS.parentLily, parentName: 'Dana Whitfield', childName: 'Lily', instructorUserId: USER_IDS.instructorGroup9, instructorName: 'Sam Rivera', groupId: GROUP_IDS.group9, groupNumber: 9, messages: [
    { id: 'm_lily_1', senderId: USER_IDS.instructorGroup9, senderName: 'Sam Rivera', body: 'Welcome to Group 9. We meet outside the beginner area at 9:15.', sentAt: '2026-12-11T16:45:00-07:00' },
  ] },
  { id: 'msg_parent_noor', parentUserId: USER_IDS.parentOther, parentName: 'Leila Haddad', childName: 'Noor', instructorUserId: USER_IDS.instructorGroup9, instructorName: 'Sam Rivera', groupId: GROUP_IDS.group9, groupNumber: 9, messages: [
    { id: 'm_noor_1', senderId: USER_IDS.parentOther, senderName: 'Leila Haddad', body: 'Thanks for the group update. I have one schedule question for you.', sentAt: '2026-12-11T18:02:00-07:00' },
  ] },
];

const announcements: DemoAnnouncement[] = [
  { id: 'ann_group14', instructorUserId: USER_IDS.instructorGroup14, instructorName: 'Jordan Lee', groupId: GROUP_IDS.group14, groupNumber: 14, body: 'Please meet by the green trail map at 9:15. Bring your lesson pass to check-in.', sentAt: '2026-12-11T16:05:00-07:00' },
  { id: 'ann_group9', instructorUserId: USER_IDS.instructorGroup9, instructorName: 'Sam Rivera', groupId: GROUP_IDS.group9, groupNumber: 9, body: 'Group 9 meets outside the beginner area at 9:15. We will post here if weather changes the meeting point.', sentAt: '2026-12-11T16:30:00-07:00' },
];

const alerts: DemoAlert[] = [{
  id: 'alert_early_dismissal_demo', title: 'Early dismissal notice',
  reason: 'A weather change has made it necessary to end lessons early.',
  pickupLocation: 'Kestrel Kids base lodge, south entrance', pickupTime: '12:30 p.m. today',
  instructions: 'Please collect your child from the Kestrel Kids desk. Staff will release children only to an active authorized adult after checking photo ID. If you are delayed, call the desk before arriving.',
  contactInfo: 'Kestrel Kids desk · (604) 555-0142', createdAt: '2026-12-12T11:45:00-08:00',
  audienceGroupIds: [GROUP_IDS.group14, GROUP_IDS.group9],
  recipients: [
    { userId: USER_IDS.parentAva, name: 'Priya Shah', acknowledgedAt: null },
    { userId: USER_IDS.parentLily, name: 'Dana Whitfield', acknowledgedAt: null },
    { userId: USER_IDS.parentOwen, name: 'Ngozi Okafor', acknowledgedAt: null },
    { userId: USER_IDS.parentOther, name: 'Leila Haddad', acknowledgedAt: null },
  ],
}];

export function getDemoCommunications(user: VerifiedUser): DemoWorkspace {
  const state = createDemoState();
  const groups = state.groups.map(({ id, groupNumber, instructorUserId }) => ({ id, groupNumber, instructorUserId }));
  const parentGroups = state.children.flatMap((child) => child.parentUserIds.flatMap((parentId) => {
    const parent = state.users.find((entry) => entry.id === parentId);
    return child.groupId && parent ? [{ userId: parentId, name: parent.displayName, groupId: child.groupId }] : [];
  }));
  const children = state.children.filter((child) => user.role !== 'parent' || child.parentUserIds.includes(user.id)).flatMap((child) => {
    const group = groups.find((candidate) => candidate.id === child.groupId);
    const instructor = state.users.find((candidate) => candidate.id === group?.instructorUserId);
    return group && instructor ? [{ id: child.id, name: child.firstName, groupId: group.id, groupNumber: group.groupNumber, instructorUserId: instructor.id, instructorName: instructor.displayName }] : [];
  });
  const assignedGroups = groups.filter((g) => user.role === 'admin' || g.instructorUserId === user.id);
  const parentChildGroupIds = state.children.filter((child) => child.parentUserIds.includes(user.id)).map((child) => child.groupId).filter((id): id is string => Boolean(id));
  const visibleGroupIds = user.role === 'parent' ? parentChildGroupIds : assignedGroups.map((group) => group.id);
  const visibleConversations = conversations.filter((conversation) => user.role === 'admin' ||
    (user.role === 'parent' ? conversation.parentUserId === user.id : conversation.instructorUserId === user.id));
  const visibleAnnouncements = announcements.filter((announcement) => user.role === 'admin' || visibleGroupIds.includes(announcement.groupId));
  const visibleAlerts = alerts.filter((alert) => user.role === 'admin' || alert.recipients.some((recipient) => recipient.userId === user.id));
  return {
    role: user.role === 'parent' || user.role === 'instructor' ? user.role : 'admin',
    userId: user.id,
    displayName: user.displayName,
    groups: assignedGroups,
    children,
    parentGroups,
    conversations: visibleConversations,
    announcements: visibleAnnouncements,
    alerts: visibleAlerts,
  };
}
