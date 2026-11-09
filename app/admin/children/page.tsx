import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/session';

// Target of the overview's child picker (a plain GET form, so it works before scripts load).
export default async function AdminChildPicker({ searchParams }: { searchParams: Promise<{ child?: string | string[] }> }) {
  await requireUser('admin');
  const { child } = await searchParams;
  const id = Array.isArray(child) ? child[0] : child;
  redirect(id ? `/admin/children/${encodeURIComponent(id)}` : '/admin');
}
