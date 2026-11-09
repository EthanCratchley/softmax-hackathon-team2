import { DEMO_LESSON_DATE } from '@/lib/fixtures';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';
import DeskRoster from './roster';

export default async function DeskPage({ searchParams }: {
  searchParams: Promise<{ day?: string | string[] }>;
}) {
  const user = await requireUser('desk');
  const params = await searchParams;
  const requestedDay = Array.isArray(params.day) ? params.day[0] : params.day;
  const lessonDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDay ?? '') ? requestedDay! : DEMO_LESSON_DATE;
  const result = await services.getDeskRoster(lessonDate, user);
  return <DeskRoster roster={result.ok ? result.data : []} day={lessonDate} error={result.ok ? undefined : result.error.message} />;
}
