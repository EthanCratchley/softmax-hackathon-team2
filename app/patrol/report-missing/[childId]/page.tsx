import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ReportForm } from '@/components/safety/ReportForm';
import { Shell } from '@/components/safety/Shell';
import { lessonDay, resortNowHHMM } from '@/components/safety/time';
import s from '@/components/safety/workspace.module.css';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';
import { patrolReportMissingAction } from '../../actions';

/** Radio call: patrol records the real last-seen time and place before the packet opens. */
export default async function PatrolReportMissingPage({ params, searchParams }: { params: Promise<{ childId: string }>; searchParams: Promise<{ day?: string; q?: string }> }) {
  const user = await requireUser('patrol');
  const { childId } = await params;
  const query = await searchParams;
  const day = lessonDay(query.day);
  const q = (query.q ?? '').slice(0, 100);

  const open = await services.listOpenIncidents(user);
  const existing = open.ok ? open.data.find((i) => i.childId === childId && i.status === 'Open') : undefined;
  if (existing) redirect(`/patrol/incidents/${existing.id}`);

  // The name comes from patrol's identity-only search, never from the address bar.
  const found = q.trim() ? await services.searchChildren(q, day, user) : null;
  const child = found?.ok ? found.data.find((c) => c.childId === childId) : undefined;

  return (
    <Shell testId="patrol-report-page" eyebrow="Mountain response / Patrol" title="Open an incident" lead="Write down what the radio call said: when and where the child was last seen.">
      <Link href={`/patrol?day=${day}&q=${encodeURIComponent(q)}`} className={s.actionQuiet} data-testid="back-to-patrol">
        ← Back to search
      </Link>
      {child ? (
        <ReportForm action={patrolReportMissingAction.bind(null, child.childId, day)} childName={`${child.firstName} ${child.lastName}`} defaultLastSeen={`${day}T${resortNowHHMM()}`} />
      ) : (
        <p role="alert" className={s.error} data-testid="not-found">
          Not found
        </p>
      )}
    </Shell>
  );
}
