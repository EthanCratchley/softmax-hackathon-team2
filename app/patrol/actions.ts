'use server';
import { redirect } from 'next/navigation';
import type { FormState } from '@/components/safety/ActionForm';
import { lessonDay } from '@/components/safety/time';
import type { IncidentActionType, IncidentStatus } from '@/lib/domain/types';
import type { ServiceError } from '@/lib/services';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';

const ACTION_TYPES: readonly Exclude<IncidentActionType, 'status_change'>[] = ['search', 'note', 'family_contacted', 'shared_with_police_or_rescuers'];
const STATUSES: readonly IncidentStatus[] = ['Located', 'Closed'];

const failed = (error: ServiceError): FormState => ({ error: error.code === 'not_found' ? 'Not found' : error.message, fields: error.fields });

/** A radio call: open an incident with what is known now; patrol fills in the rest on the packet. */
export async function openIncidentAction(childId: string, rawDay: string): Promise<FormState> {
  const user = await requireUser('patrol');
  const day = lessonDay(rawDay);
  const result = await services.reportMissingChild(
    childId,
    day,
    { lastSeenAt: new Date().toISOString(), lastSeenLocation: 'Reported by radio — update', clothingDescription: '', equipmentDescription: '', notes: '' },
    user,
  );
  if (result.ok) redirect(`/patrol/incidents/${result.data.id}`);
  if (result.error.code === 'blocked') {
    // Already reported (e.g. by the instructor): go straight to that packet.
    const open = await services.listOpenIncidents(user);
    const existing = open.ok ? open.data.find((i) => i.childId === childId && i.status === 'Open') : undefined;
    if (existing) redirect(`/patrol/incidents/${existing.id}`);
  }
  return failed(result.error);
}

export async function addIncidentActionAction(incidentId: string, _: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser('patrol');
  const type = ACTION_TYPES.find((t) => t === form.get('type'));
  if (!type) return { error: 'Choose what was done.' };
  const result = await services.updateIncident(incidentId, { kind: 'action', type, note: String(form.get('note') ?? '').slice(0, 2000) }, user);
  if (!result.ok) return failed(result.error);
  redirect(`/patrol/incidents/${incidentId}?saved=action`);
}

export async function setIncidentStatusAction(incidentId: string, _: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser('patrol');
  const status = STATUSES.find((v) => v === form.get('status'));
  if (!status) return { error: 'Choose Located or Closed.' };
  const result = await services.updateIncident(incidentId, { kind: 'status', status }, user);
  if (!result.ok) return failed(result.error);
  redirect(`/patrol/incidents/${incidentId}?saved=${status}`);
}
