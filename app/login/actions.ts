'use server';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/lib/session';

export async function signInAction(form: FormData) {
  const email = String(form.get('email') ?? '');
  const password = String(form.get('password') ?? '');
  if (!email.trim() || !password) redirect('/login?error=missing');
  const result = await signIn(email, password);
  if (!result.ok) redirect(`/login?error=${result.error}`);
  redirect('/');
}

export async function signOutAction() {
  await signOut();
  redirect('/login');
}
