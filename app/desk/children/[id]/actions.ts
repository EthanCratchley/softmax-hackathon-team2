'use server';

import { revalidatePath } from 'next/cache';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';
import type { LessonDate } from '@/lib/domain/types';

type ActionResult = { ok: true; message: string } | { ok: false; message: string };
const validLessonDate = (value: string): value is LessonDate => /^\d{4}-\d{2}-\d{2}$/.test(value);

function refreshDeskViews(childId: string) {
  revalidatePath('/desk');
  revalidatePath(`/desk/children/${encodeURIComponent(childId)}`);
}

export async function checkInAction(childId: string, lessonDate: string, formData: FormData): Promise<ActionResult> {
  const user = await requireUser('desk');
  if (!validLessonDate(lessonDate)) return { ok: false, message: 'Choose a valid lesson date.' };
  const bibNumber = String(formData.get('bibNumber') ?? '').trim();
  const result = await services.checkInChild(childId, lessonDate, bibNumber, user);
  if (!result.ok) return { ok: false, message: result.error.message };
  refreshDeskViews(childId);
  return { ok: true, message: `Checked in ${result.data.firstName} ${result.data.lastName}.` };
}

export async function pickupAction(childId: string, lessonDate: string, authorizedAdultId: string, idChecked: boolean): Promise<ActionResult> {
  const user = await requireUser('desk');
  if (!validLessonDate(lessonDate)) return { ok: false, message: 'Choose a valid lesson date.' };
  const result = await services.recordPickup(childId, authorizedAdultId, idChecked, lessonDate, user);
  if (!result.ok) return { ok: false, message: result.error.message };
  refreshDeskViews(childId);
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
