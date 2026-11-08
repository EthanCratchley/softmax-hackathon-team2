import Link from 'next/link';
import { DEMO_LESSON_DATE } from '@/lib/fixtures';
import { services } from '@/lib/services';
import { requireUser, ROLE_HOME } from '@/lib/session';
import type { VerifiedUser } from '@/lib/domain/types';

// Signed-in landing. Each line below is a real, authorized service read for
// the signed-in role — the pattern every screen follows.
async function summary(user: VerifiedUser): Promise<string> {
  switch (user.role) {
    case 'parent': {
      const r = await services.getMyChildren(user);
      if (!r.ok) return r.error.message;
      const needs = r.data.filter((c) => c.completion.status === 'NeedsInformation').length;
      return `${r.data.length} linked child(ren) · ${needs} need information`;
    }
    case 'instructor': {
      const r = await services.getInstructorRoster(DEMO_LESSON_DATE, user);
      if (!r.ok) return r.error.message;
      const kids = r.data.flatMap((g) => g.children);
      return `${r.data.map((g) => `Group ${g.groupNumber}`).join(', ') || 'No groups'} · ${kids.length} children · ${kids.filter((k) => k.alerts.length).length} with safety alerts`;
    }
    case 'desk': {
      const r = await services.getDeskRoster(DEMO_LESSON_DATE, user);
      if (!r.ok) return r.error.message;
      return `${r.data.length} expected · ${r.data.filter((e) => e.status !== 'Expected').length} checked in · ${r.data.filter((e) => e.status === 'Released').length} released`;
    }
    case 'patrol': {
      const r = await services.listOpenIncidents(user);
      return r.ok ? `${r.data.length} open incident(s)` : r.error.message;
    }
    case 'admin': {
      const r = await services.getProfileCompletionSummary(user);
      return r.ok ? `${r.data.length} child profile(s) need information` : r.error.message;
    }
  }
}

export default async function Home() {
  const user = await requireUser();
  return (
    <main className="page" data-testid="home">
      <p className="eyebrow">Lesson day {DEMO_LESSON_DATE}</p>
      <h1>Hi, {user.displayName.split(' ')[0]}</h1>
      <p className="card" data-testid="home-summary">
        {await summary(user)}
      </p>
      <Link href={ROLE_HOME[user.role]} className="button primary" data-testid="open-workspace">
        Open my workspace
      </Link>
    </main>
  );
}
