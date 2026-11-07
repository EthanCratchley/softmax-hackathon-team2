import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
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

  return (
    <main className="page narrow" data-testid="login-page">
      <h1>Sign in</h1>
      <p className="muted">Kestrel Kids staff and families.</p>
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
