import { notFound } from 'next/navigation';
import { DEMO_LESSON_DATE } from '@/lib/fixtures';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';
import PickupPanel from './pickup-panel';

export default async function PickupPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ day?: string | string[] }>;
}) {
  const user = await requireUser('desk');
  const { id } = await params;
  const requestedDay = (await searchParams).day;
  const rawDay = Array.isArray(requestedDay) ? requestedDay[0] : requestedDay;
  const lessonDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDay ?? '') ? rawDay! : DEMO_LESSON_DATE;
  const result = await services.getDeskPickupView(id, lessonDate, user);
  if (!result.ok && result.error.code === 'not_found') notFound();
  const view = result.ok ? {
    entry: result.data.entry,
    authorizedAdults: result.data.authorizedAdults,
    deskHeldMedications: result.data.deskHeldMedications,
  } : null;
  return <PickupPanel childId={id} day={lessonDate} view={view} error={result.ok ? undefined : result.error.message} />;
}
