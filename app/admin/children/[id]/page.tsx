import Link from 'next/link';
import { createDemoState } from '@/lib/fixtures';
import { requireUser } from '@/lib/session';
import desk from '../../../desk/roster.module.css';
import styles from '../../dashboard.module.css';
import DetailsPanel from './details-panel';

const demo = createDemoState();

export default async function AdminChildPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser('admin');
  const { id } = await params;
  // Name only, so Hana knows whose details she is about to open; nothing else loads until a reason is logged.
  const child = demo.children.find((c) => c.id === id);
  return <main className={`${desk.desk} ${styles.admin}`} data-testid="admin-child-page">
    <header className={desk.header}><span className={desk.brand}>▲ KESTREL KIDS</span><span className={desk.tag}>ADMIN</span></header>
    <Link href="/admin" className={desk.backLink} data-testid="back-to-admin">← Back to the admin overview</Link>
    <div className={desk.title}><p className={desk.eyebrow}>PROTECTED CHILD DETAILS</p><h1 data-testid="admin-child-name">{child ? `${child.firstName} ${child.lastName}` : 'Child record'}</h1><p>Give a reason to open the full profile. Who, when, which child and why are logged.</p></div>
    <DetailsPanel childId={id} />
  </main>;
}
