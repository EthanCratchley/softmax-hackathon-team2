// Pure business rules shared by the mock and Piezas service implementations.
import type {
  AuthorizedAdult,
  Child,
  Completion,
  Consent,
  EmergencyContact,
  LessonDate,
  MedicalAnswer,
  MedicalProfile,
  MissingField,
  SafetyAlert,
  Timestamp,
} from './types';

export const RESORT_TIME_ZONE = 'America/Vancouver';
export const MAX_GROUP_SIZE = 6;
export const ESCALATION_MINUTES = 60;
export const ESCALATION_CUTOFF_HOUR = 16;

/**
 * North American numbers: 10 digits, optionally prefixed with country code 1.
 * Formatting characters are ignored. Returns the normalized "+1XXXXXXXXXX" or null.
 */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[\s().+-]/g, '');
  if (!/^\d+$/.test(digits)) return null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

export const isValidPhone = (input: string) => normalizePhone(input) !== null;

const answered = <T>(answer: MedicalAnswer<T>) => answer === 'none' || (Array.isArray(answer) && answer.length > 0);

export function computeCompletion(input: {
  child: Child;
  medical: MedicalProfile;
  emergencyContacts: EmergencyContact[];
  authorizedAdults: AuthorizedAdult[];
  consent: Consent | null;
}): Completion {
  const missing: MissingField[] = [];
  if (input.child.parentUserIds.length === 0) missing.push('parent');
  if (input.emergencyContacts.filter((c) => c.name.trim() && isValidPhone(c.phone)).length < 2) missing.push('emergencyContacts');
  if (!answered(input.medical.allergies)) missing.push('allergies');
  if (!answered(input.medical.conditions)) missing.push('conditions');
  if (!answered(input.medical.medications)) missing.push('medications');
  if (!input.authorizedAdults.some((a) => a.isActive)) missing.push('pickupAdult');
  if (!input.consent) missing.push('consent');
  if (!input.child.mailingAddress?.trim()) missing.push('mailingAddress');
  return { status: missing.length === 0 ? 'Complete' : 'NeedsInformation', missing };
}

/** Need-to-know alerts only: no full history, no contacts. */
export function safetyAlerts(medical: MedicalProfile): SafetyAlert[] {
  const instructions = medical.safetyInstructions.trim();
  const meds = Array.isArray(medical.medications) ? medical.medications : [];
  const medLocation = meds.length ? meds.map((m) => `${m.name}: ${m.location}`).join('; ') : null;
  const alerts: SafetyAlert[] = [];
  for (const allergy of Array.isArray(medical.allergies) ? medical.allergies : []) {
    alerts.push({ kind: 'allergy', summary: `Allergy: ${allergy}`, medicationLocation: medLocation, instructions });
  }
  for (const condition of Array.isArray(medical.conditions) ? medical.conditions : []) {
    alerts.push({ kind: 'condition', summary: `Condition: ${condition}`, medicationLocation: medLocation, instructions });
  }
  if (alerts.length === 0 && meds.length) {
    alerts.push({ kind: 'medication', summary: `Carries ${meds.map((m) => m.name).join(', ')}`, medicationLocation: medLocation, instructions });
  }
  return alerts;
}

export function ageOn(birthDate: LessonDate, on: LessonDate): number {
  const [by, bm, bd] = birthDate.split('-').map(Number);
  const [y, m, d] = on.split('-').map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

/** UTC offset of the resort on a given date, e.g. "-08:00". */
function resortOffset(date: LessonDate): string {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: RESORT_TIME_ZONE, timeZoneName: 'longOffset' })
    .formatToParts(new Date(`${date}T12:00:00Z`))
    .find((p) => p.type === 'timeZoneName')?.value;
  return name?.replace('GMT', '') || '+00:00';
}

/** Earlier of (last seen + 60 min) or 4:00 p.m. resort time on the lesson date. */
export function escalationTime(lastSeenAt: Timestamp, lessonDate: LessonDate): Timestamp {
  const byMinutes = new Date(lastSeenAt).getTime() + ESCALATION_MINUTES * 60_000;
  const cutoff = new Date(`${lessonDate}T${ESCALATION_CUTOFF_HOUR}:00:00${resortOffset(lessonDate)}`).getTime();
  return new Date(Math.min(byMinutes, cutoff)).toISOString();
}

/** Case-insensitive match across first, last and other names. */
export function matchesName(child: Pick<Child, 'firstName' | 'lastName' | 'otherNames'>, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [child.firstName, child.lastName, `${child.firstName} ${child.lastName}`, ...child.otherNames].some((n) =>
    n.toLowerCase().includes(q),
  );
}
