import { CommunicationsWorkbench } from '@/components/communications/CommunicationsWorkbench';
import { getDemoCommunications } from '@/lib/communications-demo';
import { requireUser } from '@/lib/session';

export default async function AdminCommunicationsPage() {
  const user = await requireUser('admin');
  return <CommunicationsWorkbench workspace={getDemoCommunications(user)} />;
}
