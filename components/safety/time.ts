import { DEMO_LESSON_DATE } from '@/lib/fixtures';
import { RESORT_TIME_ZONE, resortOffset } from '@/lib/domain/rules';
import type { LessonDate, Timestamp } from '@/lib/domain/types';

/** `?day=YYYY-MM-DD` if it is a real calendar date, else the demo lesson day. */
export function lessonDay(value: unknown): LessonDate {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return DEMO_LESSON_DATE;
  return new Date(`${value}T00:00:00Z`).toISOString().startsWith(value) ? value : DEMO_LESSON_DATE;
}

/** A `datetime-local` value ("2026-12-12T14:30") read as resort time → ISO, or '' if malformed. */
export function resortInstant(local: string): Timestamp {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return '';
  const date = new Date(`${local}:00${resortOffset(local.slice(0, 10))}`);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

const clock = new Intl.DateTimeFormat('en-CA', {
  timeZone: RESORT_TIME_ZONE,
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

/** e.g. "Dec 12, 3:30 p.m." in resort time. */
export const resortTime = (ts: Timestamp) => clock.format(new Date(ts));
