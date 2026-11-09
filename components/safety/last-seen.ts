import type { LastSeenDetails } from '@/lib/domain/types';
import { resortInstant } from './time';

const text = (form: FormData, key: string) => String(form.get(key) ?? '').slice(0, 500);

/** The ReportForm fields as LastSeenDetails; the service validates them. */
export const lastSeenFromForm = (form: FormData): LastSeenDetails => ({
  lastSeenAt: resortInstant(text(form, 'lastSeenAt')),
  lastSeenLocation: text(form, 'lastSeenLocation'),
  clothingDescription: text(form, 'clothingDescription'),
  equipmentDescription: text(form, 'equipmentDescription'),
  notes: text(form, 'notes'),
});
