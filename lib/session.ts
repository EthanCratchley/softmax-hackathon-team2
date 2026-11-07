import 'server-only';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Role, User, VerifiedUser } from './domain/types';
import { users } from './fixtures';

// Session glue. The ONLY place a VerifiedUser is created. Pages and server
// actions call requireUser(); they never accept a user, role or id from the
// browser.
//
// Mock phase: synthetic accounts from lib/fixtures.ts with one shared demo
// password from DEMO_PASSWORD (server env). After the preview is approved
// this switches to Piezas users (signIn → session token in this same
// httpOnly cookie, verified with users.getSession on every request).

const COOKIE = 'kk_session';
const MAX_AGE_SECONDS = 12 * 60 * 60;

const store = globalThis as typeof globalThis & { __kestrelSessions?: Map<string, { userId: string; expiresAt: number }> };
const sessions = (store.__kestrelSessions ??= new Map());

const verify = (user: User): VerifiedUser => ({ ...user, __verified: true });
const digest = (value: string) => createHash('sha256').update(value).digest();

export type SignInError = 'invalid_credentials' | 'not_configured';

export async function signIn(email: string, password: string): Promise<{ ok: true; user: VerifiedUser } | { ok: false; error: SignInError }> {
  const expected = process.env.DEMO_PASSWORD;
  if (!expected) return { ok: false, error: 'not_configured' };
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  const passwordOk = timingSafeEqual(digest(password), digest(expected));
  if (!user || !passwordOk) return { ok: false, error: 'invalid_credentials' };

  const token = randomBytes(32).toString('base64url');
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + MAX_AGE_SECONDS * 1000 });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
  return { ok: true, user: verify(user) };
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) sessions.delete(token);
  jar.delete(COOKIE);
}

export async function getCurrentUser(): Promise<VerifiedUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  const session = token ? sessions.get(token) : undefined;
  if (!token || !session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  const user = users.find((u) => u.id === session.userId);
  return user ? verify(user) : null;
}

/** Use at the top of every protected page and server action. */
export async function requireUser(...roles: Role[]): Promise<VerifiedUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (roles.length && !roles.includes(user.role)) redirect('/');
  return user;
}

export const ROLE_HOME: Record<Role, string> = {
  parent: '/parent',
  instructor: '/instructor',
  desk: '/desk',
  patrol: '/patrol',
  admin: '/admin',
};
