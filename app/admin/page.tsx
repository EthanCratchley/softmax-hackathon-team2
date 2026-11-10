import { createDemoState, DEMO_LESSON_DATE } from '@/lib/fixtures';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';
import AdminDashboard from './dashboard';

// Children and groups for the pickers come from the live group listing. Instructor
// accounts come from the seeded accounts (display only); the services enforce every change.
const demo = createDemoState();
const instructorOptions = demo.users.filter((u) => u.role === 'instructor').map((u) => ({ id: u.id, label: u.displayName }));
const staffNames = Object.fromEntries(demo.users.map((u) => [u.id, u.displayName]));

export default async function AdminPage({ searchParams }: {
  searchParams: Promise<{ day?: string | string[] }>;
}) {
  const user = await requireUser('admin');
  const params = await searchParams;
  const requestedDay = Array.isArray(params.day) ? params.day[0] : params.day;
  const lessonDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDay ?? '') ? requestedDay! : DEMO_LESSON_DATE;
  const [completion, operations, pickups, tasks, groups] = await Promise.all([
    services.getProfileCompletionSummary(user),
    services.getOperationsSnapshot(lessonDate, user),
    services.listPickups(lessonDate, user),
    services.getNoticeTasks(user),
    services.listGroups(user),
  ]);
  return <>
    <main className="page admin-communications-link"><a className="button" href="/admin/communications" data-testid="admin-communications-link">Emergency communications →</a></main>
    <AdminDashboard
    lessonDate={lessonDate}
    completion={completion.ok ? completion.data : []}
    operations={operations.ok ? operations.data : null}
    pickups={pickups.ok ? pickups.data : []}
    tasks={tasks.ok ? tasks.data : []}
    groups={groups.ok ? groups.data : []}
    groupsError={groups.ok ? undefined : groups.error.message}
    completionError={completion.ok ? undefined : completion.error.message}
    operationsError={operations.ok ? undefined : operations.error.message}
    pickupsError={pickups.ok ? undefined : pickups.error.message}
    tasksError={tasks.ok ? undefined : tasks.error.message}
    childOptions={groups.ok ? groups.data.flatMap((g) => g.children.map((c) => ({ id: c.childId, label: `${c.firstName} ${c.lastName}` }))) : []}
    groupOptions={groups.ok ? groups.data.map((g) => ({ id: g.groupId, label: `Group ${g.groupNumber} · ${g.skiLevel}` })) : []}
    instructorOptions={instructorOptions}
    staffNames={staffNames}
    />
  </>;
}
