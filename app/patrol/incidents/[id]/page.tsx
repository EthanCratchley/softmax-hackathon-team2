import Link from 'next/link';
import { ActionForm } from '@/components/safety/ActionForm';
import { SafetyAlerts } from '@/components/safety/SafetyAlerts';
import { Shell } from '@/components/safety/Shell';
import { resortTime } from '@/components/safety/time';
import s from '@/components/safety/workspace.module.css';
import type { IncidentActionType } from '@/lib/domain/types';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';
import { addIncidentActionAction, setIncidentStatusAction } from '../../actions';

const ACTION_LABEL: Record<IncidentActionType, string> = {
  search: 'Search',
  note: 'Note',
  family_contacted: 'Family contacted',
  shared_with_police_or_rescuers: 'Shared with police or rescuers',
  status_change: 'Status change',
};

const SAVED: Record<string, string> = { action: 'Action recorded.', Located: 'Marked as located.', Closed: 'Incident closed.' };

export default async function IncidentPacketPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser('patrol');
  const { id } = await params;
  const saved = SAVED[(await searchParams).saved ?? ''];
  // One read per page open (audit-logged); never polled.
  const packet = await services.getIncidentPacket(id, user);

  if (!packet.ok)
    return (
      <Shell testId="incident-page" eyebrow="Mountain response / Patrol" title="Emergency packet" lead="Everything patrol needs on one screen.">
        {saved && (
          <p role="status" className={s.notice} data-testid="saved">
            {saved}
          </p>
        )}
        <p role="alert" className={s.error} data-testid="packet-error">
          {packet.error.code === 'not_found' ? 'Not found' : packet.error.message}
        </p>
        <Link href="/patrol" className={s.actionQuiet} data-testid="back-to-patrol">
          ← All incidents
        </Link>
      </Shell>
    );

  const { incident: i, child: c, group, alerts, emergencyContacts, parentClothingToday, escalateAt, staffNames } = packet.data;
  const staff = (id: string) => staffNames[id] ?? 'Staff';
  return (
    <Shell testId="incident-page" eyebrow="Mountain response / Patrol" title="Emergency packet" lead="Everything patrol needs on one screen.">
      <Link href="/patrol" className={s.actionQuiet} data-testid="back-to-patrol">
        ← All incidents
      </Link>
      {saved && (
        <p role="status" className={s.notice} data-testid="saved">
          {saved}
        </p>
      )}
      <section data-testid="emergency-packet">
        <div className={s.packetHead}>
          <h2 data-testid="packet-name">
            {c.firstName} {c.lastName}
          </h2>
          <span className={s.status} data-status={i.status} data-testid="packet-status">
            {i.status}
          </span>
        </div>
        <p className={s.escalation} data-testid="escalation">
          Follow resort procedure: escalate to police if not located by {resortTime(escalateAt)}. This app does not contact police or family.
        </p>

        <div className={s.grid}>
          <article className={s.card} data-testid="packet-identity">
            <h2 className={s.sectionTitle}>Who</h2>
            <dl className={s.facts}>
              <dt>Other names</dt>
              <dd data-testid="packet-other-names">{c.otherNames.length ? c.otherNames.join(', ') : 'None'}</dd>
              <dt>Age</dt>
              <dd data-testid="packet-age">{c.age}</dd>
              <dt>Level</dt>
              <dd>{c.skiLevel}</dd>
              <dt>Group</dt>
              <dd data-testid="packet-group">{group ? `Group ${group.groupNumber} · ${group.instructorName}` : 'No group'}</dd>
              <dt>Lift pass</dt>
              <dd data-testid="packet-lift-pass">{c.liftPassNumber ?? 'Not recorded'}</dd>
              <dt>Bib</dt>
              <dd data-testid="packet-bib">{c.bibNumber ?? 'Not checked in'}</dd>
            </dl>
          </article>

          <article className={s.card} data-testid="packet-last-seen">
            <h2 className={s.sectionTitle}>Last seen</h2>
            <dl className={s.facts}>
              <dt>When</dt>
              <dd data-testid="packet-last-seen-at">{resortTime(i.lastSeenAt)}</dd>
              <dt>Where</dt>
              <dd data-testid="packet-last-seen-location">{i.lastSeenLocation}</dd>
              <dt data-testid="packet-reported-clothing-label">Clothing reported by {staff(i.reportedBy)}</dt>
              <dd data-testid="packet-reported-clothing">{i.clothingDescription || 'Not given'}</dd>
              <dt data-testid="packet-parent-clothing-label">Clothing today, from parent</dt>
              <dd data-testid="packet-parent-clothing">{parentClothingToday ?? 'Not given'}</dd>
              <dt>Equipment</dt>
              <dd data-testid="packet-equipment">{i.equipmentDescription || 'Not given'}</dd>
              <dt>Notes</dt>
              <dd>{i.notes || '—'}</dd>
            </dl>
          </article>

          <article className={s.card} data-testid="packet-safety">
            <h2 className={s.sectionTitle}>Safety alerts</h2>
            {alerts.length ? <SafetyAlerts alerts={alerts} testId="packet-alert" /> : <p data-testid="packet-no-alerts">No safety alerts.</p>}
            <h2 className={s.sectionTitle}>Emergency contacts</h2>
            {emergencyContacts.map((e) => (
              <p key={e.priority} data-testid={`packet-contact-${e.priority}`}>
                {e.priority}. {e.name} · {e.relationship}
                <br />
                <a className={s.tel} href={`tel:${e.phone}`} data-testid={`packet-contact-phone-${e.priority}`}>
                  {e.phone}
                </a>
              </p>
            ))}
          </article>
        </div>

        <h2 className={s.sectionTitle}>Timeline</h2>
        <ol className={s.timeline} data-testid="timeline">
          <li data-testid="timeline-reported">
            {resortTime(i.reportedAt)} · Reported missing · {staff(i.reportedBy)}
          </li>
          {i.actions.map((a) => (
            <li key={a.id} data-testid="timeline-entry" data-type={a.type}>
              {resortTime(a.occurredAt)} · {ACTION_LABEL[a.type]} · {staff(a.staffUserId)} · {a.note}
            </li>
          ))}
        </ol>

        {i.status === 'Closed' ? (
          <p role="status" className={s.notice} data-testid="incident-closed">
            This incident is closed. The timeline is kept; medical details and contacts are no longer shown.
          </p>
        ) : (
        <>
        <ActionForm action={addIncidentActionAction.bind(null, i.id)} testId="incident-action-form" className={s.form}>
          <h2>Record what was done</h2>
          <label className={s.field}>
            Action
            <select name="type" defaultValue="search" data-testid="incident-action-type">
              {(['search', 'note', 'family_contacted', 'shared_with_police_or_rescuers'] as const).map((t) => (
                <option key={t} value={t}>
                  {ACTION_LABEL[t]}
                </option>
              ))}
            </select>
          </label>
          <label className={s.field}>
            Note
            <textarea name="note" rows={3} required data-testid="incident-action-note" />
          </label>
          <button type="submit" className={s.action} data-testid="incident-action-save">
            Record action
          </button>
        </ActionForm>

        <ActionForm action={setIncidentStatusAction.bind(null, i.id)} testId="incident-status-form" className={s.row}>
          {i.status === 'Open' && (
            <button type="submit" name="status" value="Located" className={s.action} data-testid="status-located">
              Located
            </button>
          )}
          <button type="submit" name="status" value="Closed" className={s.actionQuiet} data-testid="status-closed">
            Closed
          </button>
        </ActionForm>
        </>
        )}
      </section>
    </Shell>
  );
}
