import { DEMO_LESSON_DATE } from '@/lib/fixtures';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';
import AdminDashboard from './dashboard';

export default async function AdminPage({ searchParams }: {
  searchParams: Promise<{ day?: string | string[] }>;
}) {
  const user = await requireUser('admin');
  const params = await searchParams;
  const requestedDay = Array.isArray(params.day) ? params.day[0] : params.day;
  const lessonDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDay ?? '') ? requestedDay! : DEMO_LESSON_DATE;
  const [completion, operations] = await Promise.all([
    services.getProfileCompletionSummary(user),
    services.getOperationsSnapshot(lessonDate, user),
  ]);
  return <AdminDashboard
    lessonDate={lessonDate}
    completion={completion.ok ? completion.data : []}
    operations={operations.ok ? operations.data : null}
    completionError={completion.ok ? undefined : completion.error.message}
    operationsError={operations.ok ? undefined : operations.error.message}
  />;
}
