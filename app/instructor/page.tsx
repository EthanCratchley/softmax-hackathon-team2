import Link from 'next/link';
import { SafetyAlerts } from '@/components/safety/SafetyAlerts';
import { Shell } from '@/components/safety/Shell';
import { lessonDay } from '@/components/safety/time';
import s from '@/components/safety/workspace.module.css';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';

export default async function InstructorPage({ searchParams }: { searchParams: Promise<{ day?: string; reported?: string }> }) {
  const user = await requireUser('instructor');
  const params = await searchParams;
  const day = lessonDay(params.day);
  const roster = await services.getInstructorRoster(day, user);
  const reported = roster.ok ? roster.data.flatMap((g) => g.children).find((c) => c.childId === params.reported) : undefined;

  return (
    <Shell testId="instructor-page" eyebrow="On the mountain / Instructor" title="Your group. Every child." lead="Know your group. Keep safety in sight." day={day}>
      <p className={s.notice}><Link href="/instructor/communications" data-testid="instructor-communications-link">Messages & group announcements →</Link></p>
      {reported && (
        <p role="status" className={s.notice} data-testid="report-confirmation">
          Missing report sent for {reported.firstName} {reported.lastName}. Patrol has it now; keep your radio on.
        </p>
      )}
      {!roster.ok && (
        <p role="alert" className={s.error} data-testid="roster-error">
          {roster.error.message}
        </p>
      )}
      {roster.ok && roster.data.length === 0 && (
        <p className={s.notice} data-testid="no-groups">
          No groups assigned to you on {day}.
        </p>
      )}
      {roster.ok &&
        roster.data.map((g) => (
          <section key={g.groupId} className={s.group} data-testid={`group-${g.groupId}`}>
            <div className={s.groupHead}>
              <h2>
                Group {g.groupNumber} · {g.skiLevel} · {g.children.length} children
              </h2>
            </div>
            <div className={s.grid}>
              {g.children.map((c) => (
                <article key={c.childId} className={s.card} data-testid={`child-${c.childId}`}>
                  <span className={s.cardLabel}>Lesson roster</span>
                  <h3 data-testid={`child-name-${c.childId}`}>
                    {c.firstName} {c.lastName}
                  </h3>
                  <p>
                    Age {c.age} · {c.skiLevel}
                  </p>
                  <SafetyAlerts alerts={c.alerts} testId={`alert-${c.childId}`} />
                  {c.hasOpenIncident ? (
                    <p className={s.missing} data-testid={`missing-${c.childId}`}>
                      Missing — reported
                    </p>
                  ) : (
                    <Link className={s.actionDanger} href={`/instructor/report-missing/${c.childId}?day=${day}`} data-testid={`report-${c.childId}`}>
                      Report missing
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
    </Shell>
  );
}
