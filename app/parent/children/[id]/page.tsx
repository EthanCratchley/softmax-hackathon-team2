import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ParentProfileForm } from '@/components/ParentProfileForm';
import { DEMO_LESSON_DATE } from '@/lib/fixtures';
import { requireUser } from '@/lib/session';
import { services } from '@/lib/services';
import { ParentJourneyPanel } from '@/components/ParentJourneyPanel';
import { ProfileChecklist } from '@/components/ProfileChecklist';
import { createPassQrData } from '@/lib/pass-qr';

export default async function ParentChildPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser('parent');
  const { id } = await params;
  const result = await services.getChildProfile(id, user);
  if (!result.ok && result.error.code === 'not_found') notFound();
  const [dropoffPassResult, pickupPassResults, activityResult] = result.ok ? await Promise.all([
    services.issueLessonPass(id, { lessonDate: DEMO_LESSON_DATE, purpose: 'dropoff' }, user),
    Promise.all(result.data.authorizedAdults.filter((adult) => adult.isActive).map((adult) => services.issueLessonPass(id, { lessonDate: DEMO_LESSON_DATE, purpose: 'pickup', adultId: adult.id }, user))),
    services.listParentActivity(id, user),
  ]) : [null, [], null] as const;
  const dropoffPass = dropoffPassResult?.ok ? dropoffPassResult.data : null;
  const pickupPasses = pickupPassResults.flatMap((item) => item.ok ? [item.data] : []);
  const [dropoffQr, pickupQrs] = await Promise.all([
    dropoffPass ? createPassQrData(dropoffPass.token, 176) : Promise.resolve(null),
    Promise.all(pickupPasses.map(async (pass) => [pass.adultId ?? '', await createPassQrData(pass.token, 176)] as const)),
  ]);
  const pickupQrByAdultId = Object.fromEntries(pickupQrs.filter(([adultId]) => adultId));
  return <main className="page parent-page" data-testid="parent-child-page">
    <Link href="/parent" className="back-link">← My Children</Link>
    {!result.ok ? <div className="alert danger" role="alert">{result.error.message}</div> : <>
      <header className="profile-heading"><div className="profile-title-row"><h1>{result.data.child.firstName} {result.data.child.lastName}</h1>
        <span className={`badge ${result.data.completion.status === 'Complete' ? 'ok' : 'warn'}`}>{result.data.completion.status === 'Complete' ? 'Complete' : 'Needs attention'}</span></div>
        <p className="small muted updated-line">Updated {new Date(result.data.child.updatedAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Vancouver' })}</p>
      </header>
      <ProfileChecklist missing={result.data.completion.missing} />
      <ParentJourneyPanel childId={result.data.child.id} childName={result.data.child.firstName} lessonDate={DEMO_LESSON_DATE} adults={result.data.authorizedAdults}
        dropoffPass={dropoffPass} pickupPasses={pickupPasses} dropoffQr={dropoffQr} pickupQrByAdultId={pickupQrByAdultId}
        activity={activityResult?.ok ? activityResult.data : []} />
      <ParentProfileForm profile={result.data} lessonDate={DEMO_LESSON_DATE} />
    </>}
  </main>;
}
