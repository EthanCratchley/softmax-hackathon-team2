import { CommunicationsWorkbench } from '@/components/communications/CommunicationsWorkbench';
import { services } from '@/lib/services';
import { requireUser } from '@/lib/session';

export default async function AdminCommunicationsPage() {
  const user = await requireUser('admin');
  const result = await services.getCommunicationWorkspace(user);
  return <CommunicationsWorkbench workspace={result.ok ? result.data : null} />;
}
