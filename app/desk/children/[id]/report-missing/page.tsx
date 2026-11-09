import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReportForm } from '@/components/safety/ReportForm';
import { lessonDay, resortNowHHMM } from '@/components/safety/time';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';
import { deskReportMissingAction } from '../actions';
import styles from '../../../roster.module.css';

/** Desk files a missing report for an instructor who radioed in (e.g. their phone is dead). */
export default async function DeskReportMissingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ day?: string }> }) {
  const user = await requireUser('desk');
  const { id } = await params;
  const day = lessonDay((await searchParams).day);
  const view = await services.getDeskPickupView(id, day, user);
  if (!view.ok && view.error.code === 'not_found') notFound();
  const back = `/desk/children/${encodeURIComponent(id)}?day=${day}`;

  return (
    <main className={styles.desk} data-testid="desk-report-missing-page">
      <header className={styles.header}><span className={styles.brand}>▲ KESTREL KIDS</span><span className={styles.tag}>DESK</span></header>
      <Link className={styles.backLink} data-testid="back-to-pickup" href={back}>← Back to pickup</Link>
      {!view.ok ? (
        <p className={styles.blocked} role="alert" data-testid="report-load-error">{view.error.message}</p>
      ) : view.data.entry.pickup.kind === 'OpenIncident' ? (
        <p className={styles.blocked} role="status" data-testid="already-reported">Already reported. Call patrol.</p>
      ) : (
        <ReportForm
          action={deskReportMissingAction.bind(null, id, day)}
          childName={`${view.data.entry.firstName} ${view.data.entry.lastName}`}
          defaultLastSeen={`${day}T${resortNowHHMM()}`}
        />
      )}
    </main>
  );
}
