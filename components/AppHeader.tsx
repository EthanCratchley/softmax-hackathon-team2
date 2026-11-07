import Link from 'next/link';
import { signOutAction } from '@/app/login/actions';
import { getCurrentUser } from '@/lib/session';

const ROLE_LABEL = { parent: 'Parent', instructor: 'Instructor', desk: 'Desk', patrol: 'Patrol', admin: 'Admin' } as const;

/** Shared top bar for every screen. Shows who is signed in; no role switching. */
export async function AppHeader() {
  const user = await getCurrentUser();
  return (
    <header className="app-header" data-testid="app-header">
      <Link href="/" className="brand">
        ▲ Kestrel Kids
      </Link>
      {user && (
        <div className="who">
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
