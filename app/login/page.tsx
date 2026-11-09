import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { users as demoUsers } from '@/lib/fixtures';
import { signInAction } from './actions';

const MESSAGES: Record<string, string> = {
  missing: 'Enter your email and password.',
  invalid_credentials: 'That email and password do not match an account.',
  not_configured: 'Sign-in is not set up on this server yet.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentUser()) redirect('/');
  const { error } = await searchParams;
  const message = error ? (MESSAGES[error] ?? MESSAGES.invalid_credentials) : null;
  const demoPasswordAlias = process.env.NODE_ENV !== 'production'
    && (process.env.KESTREL_DATA === 'mock' || Boolean(process.env.PIEZAS_TEST_API_KEY));

  return (
    <main className="page narrow" data-testid="login-page">
      <h1>Sign in</h1>
      <p className="muted">Kestrel Kids staff and families.</p>
      <aside className="card demo-logins" aria-labelledby="demo-logins-title">
        <h2 id="demo-logins-title">Demo logins</h2>
        <p className="small muted">{demoPasswordAlias ? <>Use password <code>kestrel</code> for any demo account.</> : <>Run <code>npm run demo:accounts</code> for each account’s password.</>}</p>
        <ul>{demoUsers.map((user) => <li key={user.id}><span>{user.role}</span><code>{user.email}</code></li>)}</ul>
      </aside>
      {message && (
        <p role="alert" className="alert" data-testid="login-error">
          {message}
        </p>
      )}
      <form action={signInAction} className="stack">
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="username" required data-testid="login-email" />
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required data-testid="login-password" />
        </label>
        <button type="submit" className="button primary" data-testid="login-submit">
          Sign in
        </button>
      </form>
      <p className="muted small">Demo build: every account and record is fictional.</p>
    </main>
  );
}
