import 'server-only';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { PiezasError } from '@piezas/sdk';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Role, User, VerifiedUser } from './domain/types';
import { users as fixtureUsers } from './fixtures';
import { piezas } from './piezas';
import { demoPassword } from './piezas-schema';
import { findAccountByPiezasUser } from './services/piezas-store';

// Session glue. The ONLY place a VerifiedUser is created. Pages and server
// actions call requireUser(); they never accept a user, role or id from the
// browser. Identity comes from the Piezas users service; the role comes from
// the app's account record, which only the server and seed script write.

const COOKIE = 'kk_session';
const MAX_AGE_SECONDS = 12 * 60 * 60;
const ROLES: readonly Role[] = ['parent', 'instructor', 'desk', 'patrol', 'admin'];
const useMock = process.env.KESTREL_DATA === 'mock' && process.env.NODE_ENV !== 'production';

const verify = (user: User): VerifiedUser => ({ ...user, __verified: true });

export type SignInError = 'invalid_credentials' | 'not_configured';

async function setSessionCookie(token: string) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

// Local mock mode only: in-memory tokens for fixture accounts.
const mockStore = globalThis as typeof globalThis & { __kestrelSessions?: Map<string, string> };
const mockSessions = (mockStore.__kestrelSessions ??= new Map());

async function mockSignIn(email: string, password: string): Promise<SignInError | null> {
  const secret = process.env.DEMO_ACCOUNT_SECRET;
  if (!secret) return 'not_configured';
  const user = fixtureUsers.find((u) => u.email === email);
  const expected = Buffer.from(demoPassword(secret, email));
  const given = Buffer.from(password);
  if (!user || expected.length !== given.length || !timingSafeEqual(expected, given)) return 'invalid_credentials';
  const token = randomBytes(32).toString('base64url');
  mockSessions.set(token, user.id);
  await setSessionCookie(token);
  return null;
}

export async function signIn(email: string, password: string): Promise<{ ok: true } | { ok: false; error: SignInError }> {
  const normalized = email.trim().toLowerCase();
  if (useMock) {
    const error = await mockSignIn(normalized, password);
    return error ? { ok: false, error } : { ok: true };
  }
  const result = await piezas()
    .users.signIn({ email: normalized, password })
    .catch((error: unknown) => {
      if (error instanceof PiezasError && ['invalid_credentials', 'account_pending', 'account_locked'].includes(error.code)) return null;
      throw error;
    });
  // Demo accounts have no second factor; an MFA challenge is treated as a failed sign-in here.
  if (!result?.session) return { ok: false, error: 'invalid_credentials' };
  await setSessionCookie(result.session.token);
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  jar.delete(COOKIE);
  if (!token) return;
  if (useMock) {
    mockSessions.delete(token);
    return;
  }
  await piezas().users.signOut(token);
}

export async function getCurrentUser(): Promise<VerifiedUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  if (useMock) {
    const user = fixtureUsers.find((u) => u.id === mockSessions.get(token));
    return user ? verify(user) : null;
  }
  const session = await piezas()
    .users.getSession(token)
    .catch((error: unknown) => {
      if (error instanceof PiezasError && error.code === 'invalid_session') return null;
      throw error;
    });
  if (!session?.valid || !session.user) return null;
  const account = await findAccountByPiezasUser(session.user.id);
  if (!account || !ROLES.includes(account.role as Role)) return null;
  return verify({ id: account.id, role: account.role as Role, displayName: account.displayName, email: account.email });
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
