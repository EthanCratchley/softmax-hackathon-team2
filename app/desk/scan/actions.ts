'use server';

import { requireUser } from '@/lib/session';
import { services } from '@/lib/services';
import { DEMO_LESSON_DATE } from '@/lib/fixtures';

export async function resolveDeskPass(value: string) {
  const user = await requireUser('desk');
  return services.resolveLessonPass(value, DEMO_LESSON_DATE, user);
}

export async function redeemDeskPass(passId: string, input: { idChecked: boolean; bibNumber?: string }) {
  const user = await requireUser('desk');
  return services.redeemLessonPass(passId, input, user);
}
