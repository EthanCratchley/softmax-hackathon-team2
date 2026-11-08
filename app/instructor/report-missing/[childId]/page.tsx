'use client';
import { use } from 'react';
import Shell from '@/components/instructor-patrol/shell';
import ReportForm from '@/components/instructor-patrol/report-form';
import { children, groups, instructorId } from '@/lib/instructor-patrol/preview';

export default function MissingPage({ params }: { params: Promise<{ childId: string }> }) {
  const { childId } = use(params);
  const child = children.find(c => c.id === childId && groups.some(g => g.id === c.groupId && g.instructorId === instructorId));
  return <Shell title={child ? `Report missing: ${child.name}` : 'Child not found'}>{child ? <ReportForm child={child} /> : <p data-testid="child-not-found">This child is not in your assigned preview group.</p>}</Shell>;
}
