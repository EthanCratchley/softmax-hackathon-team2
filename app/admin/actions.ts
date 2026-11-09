'use server';

import { revalidatePath } from 'next/cache';
import type { ChildProfile } from '@/lib/domain/types';
import { createDemoState } from '@/lib/fixtures';
import { services, type ServiceError } from '@/lib/services';
import { requireUser } from '@/lib/session';

export type AdminFormState = { ok: true; message: string } | { ok: false; message: string; fields?: Record<string, string> } | null;
export type DetailsState = { ok: true; profile: ChildProfile } | { ok: false; message: string; fields?: Record<string, string> } | null;

// Display names only; every change is authorized and validated by the service.
const demo = createDemoState();
const failed = (error: ServiceError) => ({ ok: false as const, message: error.code === 'not_found' ? 'Not found.' : error.message, fields: error.fields });
const text = (form: FormData, key: string) => String(form.get(key) ?? '').slice(0, 2000);

export async function assignChildAction(_: AdminFormState, form: FormData): Promise<AdminFormState> {
  const user = await requireUser('admin');
  const childId = text(form, 'childId');
  const groupId = text(form, 'groupId');
  const result = await services.assignChildToGroup(childId, groupId, user);
  if (!result.ok) return failed(result.error);
  revalidatePath('/admin');
  const child = demo.children.find((c) => c.id === childId);
  const group = demo.groups.find((g) => g.id === groupId);
  return { ok: true, message: `Moved ${child ? `${child.firstName} ${child.lastName}` : 'the child'} to Group ${group?.groupNumber ?? groupId}.` };
}

export async function assignInstructorAction(_: AdminFormState, form: FormData): Promise<AdminFormState> {
  const user = await requireUser('admin');
  const groupId = text(form, 'groupId');
  const instructorUserId = text(form, 'instructorUserId');
  const result = await services.assignInstructorToGroup(groupId, instructorUserId, user);
  if (!result.ok) return failed(result.error);
  revalidatePath('/admin');
  const group = demo.groups.find((g) => g.id === groupId);
  const instructor = demo.users.find((u) => u.id === instructorUserId);
  return { ok: true, message: `Group ${group?.groupNumber ?? groupId} instructor set to ${instructor?.displayName ?? instructorUserId}.` };
}

export async function addCorrectionAction(pickupLogId: string, _: AdminFormState, form: FormData): Promise<AdminFormState> {
  const user = await requireUser('admin');
  const result = await services.addPickupCorrection(pickupLogId, text(form, 'reason'), text(form, 'note'), user);
  if (!result.ok) return failed(result.error);
  revalidatePath('/admin');
  return { ok: true, message: 'Correction added beside the original record.' };
}

export async function completeNoticeAction(taskId: string, _: AdminFormState): Promise<AdminFormState> {
  const user = await requireUser('admin');
  const result = await services.completeNoticeTask(taskId, user);
  if (!result.ok) return failed(result.error);
  revalidatePath('/admin');
  return { ok: true, message: 'Marked as mailed.' };
}

/** The profile travels only in this action's response, never in a URL. */
export async function openDetailsAction(childId: string, _: DetailsState, form: FormData): Promise<DetailsState> {
  const user = await requireUser('admin');
  const result = await services.openChildDetailsWithReason(childId, text(form, 'reason'), user);
  if (!result.ok) return failed(result.error);
  return { ok: true, profile: result.data };
}
