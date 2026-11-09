import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PassQRCode } from '@/components/PassQRCode';
import { DEMO_LESSON_DATE } from '@/lib/fixtures';
import { requireUser } from '@/lib/session';
import { services } from '@/lib/services';
import { createPassQrData } from '@/lib/pass-qr';

export default async function ParentLessonPassPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ purpose?: string; adultId?: string }>;
}) {
  const user = await requireUser('parent');
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const profile = await services.getChildProfile(id, user);
  if (!profile.ok) notFound();

  const purpose = query.purpose === 'pickup' ? 'pickup' : 'dropoff';
  const activeAdults = profile.data.authorizedAdults.filter((adult) => adult.isActive);
  const selectedAdult = activeAdults.find((adult) => adult.id === query.adultId) ?? activeAdults[0];
  if (purpose === 'pickup' && !selectedAdult) {
    return <main className="page pass-fullscreen-page"><Link className="back-link" href={`/parent/children/${encodeURIComponent(id)}`}>← Back to profile</Link>
      <section className="pass-fullscreen-card"><p className="eyebrow">Lesson-day pass</p><h1>Pick-Up Pass</h1><p>Add an active authorized adult to this child’s profile before creating a pick-up pass.</p>
        <Link className="button primary" href={`/parent/children/${encodeURIComponent(id)}`}>Update authorized adults</Link></section></main>;
  }

  const issued = await services.issueLessonPass(id, {
    lessonDate: DEMO_LESSON_DATE,
    purpose,
    ...(purpose === 'pickup' && selectedAdult ? { adultId: selectedAdult.id } : {}),
  }, user);
  if (!issued.ok) notFound();
  const pass = issued.data;
  const qrDataUrl = await createPassQrData(pass.token, 320);
  const childName = `${profile.data.child.firstName} ${profile.data.child.lastName}`;
  const title = purpose === 'dropoff' ? 'Drop-Off Pass' : 'Pick-Up Pass';

  return <main className="page pass-fullscreen-page" data-testid="pass-fullscreen-page">
    <Link className="back-link" href={`/parent/children/${encodeURIComponent(id)}`}>← Back to {profile.data.child.firstName}’s profile</Link>
    <section className="pass-fullscreen-card" aria-labelledby="full-pass-title">
      <p className="eyebrow">Lesson day · {new Date(`${DEMO_LESSON_DATE}T12:00:00-08:00`).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Vancouver' })}</p>
      <h1 id="full-pass-title">{title}</h1>
      <p className="pass-fullscreen-name">{childName}{purpose === 'pickup' && selectedAdult ? ` · ${selectedAdult.name}` : ''}</p>
      <PassQRCode dataUrl={qrDataUrl} label={`${purpose} QR pass for ${childName}`} size={320} />
      <div className="pass-fullscreen-code"><span className="small muted">If scanning isn’t available, enter this code</span><strong className="pass-code" data-testid="fullscreen-pass-code">{pass.shortCode.slice(0, 4)} {pass.shortCode.slice(4)}</strong></div>
      <p className="small muted">Valid until {new Date(pass.expiresAt).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Vancouver' })}. Staff will verify authorized pick-up adults and photo ID.</p>
      <Link className="button pass-switch" href={`/parent/children/${encodeURIComponent(id)}/pass?purpose=${purpose === 'dropoff' ? 'pickup' : 'dropoff'}${purpose === 'dropoff' && selectedAdult ? `&adultId=${encodeURIComponent(selectedAdult.id)}` : ''}`}>Show {purpose === 'dropoff' ? 'pick-up' : 'drop-off'} pass</Link>
    </section>
  </main>;
}
