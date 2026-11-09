'use server';
import { redirect } from 'next/navigation';
import { lessonDay, resortInstant } from '@/components/safety/time';
import type { FormState } from '@/components/safety/ActionForm';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';

const text = (form: FormData, key: string) => String(form.get(key) ?? '').slice(0, 500);

export async function reportMissingAction(childId: string, rawDay: string, _: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser('instructor');
  const day = lessonDay(rawDay);
  const result = await services.reportMissingChild(
    childId,
    day,
    {
      lastSeenAt: resortInstant(text(form, 'lastSeenAt')),
      lastSeenLocation: text(form, 'lastSeenLocation'),
      clothingDescription: text(form, 'clothingDescription'),
      equipmentDescription: text(form, 'equipmentDescription'),
      notes: text(form, 'notes'),
    },
    user,
  );
  if (!result.ok) return { error: result.error.code === 'not_found' ? 'Not found' : result.error.message, fields: result.error.fields };
  redirect(`/instructor?day=${day}&reported=${encodeURIComponent(childId)}`);
}
