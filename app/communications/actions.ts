'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/session';
import { services } from '@/lib/services';
import type { EmergencyAlertInput } from '@/lib/domain/communications';

type ActionResult = { ok: true; message: string } | { ok: false; message: string };
type CountResult = { ok: true; count: number } | { ok: false };
const failed = (message: string): ActionResult => ({ ok: false, message });
const text = (value: unknown, max: number) => String(value ?? '').slice(0, max);

function refreshCommunications() {
  revalidatePath('/parent');
  revalidatePath('/parent/communications');
  revalidatePath('/instructor/communications');
  revalidatePath('/admin/communications');
}

export async function startConversationAction(childId: string, body: string): Promise<ActionResult> {
  const user = await requireUser('parent');
  try {
    const result = await services.startPrivateConversation(text(childId, 120), text(body, 1000), user);
    if (!result.ok) return failed(result.error.message);
    refreshCommunications();
    return { ok: true, message: 'Private message sent.' };
  } catch {
    return failed('We could not send your message right now. Please try again.');
  }
}

export async function replyToAnnouncementAction(announcementId: string, childId: string, body: string): Promise<ActionResult> {
  const user = await requireUser('parent');
  try {
    const result = await services.replyToAnnouncement(text(announcementId, 120), text(childId, 120), text(body, 1000), user);
    if (!result.ok) return failed(result.error.message);
    refreshCommunications();
    return { ok: true, message: 'Private reply sent to your instructor.' };
  } catch {
    return failed('We could not send your reply right now. Please try again.');
  }
}

export async function replyToConversationAction(conversationId: string, body: string): Promise<ActionResult> {
  const user = await requireUser('parent', 'instructor');
  try {
    const result = await services.replyToConversation(text(conversationId, 120), text(body, 1000), user);
    if (!result.ok) return failed(result.error.message);
    refreshCommunications();
    return { ok: true, message: 'Private reply sent.' };
  } catch {
    return failed('We could not send your reply right now. Please try again.');
  }
}

export async function postAnnouncementAction(groupIds: string[], body: string): Promise<ActionResult> {
  const user = await requireUser('instructor');
  try {
    const result = await services.createGroupAnnouncement(groupIds.slice(0, 30).map((id) => text(id, 120)), text(body, 2000), user);
    if (!result.ok) return failed(result.error.message);
    refreshCommunications();
    return { ok: true, message: 'Announcement posted to the selected lesson groups.' };
  } catch {
    return failed('We could not post the announcement right now. Please try again.');
  }
}

export async function issueEmergencyAlertAction(input: EmergencyAlertInput): Promise<ActionResult> {
  const user = await requireUser('admin');
  try {
    const result = await services.createEmergencyAlert({
      title: text(input.title, 120),
      reason: text(input.reason, 300),
      pickupLocation: text(input.pickupLocation, 240),
      pickupTime: text(input.pickupTime, 100),
      instructions: text(input.instructions, 2000),
      contactInfo: text(input.contactInfo, 240),
      allParents: input.allParents === true,
      groupIds: Array.isArray(input.groupIds) ? input.groupIds.slice(0, 30).map((id) => text(id, 120)) : [],
    }, user);
    if (!result.ok) return failed(result.error.message);
    refreshCommunications();
    return { ok: true, message: 'Urgent alert posted in the parent portal.' };
  } catch {
    return failed('We could not post the alert right now. Please try again.');
  }
}

export async function markEmergencyAlertViewedAction(alertId: string): Promise<ActionResult> {
  const user = await requireUser('parent');
  try {
    const result = await services.markEmergencyAlertViewed(text(alertId, 120), user);
    if (result.ok) revalidatePath('/admin/communications');
    return result.ok ? { ok: true, message: 'Alert view recorded.' } : failed(result.error.message);
  } catch {
    return failed('We could not update the alert status.');
  }
}

export async function getCommunicationUnreadCountAction(): Promise<CountResult> {
  const user = await requireUser('parent', 'instructor');
  try {
    const result = await services.getCommunicationUnreadCount(user);
    return result.ok ? { ok: true, count: result.data } : { ok: false };
  } catch {
    return { ok: false };
  }
}

export async function markConversationReadAction(conversationId: string, lastVisibleMessageId: string): Promise<ActionResult> {
  const user = await requireUser('parent', 'instructor');
  try {
    const result = await services.markConversationRead(text(conversationId, 120), text(lastVisibleMessageId, 120), user);
    if (!result.ok) return failed(result.error.message);
    revalidatePath('/');
    return { ok: true, message: 'Conversation marked as read.' };
  } catch {
    return failed('We could not update the conversation status.');
  }
}

export async function markAnnouncementReadAction(announcementId: string): Promise<ActionResult> {
  const user = await requireUser('parent');
  try {
    const result = await services.markAnnouncementRead(text(announcementId, 120), user);
    if (!result.ok) return failed(result.error.message);
    revalidatePath('/');
    return { ok: true, message: 'Announcement marked as read.' };
  } catch {
    return failed('We could not update the announcement status.');
  }
}

export async function acknowledgeEmergencyAlertAction(alertId: string): Promise<ActionResult> {
  const user = await requireUser('parent');
  try {
    const result = await services.acknowledgeEmergencyAlert(text(alertId, 120), user);
    if (!result.ok) return failed(result.error.message);
    refreshCommunications();
    return { ok: true, message: 'Alert acknowledgement recorded.' };
  } catch {
    return failed('We could not record your acknowledgement. Please try again.');
  }
}
