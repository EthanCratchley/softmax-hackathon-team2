import { CommunicationsWorkbench } from '@/components/communications/CommunicationsWorkbench';
import { getDemoCommunications } from '@/lib/communications-demo';
import { requireUser } from '@/lib/session';

export default async function ParentCommunicationsPage() {
  const user = await requireUser('parent');
  return <CommunicationsWorkbench workspace={getDemoCommunications(user)} />;
}
