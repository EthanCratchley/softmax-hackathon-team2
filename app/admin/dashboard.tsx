'use client';

import { useRouter } from 'next/navigation';
import type { CompletionSummaryRow, OperationsSnapshot } from '@/lib/domain/types';
import { lessonDays } from '@/lib/desk/fixtures';
import desk from '../desk/roster.module.css';
import styles from './dashboard.module.css';

const missingLabels: Record<CompletionSummaryRow['missing'][number], string> = {
  parent: 'Linked parent',
  emergencyContacts: 'Emergency contacts',
  allergies: 'Allergies answer or explicit none',
  conditions: 'Conditions answer or explicit none',
  medications: 'Medications answer or explicit none',
  pickupAdult: 'Active authorized pickup adult',
  consent: 'Signed consent',
  mailingAddress: 'Mailing address',
};
const timeLabel = (at: string) => new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Vancouver' }).format(new Date(at)) + ' Pacific';

export default function AdminDashboard({ lessonDate, completion, operations, completionError, operationsError }: {
  lessonDate: string;
  completion: CompletionSummaryRow[];
  operations: OperationsSnapshot | null;
  completionError?: string;
  operationsError?: string;
}) {
  const router = useRouter();
  return <main className={`${desk.desk} ${styles.admin}`} data-testid="admin-dashboard">
    <header className={desk.header}><span className={desk.brand}>▲ KESTREL KIDS</span><span className={desk.tag}>ADMIN</span></header>
    <div className={desk.title}><p className={desk.eyebrow}>HANA’S OPERATIONS DESK</p><h1>Every detail accounted for.</h1><p>Follow up on missing information, coordinate groups, and see what needs attention.</p></div>
    <p className={desk.notice}>Dashboard reads use the shared service. Group changes, protected-detail access, corrections, headcounts, contact warnings, emails, and notice tasks are not connected here yet.</p>
    <div className={desk.filters}><label>Lesson day<select data-testid="admin-lesson-day" value={lessonDate} onChange={event => router.push(`/admin?day=${encodeURIComponent(event.target.value)}`)}>{lessonDays.map(value => <option key={value} value={value}>{value}</option>)}</select></label><p>Operational counts reflect {lessonDate}.</p></div>

    <section className={desk.panel} aria-label="Incomplete profiles"><h2>Missing required information</h2><p>Only missing field names appear here; medical values are not shown.</p>
      {completionError && <p role="alert" className={desk.blocked} data-testid="completion-error">Could not load profile completion: {completionError}</p>}
      {!completionError && <ul className={styles.list} data-testid="incomplete-profiles">{completion.map(child => <li key={child.childId} data-testid={`incomplete-${child.childId}`}><strong>{child.firstName} {child.lastName}</strong><p>{child.groupNumber === null ? 'No group assigned' : `Group ${child.groupNumber}`}</p><ul>{child.missing.map(field => <li key={field} data-testid={`missing-${child.childId}-${field}`}>{missingLabels[field]}</li>)}</ul></li>)}</ul>}
      {!completionError && completion.length === 0 && <p data-testid="no-incomplete-profiles">No incomplete profiles.</p>}
    </section>

    <section className={`${desk.summary} ${styles.summary}`} aria-label="Daily operational summary">
      {([
        ['expected', 'Scheduled', operations?.expected],
        ['checkedIn', 'Checked in or released', operations?.checkedIn],
        ['released', 'Released', operations?.released],
        ['missing', 'Open incidents', operations?.openIncidents.length],
      ] as const).map(([key, label, value]) => <div key={key}><strong data-testid={`admin-count-${key}`}>{operations ? value : '—'}</strong><span>{label}</span></div>)}
    </section>
    {operationsError && <p role="alert" className={desk.blocked} data-testid="operations-error">Could not load daily operations: {operationsError}</p>}

    <div className={styles.columns}>
      <section className={desk.panel} aria-label="Open missing-child incidents"><h2>Open missing-child incidents</h2>{operations && <ul className={styles.list} data-testid="admin-open-incidents">{operations.openIncidents.map(incident => <li key={incident.id} data-testid={`incident-${incident.id}`}><strong>{incident.childName}</strong><p>{incident.groupNumber === null ? 'No group assigned' : `Group ${incident.groupNumber}`} · {incident.status} · Last seen {timeLabel(incident.lastSeenAt)} at {incident.lastSeenLocation}</p></li>)}</ul>}{operations && operations.openIncidents.length === 0 && <p>No open incidents for this lesson day.</p>}</section>
      <section className={desk.panel} aria-label="Denied pickup attempts"><h2>Denied pickup attempts</h2>{operations && <ul className={styles.list} data-testid="admin-denials">{operations.deniedPickups.map(record => <li key={record.id} data-testid={`admin-denial-${record.id}`}><strong>Attempted pickup: {record.statedAdultName}</strong><p>Child record: {record.childId}</p><time dateTime={record.occurredAt}>{timeLabel(record.occurredAt)}</time></li>)}</ul>}{operations && operations.deniedPickups.length === 0 && <p>No denied pickup attempts for this lesson day.</p>}</section>
    </div>

    <section className={desk.panel} aria-label="Unavailable admin actions"><h2>Admin actions</h2><p>These controls are unavailable until their shared service workflows are connected.</p><div className={styles.columns}><button type="button" disabled>Group assignments — unavailable</button><button type="button" disabled>Open protected child details — unavailable</button><button type="button" disabled>Add pickup correction — unavailable</button><button type="button" disabled>Headcount and instructor warnings — unavailable</button><button type="button" disabled>Failed email alerts and notice tasks — unavailable</button></div></section>
    <footer className={desk.footer}>Admin dashboard · Displayed information is returned by the authorized admin service.</footer>
  </main>;
}
