import Link from 'next/link';
import { DEMO_LESSON_DATE } from '@/lib/fixtures';
import { services } from '@/lib/services';
import { requireUser, ROLE_HOME } from '@/lib/session';
import type { VerifiedUser } from '@/lib/domain/types';

const ROLE_LABEL = { parent: 'Parent', instructor: 'Instructor', desk: 'Desk', patrol: 'Patrol', admin: 'Admin' } as const;

// Signed-in landing summary for the non-parent workspaces.
async function summary(user: VerifiedUser): Promise<string> {
  switch (user.role) {
    case 'parent': {
      const r = await services.getMyChildren(user);
      if (!r.ok) return r.error.message;
      const needs = r.data.filter((c) => c.completion.status === 'NeedsInformation').length;
      return `${r.data.length} linked child(ren) · ${needs} need information`;
    }
    case 'instructor': {
      const r = await services.getInstructorRoster(DEMO_LESSON_DATE, user);
      if (!r.ok) return r.error.message;
      const kids = r.data.flatMap((g) => g.children);
      return `${r.data.map((g) => `Group ${g.groupNumber}`).join(', ') || 'No groups'} · ${kids.length} children · ${kids.filter((k) => k.alerts.length).length} with safety alerts`;
    }
    case 'desk': {
      const r = await services.getDeskRoster(DEMO_LESSON_DATE, user);
      if (!r.ok) return r.error.message;
      return `${r.data.length} expected · ${r.data.filter((e) => e.status !== 'Expected').length} checked in · ${r.data.filter((e) => e.status === 'Released').length} released`;
    }
    case 'patrol': {
      const r = await services.listOpenIncidents(user);
      return r.ok ? `${r.data.length} open incident(s)` : r.error.message;
    }
    case 'admin': {
      const r = await services.getProfileCompletionSummary(user);
      return r.ok ? `${r.data.length} child profile(s) need information` : r.error.message;
    }
  }
}

export default async function Home() {
  const user = await requireUser();
  const isParent = user.role === 'parent';
  const parentResult = isParent ? await services.getMyChildren(user) : null;
  const otherSummary = isParent ? null : await summary(user);
  const childCount = parentResult?.ok ? parentResult.data.length : 0;
  const attentionCount = parentResult?.ok
    ? parentResult.data.filter((child) => child.completion.status === 'NeedsInformation').length
    : 0;
  const lessonDate = new Intl.DateTimeFormat('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Vancouver',
  }).format(new Date(`${DEMO_LESSON_DATE}T12:00:00Z`));

  const parentSummary = parentResult && !parentResult.ok
    ? 'Your child profiles could not be loaded.'
    : `${childCount} linked ${childCount === 1 ? 'child' : 'children'} · ${attentionCount} ${attentionCount === 1 ? 'profile needs' : 'profiles need'} attention`;
  const parentDescription = !parentResult?.ok
    ? 'Try reloading this page. Your child information remains private to your account.'
    : childCount === 0
      ? 'Children linked to your account will appear here. If you expected to see a child, contact Kestrel Kids.'
      : attentionCount > 0
        ? 'Some required details are missing. Review the list and update each child’s profile before lesson day.'
        : 'All linked child profiles are complete. You can review or update them whenever something changes.';

  return (
    <main className="page welcome-page" data-testid="home">
      <header className="welcome-heading">
        <div className="welcome-copy">
          <p className="eyebrow">{isParent ? 'Parent portal' : `${ROLE_LABEL[user.role]} workspace`}</p>
          <h1>Welcome back, {user.displayName.split(' ')[0]}</h1>
          <p>{isParent ? 'Your family’s safety details, all in one place.' : 'Here’s your overview before lesson day.'}</p>
        </div>
        <div className="lesson-date">
          <span>Lesson day</span>
          <time dateTime={DEMO_LESSON_DATE}>{lessonDate}</time>
        </div>
      </header>

      <section className="welcome-card" aria-labelledby="welcome-card-title">
        <div className="welcome-card-topline">
          <p className="eyebrow">{isParent ? 'Your family' : 'Your overview'}</p>
          {isParent && parentResult?.ok && (
            <span className={`badge ${attentionCount ? 'warn' : 'ok'}`}>
              {childCount === 0 ? 'No linked children' : attentionCount ? 'Needs attention' : 'Up to date'}
            </span>
          )}
        </div>
        <h2 id="welcome-card-title">{isParent ? 'Child profiles' : `${ROLE_LABEL[user.role]} dashboard`}</h2>

        {isParent ? (
          <>
            {parentResult?.ok ? (
              <div className="welcome-stats" aria-label="Parent account summary">
                <div className="welcome-stat"><strong>{childCount}</strong><span>Linked {childCount === 1 ? 'child' : 'children'}</span></div>
                <div className="welcome-stat"><strong>{attentionCount}</strong><span>{attentionCount === 1 ? 'Profile needs' : 'Profiles need'} attention</span></div>
              </div>
            ) : <p className="welcome-error" role="alert">{parentSummary}</p>}
            <p className="welcome-description" data-testid="home-summary">{parentDescription}</p>
          </>
        ) : (
          <p className="welcome-summary" data-testid="home-summary">{otherSummary}</p>
        )}

        <Link href={ROLE_HOME[user.role]} className="button primary welcome-action" data-testid="open-workspace">
          {isParent ? 'Review child profiles' : 'Open my workspace'}
        </Link>
      </section>
    </main>
  );
}
