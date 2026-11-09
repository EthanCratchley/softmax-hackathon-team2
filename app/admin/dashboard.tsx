'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CompletionSummaryRow, NoticeTask, OperationsSnapshot, PickupRecordView } from '@/lib/domain/types';
import { CorrectionForm, GroupForms, NoticeDoneForm } from './admin-forms';
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

type Option = { id: string; label: string };

export default function AdminDashboard({ lessonDate, completion, operations, pickups, tasks, completionError, operationsError, pickupsError, tasksError, childOptions, groupOptions, instructorOptions, staffNames }: {
  lessonDate: string;
  completion: CompletionSummaryRow[];
  operations: OperationsSnapshot | null;
  pickups: PickupRecordView[];
  tasks: NoticeTask[];
  completionError?: string;
  operationsError?: string;
  pickupsError?: string;
  tasksError?: string;
  childOptions: Option[];
  groupOptions: Option[];
  instructorOptions: Option[];
  staffNames: Record<string, string>;
}) {
  const router = useRouter();
  return <main className={`${desk.desk} ${styles.admin}`} data-testid="admin-dashboard">
    <header className={desk.header}><span className={desk.brand}>▲ KESTREL KIDS</span><span className={desk.tag}>ADMIN</span></header>
    <div className={desk.title}><p className={desk.eyebrow}>HANA’S OPERATIONS DESK</p><h1>Every detail accounted for.</h1><p>Follow up on missing information, coordinate groups, and see what needs attention.</p></div>
    <p className={desk.notice}>Every read and change here goes through the shared service. Medical details open only on a child’s protected page, with a logged reason. <Link href="/admin/audit" className={desk.pickupLink} data-testid="admin-audit-link">Open the audit trail</Link></p>
    <div className={desk.filters}><label>Lesson day<select data-testid="admin-lesson-day" value={lessonDate} onChange={event => router.push(`/admin?day=${encodeURIComponent(event.target.value)}`)}>{lessonDays.map(value => <option key={value} value={value}>{value}</option>)}</select></label><p>Operational counts reflect {lessonDate}.</p></div>

    <section className={desk.panel} aria-label="Incomplete profiles"><h2>Missing required information</h2><p>Only missing field names appear here; medical values are not shown.</p>
      {completionError && <p role="alert" className={desk.blocked} data-testid="completion-error">Could not load profile completion: {completionError}</p>}
      {!completionError && <ul className={styles.list} data-testid="incomplete-profiles">{completion.map(child => <li key={child.childId} data-testid={`incomplete-${child.childId}`}><strong>{child.firstName} {child.lastName}</strong><p>{child.groupNumber === null ? 'No group assigned' : `Group ${child.groupNumber}`}</p><ul>{child.missing.map(field => <li key={field} data-testid={`missing-${child.childId}-${field}`}>{missingLabels[field]}</li>)}</ul><Link href={`/admin/children/${encodeURIComponent(child.childId)}`} className={desk.pickupLink} data-testid={`open-details-${child.childId}`}>Open protected details</Link></li>)}</ul>}
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
      <section className={desk.panel} aria-label="Denied pickup attempts"><h2>Denied pickup attempts</h2>{operations && <ul className={styles.list} data-testid="admin-denials">{operations.deniedPickups.map(record => <li key={record.id} data-testid={`admin-denial-${record.id}`}><strong>Attempted pickup: {record.statedAdultName}</strong><p>Child: {record.childName}</p><time dateTime={record.occurredAt}>{timeLabel(record.occurredAt)}</time></li>)}</ul>}{operations && operations.deniedPickups.length === 0 && <p>No denied pickup attempts for this lesson day.</p>}</section>
    </div>

    <section className={desk.panel} aria-label="Notice tasks"><h2>Notice tasks</h2><p>Created when patrol records sharing with police or rescuers. Mail the required notice to the family.</p>
      {tasksError && <p role="alert" className={desk.blocked} data-testid="tasks-error">Could not load notice tasks: {tasksError}</p>}
      {!tasksError && tasks.length === 0 && <p data-testid="no-notice-tasks">No open notice tasks.</p>}
      {tasks.length > 0 && <ul className={styles.list} data-testid="notice-tasks">{tasks.map(task => <li key={task.id} data-testid={`notice-task-${task.id}`}><strong>Mail the notice: {task.childName}</strong><p>Incident {task.incidentId}</p><p data-testid={`notice-task-address-${task.id}`}>{task.mailingAddress ?? 'No mailing address on file'}</p><time dateTime={task.createdAt}>Created {timeLabel(task.createdAt)}</time><NoticeDoneForm taskId={task.id} /></li>)}</ul>}
    </section>

    <section className={desk.panel} aria-label="Pickup records"><h2>Pickup records for {lessonDate}</h2><p>Original release records never change. Corrections are added beside them.</p>
      {pickupsError && <p role="alert" className={desk.blocked} data-testid="pickups-error">Could not load pickup records: {pickupsError}</p>}
      {!pickupsError && pickups.length === 0 && <p data-testid="no-pickups">No releases recorded for this lesson day.</p>}
      {pickups.length > 0 && <ul className={styles.list} data-testid="pickup-records">{pickups.map(record => <li key={record.id} data-testid={`pickup-record-${record.id}`} data-child={record.childId}>
        <div data-testid={`pickup-original-${record.id}`}><strong>{record.childName}</strong><p>Released to {record.adultNameSnapshot} · verified by {record.verifiedByName} · ID checked</p><time dateTime={record.releasedAt}>{timeLabel(record.releasedAt)}</time></div>
        {record.corrections.map(correction => <div key={correction.id} className={styles.correction} data-testid={`pickup-correction-${correction.id}`}><strong>Correction by {staffNames[correction.correctedBy] ?? correction.correctedBy}</strong><p>Reason: {correction.reason}</p><p>{correction.note}</p><time dateTime={correction.createdAt}>{timeLabel(correction.createdAt)}</time></div>)}
        <CorrectionForm pickupLogId={record.id} />
      </li>)}</ul>}
    </section>

    <section className={desk.panel} aria-label="Group assignments"><h2>Group assignments</h2><p>Groups hold at most six children. Current members appear on each instructor’s roster.</p>
      <GroupForms kids={childOptions} groups={groupOptions} instructors={instructorOptions} />
    </section>

    <section className={desk.panel} aria-label="Protected child details"><h2>Protected child details</h2><p>Opening a full profile needs a reason, and every opening is logged.</p>
      <form method="get" action="/admin/children" className={styles.form}><label>Child<select name="child" data-testid="details-child-select">{childOptions.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label><button type="submit" data-testid="details-child-open">Continue</button></form>
    </section>
    <footer className={desk.footer}>Admin dashboard · Displayed information is returned by the authorized admin service.</footer>
  </main>;
}
