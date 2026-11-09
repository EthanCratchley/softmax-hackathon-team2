'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/session';
import { services } from '@/lib/services';
import type { ChildProfileChanges } from '@/lib/domain/types';

export async function saveParentProfile(childId: string, _previous: unknown, formData: FormData) {
  const user = await requireUser('parent');
  let changes: ChildProfileChanges;
  try {
    changes = JSON.parse(String(formData.get('profile') ?? '')) as ChildProfileChanges;
  } catch {
    return { ok: false as const, message: 'We could not read these changes. Please review the form and try again.', fields: {} };
  }
  try {
    const current = await services.getChildProfile(childId, user);
    if (!current.ok) return { ok: false as const, message: current.error.message, fields: {} };
    if (!current.data.consent && !changes.consent) return { ok: false as const, message: 'Consent is required before this profile can be completed.', fields: { consent: 'Please provide consent and type your full name.' } };
    const result = await services.updateChildProfile(childId, changes, user);
    if (!result.ok) return { ok: false as const, message: result.error.message, fields: result.error.fields ?? {} };
    revalidatePath('/parent');
    revalidatePath(`/parent/children/${encodeURIComponent(childId)}`);
    const savedAt = new Date(result.data.child.updatedAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Vancouver' });
    return { ok: true as const, message: `Saved ${savedAt}.`, fields: {} };
  } catch {
    return { ok: false as const, message: 'We could not save your updates right now. Check your connection and try again.', fields: {} };
  }
}
