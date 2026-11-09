import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { services } from '@/lib/services';
import { formatMissingFields } from '@/lib/domain/parent-copy';
import { DEMO_LESSON_DATE } from '@/lib/fixtures';

export default async function ParentHome() {
  const user = await requireUser('parent');
  const result = await services.getMyChildren(user);
  return <main className="page parent-page" data-testid="parent-home">
    <header className="parent-page-heading"><p className="eyebrow">Parent portal</p><h1>My Children</h1><p className="page-intro">Keep each child’s safety and pick-up details up to date.</p><p className="small muted first-lesson">First lesson {new Date(`${DEMO_LESSON_DATE}T12:00:00Z`).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Vancouver' })}</p></header>
    {!result.ok ? <div className="alert danger" role="alert">{result.error.message}</div> : result.data.length === 0 ? <div className="empty-state"><h2>No linked children yet</h2><p>Children connected to your account will appear here.</p></div> :
      <div className="children-list">{result.data.map((child) => {
        const requiredMissing = child.completion.missing.filter((field) => field !== 'parent');
        const missing = formatMissingFields(requiredMissing);
        const completed = 7 - requiredMissing.length;
        return <article className="child-card" key={child.id} data-testid={`child-card-${child.id}`}>
        <div className="child-card-heading"><div><p className="child-card-kicker">{[
          child.groupNumber ? `Group ${child.groupNumber}` : null,
          child.skiLevel ? `Level ${child.skiLevel}` : null,
          child.lessonDay ? new Date(`${child.lessonDay}T12:00:00Z`).toLocaleDateString('en-CA', { weekday: 'long', timeZone: 'America/Vancouver' }) : null,
        ].filter(Boolean).join(' · ') || 'Group not assigned'}</p><h2>{child.firstName} {child.lastName}</h2></div>
            <span className={`badge ${child.completion.status === 'Complete' ? 'ok' : 'warn'}`}>{child.completion.status === 'Complete' ? 'Complete' : 'Needs information'}</span></div>
          <div className="child-progress"><div className="child-progress-track" role="progressbar" aria-label={`${child.firstName}’s profile completion`} aria-valuemin={0} aria-valuemax={7} aria-valuenow={completed}><span className="child-progress-fill" style={{ width: `${Math.max(0, Math.min(100, (completed / 7) * 100))}%` }} /></div><span className="child-progress-label">{completed} of 7 details</span></div>
          {missing && <p className="child-card-note"><strong>Still needed:</strong> {missing}.</p>}
          <div className="child-card-footer"><div className="child-card-actions"><Link className="button primary" href={`/parent/children/${encodeURIComponent(child.id)}`}>Open {child.firstName}’s profile</Link>
              <Link className="link-quiet" href={`/parent/children/${encodeURIComponent(child.id)}/pass`}>Lesson-day pass →</Link></div>
            <p className="small muted">Updated {new Date(child.updatedAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Vancouver' })}</p></div>
        </article>;
      })}</div>}
    {result.ok && result.data.length > 0 && <p className="parent-privacy-note">Only children linked to your account are shown. If a child is missing, contact the Kestrel Kids desk.</p>}
  </main>;
}
