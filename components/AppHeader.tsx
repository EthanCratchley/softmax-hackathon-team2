import Link from 'next/link';
import { signOutAction } from '@/app/login/actions';
import { getCurrentUser } from '@/lib/session';
import { services } from '@/lib/services';
import { MessagesNavLink } from '@/components/communications/MessagesNavLink';

const ROLE_LABEL = { parent: 'Parent', instructor: 'Instructor', desk: 'Desk', patrol: 'Patrol', admin: 'Admin' } as const;

/** Shared top bar for every screen. Shows who is signed in; no role switching. */
export async function AppHeader() {
  const user = await getCurrentUser();
  const unreadResult = user && (user.role === 'parent' || user.role === 'instructor')
    ? await services.getCommunicationUnreadCount(user).catch(() => null)
    : null;
  return (
    <header className="app-header" data-testid="app-header">
      <Link href="/" className="brand">
        <svg className="brand-mountain" width="36" height="32" viewBox="0 0 36 32" fill="none" aria-hidden="true"><path d="M2 27 14 5l7 13 5-8 9 17H2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="m9 14 5 3 4-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
        <span>Kestrel Kids<span className="brand-caption">Mountain safety</span></span>
      </Link>
      {user && (
        <div className="who">
          <nav aria-label="Main navigation">
            <Link className="workspace-link" href={`/${user.role}`}>{ROLE_LABEL[user.role]} workspace</Link>
            {unreadResult?.ok && (user.role === 'parent' || user.role === 'instructor') && <MessagesNavLink role={user.role} initialCount={unreadResult.data} />}
          </nav>
          <span data-testid="current-user">
            {user.displayName} · {ROLE_LABEL[user.role]}
          </span>
          <form action={signOutAction}>
            <button type="submit" className="button ghost" data-testid="sign-out">
              Sign out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
