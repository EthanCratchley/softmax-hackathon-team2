import Link from 'next/link';
import { DeskPassScanner } from '@/components/DeskPassScanner';
import { DEMO_LESSON_DATE } from '@/lib/fixtures';
import { requireUser } from '@/lib/session';

export default async function DeskScanPage() {
  await requireUser('desk');
  return <main className="page desk-scan-page"><Link href="/" className="back-link">← Home</Link><DeskPassScanner /></main>;
}
