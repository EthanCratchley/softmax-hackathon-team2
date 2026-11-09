import Link from 'next/link';
import { Shell } from '@/components/safety/Shell';
import { lessonDay, resortTime } from '@/components/safety/time';
import s from '@/components/safety/workspace.module.css';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';

export default async function PatrolPage({ searchParams }: { searchParams: Promise<{ day?: string; q?: string }> }) {
  const user = await requireUser('patrol');
  const params = await searchParams;
  const day = lessonDay(params.day);
  const q = (params.q ?? '').slice(0, 100);
  const incidents = await services.listOpenIncidents(user);
  const found = q.trim() ? await services.searchChildren(q, day, user) : null;

  return (
    <Shell testId="patrol-page" eyebrow="Mountain response / Patrol" title="Every minute matters." lead="Clear information. Coordinated response." day={day}>
      <h2 className={s.sectionTitle}>Open incidents</h2>
      {!incidents.ok ? (
        <p role="alert" className={s.error} data-testid="incidents-error">
          {incidents.error.message}
        </p>
      ) : incidents.data.length === 0 ? (
        <p className={s.notice} data-testid="no-incidents">
          No open incidents.
        </p>
      ) : (
        <div className={s.grid} data-testid="incident-list">
          {incidents.data.map((i) => (
            <Link key={i.id} href={`/patrol/incidents/${i.id}`} className={`${s.card} ${s.incidentLink}`} data-testid={`incident-${i.id}`} data-child={i.childId}>
              <span className={s.status} data-status={i.status}>
                {i.status}
              </span>
              <h3>{i.childName}</h3>
              <p>{i.groupNumber === null ? 'No group' : `Group ${i.groupNumber}`}</p>
              <p>
                Last seen {resortTime(i.lastSeenAt)} · {i.lastSeenLocation}
              </p>
              <p className={s.escalation} data-testid={`incident-escalate-${i.id}`}>
                Escalate by {resortTime(i.escalateAt)}
              </p>
            </Link>
          ))}
        </div>
      )}

      <h2 className={s.sectionTitle}>Radio call: find a child</h2>
      <form className={s.search} data-testid="search-form">
        <input type="hidden" name="day" value={day} />
        <label className={s.field}>
          Name, other name or surname
          <input name="q" defaultValue={q} placeholder="e.g. Okafor-Parr" data-testid="search" />
        </label>
        <button type="submit" className={s.action} data-testid="search-submit">
          Search
        </button>
      </form>
      {found && !found.ok && (
        <p role="alert" className={s.error} data-testid="search-error">
          {found.error.message}
        </p>
      )}
      {found?.ok && found.data.length === 0 && (
        <p className={s.notice} data-testid="search-empty">
          No child on {day} matches “{q}”.
        </p>
      )}
      {found?.ok && found.data.length > 0 && (
        <div className={s.grid} data-testid="search-results">
          {found.data.map((c) => (
            <article key={c.childId} className={s.card} data-testid={`search-result-${c.childId}`}>
              <span className={s.cardLabel}>Patrol directory</span>
              <h3>
                {c.firstName} {c.lastName}
              </h3>
              <p>
                Age {c.age} · {c.groupNumber === null ? 'No group' : `Group ${c.groupNumber}`}
              </p>
              <Link
                href={`/patrol/report-missing/${encodeURIComponent(c.childId)}?day=${day}&q=${encodeURIComponent(q)}`}
                className={`${s.action} ${s.submitDanger}`}
                data-testid={`open-incident-${c.childId}`}
              >
                Open incident
              </Link>
            </article>
          ))}
        </div>
      )}
    </Shell>
  );
}
