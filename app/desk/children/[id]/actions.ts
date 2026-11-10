'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { FormState } from '@/components/safety/ActionForm';
import { lastSeenFromForm } from '@/components/safety/last-seen';
import { lessonDay } from '@/components/safety/time';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';
import type { LessonDate } from '@/lib/domain/types';

type ActionResult = { ok: true; message: string } | { ok: false; message: string };
const validLessonDate = (value: string): value is LessonDate => /^\d{4}-\d{2}-\d{2}$/.test(value);

function refreshDeskViews(childId: string) {
  revalidatePath('/desk');
  revalidatePath(`/desk/children/${encodeURIComponent(childId)}`);
}

function refreshParentNotifications() {
  revalidatePath('/parent/communications');
}

export async function checkInAction(childId: string, lessonDate: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser('desk');
  if (!validLessonDate(lessonDate)) return { ok: false, message: 'Choose a valid lesson date.' };
  const bibNumber = String(formData.get('bibNumber') ?? '').trim();
  const result = await services.checkInChild(childId, lessonDate, bibNumber, user);
  if (!result.ok) return { ok: false, message: result.error.message };
  refreshDeskViews(childId);
  refreshParentNotifications();
  return { ok: true, message: `Checked in ${result.data.firstName} ${result.data.lastName}.` };
}

export async function pickupAction(childId: string, lessonDate: string, authorizedAdultId: string, idChecked: boolean): Promise<ActionResult> {
  const user = await requireUser('desk');
  if (!validLessonDate(lessonDate)) return { ok: false, message: 'Choose a valid lesson date.' };
  const result = await services.recordPickup(childId, authorizedAdultId, idChecked, lessonDate, user);
  if (!result.ok) return { ok: false, message: result.error.message };
  refreshDeskViews(childId);
  refreshParentNotifications();
  return { ok: true, message: `Released to ${result.data.adultNameSnapshot}.` };
}

export async function deniedPickupAction(childId: string, lessonDate: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser('desk');
  if (!validLessonDate(lessonDate)) return { ok: false, message: 'Choose a valid lesson date.' };
  const statedAdultName = String(formData.get('statedAdultName') ?? '').trim();
  const reason = String(formData.get('reason') ?? '').trim();
  const result = await services.recordDeniedPickup(childId, statedAdultName, reason, lessonDate, user);
  if (!result.ok) return { ok: false, message: result.error.message };
  refreshDeskViews(childId);
  return { ok: true, message: 'Denied pickup attempt recorded.' };
}

export async function deskReportMissingAction(childId: string, rawDay: string, _: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser('desk');
  const day = lessonDay(rawDay);
  const result = await services.reportMissingChild(childId, day, lastSeenFromForm(form), user);
  if (!result.ok) return { error: result.error.code === 'not_found' ? 'Not found' : result.error.message, fields: result.error.fields };
  refreshDeskViews(childId);
  redirect(`/desk/children/${encodeURIComponent(childId)}?day=${day}`);
}
