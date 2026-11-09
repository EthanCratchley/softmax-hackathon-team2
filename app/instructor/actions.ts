'use server';
import { redirect } from 'next/navigation';
import type { FormState } from '@/components/safety/ActionForm';
import { lastSeenFromForm } from '@/components/safety/last-seen';
import { lessonDay } from '@/components/safety/time';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';

export async function reportMissingAction(childId: string, rawDay: string, _: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser('instructor');
  const day = lessonDay(rawDay);
  const result = await services.reportMissingChild(childId, day, lastSeenFromForm(form), user);
  if (!result.ok) return { error: result.error.code === 'not_found' ? 'Not found' : result.error.message, fields: result.error.fields };
  redirect(`/instructor?day=${day}&reported=${encodeURIComponent(childId)}`);
}
