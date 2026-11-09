import Link from 'next/link';
import { createDemoState } from '@/lib/fixtures';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';
import desk from '../../desk/roster.module.css';
import styles from '../dashboard.module.css';

const names = Object.fromEntries(createDemoState().users.map((u) => [u.id, u.displayName]));
const timeLabel = (at: string) => new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'America/Vancouver' }).format(new Date(at)) + ' Pacific';

export default async function AuditPage() {
  const user = await requireUser('admin');
  const log = await services.getAuditLog(user);
  return <main className={`${desk.desk} ${styles.admin}`} data-testid="admin-audit-page">
    <header className={desk.header}><span className={desk.brand}>▲ KESTREL KIDS</span><span className={desk.tag}>ADMIN</span></header>
    <Link href="/admin" className={desk.backLink} data-testid="back-to-admin">← Back to the admin overview</Link>
    <div className={desk.title}><p className={desk.eyebrow}>AUDIT TRAIL</p><h1>Who did what, and when.</h1><p>Newest first. Entries never contain medical values.</p></div>
    {!log.ok && <p role="alert" className={desk.blocked} data-testid="audit-error">{log.error.message}</p>}
    {log.ok && log.data.length === 0 && <p data-testid="audit-empty">No audit entries yet.</p>}
    {log.ok && log.data.length > 0 && <section className={desk.panel}><ul className={styles.list} data-testid="audit-log">{log.data.map(event => <li key={event.id} data-testid={`audit-${event.id}`} data-action={event.action}>
      <strong>{event.action.replaceAll('_', ' ')}</strong>
      <p>{names[event.actorUserId] ?? 'Unknown account'} ({event.actorUserId}) · {event.entityType} {event.entityId}</p>
      <p data-testid={`audit-summary-${event.id}`}>{event.detailsSummary}</p>
      <time dateTime={event.occurredAt}>{timeLabel(event.occurredAt)}</time>
    </li>)}</ul></section>}
  </main>;
}
