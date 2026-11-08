import { notFound } from 'next/navigation';
import { initialRoster } from '@/lib/desk/fixtures';
import PickupPanel from './pickup-panel';

export default async function PickupPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ day?: string | string[] }>;
}) {
  const { id } = await params;
  const requestedDay = (await searchParams).day;
  const child = initialRoster.find(row => row.id === id && (requestedDay === undefined || row.lessonDay === requestedDay));
  if (!child) notFound();
  return <PickupPanel key={`${id}:${child.lessonDay}`} childId={id} day={child.lessonDay} />;
}
