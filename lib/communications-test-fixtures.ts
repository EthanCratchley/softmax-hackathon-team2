/** Fictional communications used only by the isolated Piezas test-copy seed. */
import { GROUP_IDS, USER_IDS } from './fixtures';
import type { CommAlertRecipient, CommAnnouncement, CommConversation, CommEmergencyAlert, CommMessage } from './domain/communications';

const seededAt = '2026-12-11T16:05:00.000Z';
const conversations: CommConversation[] = [
  { id: 'msg_parent_ava', parentUserId: USER_IDS.parentAva, instructorUserId: USER_IDS.instructorGroup14, childId: 'chd_ava', groupId: GROUP_IDS.group14, createdAt: seededAt },
  { id: 'msg_parent_owen', parentUserId: USER_IDS.parentOwen, instructorUserId: USER_IDS.instructorGroup14, childId: 'chd_owen', groupId: GROUP_IDS.group14, createdAt: seededAt },
  { id: 'msg_parent_lily', parentUserId: USER_IDS.parentLily, instructorUserId: USER_IDS.instructorGroup9, childId: 'chd_lily', groupId: GROUP_IDS.group9, createdAt: seededAt },
  { id: 'msg_parent_noor', parentUserId: USER_IDS.parentOther, instructorUserId: USER_IDS.instructorGroup9, childId: 'chd_noor', groupId: GROUP_IDS.group9, createdAt: seededAt },
];

const messages: CommMessage[] = [
  { id: 'm_ava_1', conversationId: 'msg_parent_ava', senderUserId: USER_IDS.parentAva, body: 'Could you confirm where Group 14 meets after lunch?', sentAt: '2026-12-11T18:10:00.000Z' },
  { id: 'm_ava_2', conversationId: 'msg_parent_ava', senderUserId: USER_IDS.instructorGroup14, body: 'We will meet by the green trail map beside the learning area.', sentAt: '2026-12-11T18:24:00.000Z' },
  { id: 'm_owen_1', conversationId: 'msg_parent_owen', senderUserId: USER_IDS.parentOwen, body: 'Is the regular morning meeting point still in use?', sentAt: '2026-12-11T17:38:00.000Z' },
  { id: 'm_lily_1', conversationId: 'msg_parent_lily', senderUserId: USER_IDS.instructorGroup9, body: 'Welcome to Group 9. We meet outside the beginner area at 9:15.', sentAt: '2026-12-11T16:45:00.000Z' },
  { id: 'm_noor_1', conversationId: 'msg_parent_noor', senderUserId: USER_IDS.parentOther, body: 'Thanks for the group update. I have one schedule question for you.', sentAt: '2026-12-11T18:02:00.000Z' },
];

const announcements: CommAnnouncement[] = [
  { id: 'ann_group14', instructorUserId: USER_IDS.instructorGroup14, groupIds: [GROUP_IDS.group14], body: 'Please meet by the green trail map at 9:15. Bring your lesson pass to check-in.', sentAt: '2026-12-11T16:05:00.000Z' },
  { id: 'ann_group9', instructorUserId: USER_IDS.instructorGroup9, groupIds: [GROUP_IDS.group9], body: 'Group 9 meets outside the beginner area at 9:15. We will post here if weather changes the meeting point.', sentAt: '2026-12-11T16:30:00.000Z' },
];

const emergencyAlerts: CommEmergencyAlert[] = [{
  id: 'alert_early_dismissal_demo', issuedByUserId: USER_IDS.admin, title: 'Early dismissal notice',
  reason: 'A weather change has made it necessary to end lessons early.',
  pickupLocation: 'Kestrel Kids base lodge, south entrance', pickupTime: '12:30 p.m. today',
  instructions: 'Please collect your child from the Kestrel Kids desk. Staff will release children only to an active authorized adult after checking photo ID. If you are delayed, call the desk before arriving.',
  contactInfo: 'Kestrel Kids desk · (604) 555-0142', createdAt: '2026-12-12T19:45:00.000Z',
  groupIds: [GROUP_IDS.group14, GROUP_IDS.group9],
}];

const alertRecipients: CommAlertRecipient[] = [
  { id: 'alert_early_dismissal_demo_usr_parent_shah', alertId: 'alert_early_dismissal_demo', parentUserId: USER_IDS.parentAva, groupIds: [GROUP_IDS.group14], createdAt: emergencyAlerts[0].createdAt, viewedAt: null, acknowledgedAt: null },
  { id: 'alert_early_dismissal_demo_usr_parent_whitfield', alertId: 'alert_early_dismissal_demo', parentUserId: USER_IDS.parentLily, groupIds: [GROUP_IDS.group9], createdAt: emergencyAlerts[0].createdAt, viewedAt: null, acknowledgedAt: null },
  { id: 'alert_early_dismissal_demo_usr_parent_okafor', alertId: 'alert_early_dismissal_demo', parentUserId: USER_IDS.parentOwen, groupIds: [GROUP_IDS.group14], createdAt: emergencyAlerts[0].createdAt, viewedAt: null, acknowledgedAt: null },
  { id: 'alert_early_dismissal_demo_usr_parent_haddad', alertId: 'alert_early_dismissal_demo', parentUserId: USER_IDS.parentOther, groupIds: [GROUP_IDS.group9, GROUP_IDS.group14], createdAt: emergencyAlerts[0].createdAt, viewedAt: null, acknowledgedAt: null },
];

export const communicationsTestSeed = { conversations, messages, announcements, emergencyAlerts, alertRecipients };
