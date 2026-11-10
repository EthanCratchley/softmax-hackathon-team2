import { CommunicationsWorkbench } from '@/components/communications/CommunicationsWorkbench';
import { getDemoCommunications } from '@/lib/communications-demo';
import { requireUser } from '@/lib/session';

export default async function InstructorCommunicationsPage() {
  const user = await requireUser('instructor');
  return <CommunicationsWorkbench workspace={getDemoCommunications(user)} />;
}
