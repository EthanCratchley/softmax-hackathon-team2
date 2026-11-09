import Link from 'next/link';
import { ReportForm } from '@/components/safety/ReportForm';
import { Shell } from '@/components/safety/Shell';
import { lessonDay, resortNowHHMM } from '@/components/safety/time';
import s from '@/components/safety/workspace.module.css';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';
import { reportMissingAction } from '../../actions';

export default async function ReportMissingPage({ params, searchParams }: { params: Promise<{ childId: string }>; searchParams: Promise<{ day?: string }> }) {
  const user = await requireUser('instructor');
  const { childId } = await params;
  const day = lessonDay((await searchParams).day);
  const roster = await services.getInstructorRoster(day, user);
  const child = roster.ok ? roster.data.flatMap((g) => g.children).find((c) => c.childId === childId) : undefined;

  return (
    <Shell testId="report-missing-page" eyebrow="On the mountain / Instructor" title="Report a missing child" lead="Radio patrol first, then send this so they have the details.">
      <Link href={`/instructor?day=${day}`} className={s.actionQuiet} data-testid="back-to-roster">
        ← Back to my group
      </Link>
      {!child ? (
        <p role="alert" className={s.error} data-testid="not-found">
          Not found
        </p>
      ) : child.hasOpenIncident ? (
        <p className={s.missing} data-testid={`missing-${child.childId}`}>
          Missing — reported
        </p>
      ) : (
        <ReportForm action={reportMissingAction.bind(null, child.childId, day)} childName={`${child.firstName} ${child.lastName}`} defaultLastSeen={`${day}T${resortNowHHMM()}`} />
      )}
    </Shell>
  );
}
