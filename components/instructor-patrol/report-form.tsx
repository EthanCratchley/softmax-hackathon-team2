'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Child, createIncident, lessonDay, usePreview } from '@/lib/instructor-patrol/preview';
import s from './workspace.module.css';

export default function ReportForm({ child, patrol = false }: { child: Child; patrol?: boolean }) {
  const router = useRouter();
  const data = usePreview();
  const [sent, setSent] = useState(false);
  const submitting = useRef(false);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const existing = data.incidents.find(i => i.childId === child.id && i.status !== 'Closed');
  if (sent) return <div className={s.banner} role="status" data-testid="report-success"><h2>Missing report recorded in this preview</h2><p>Preview reference: {reference}. This report is temporary and is not saved in Piezas.</p><p>Radio ski patrol immediately and follow resort procedure. No family or responder has been contacted automatically.</p><Link href="/instructor" data-testid="back-roster">Return to roster</Link></div>;
  if (existing) return <div className={s.banner} data-testid="existing-incident"><h2>An incident is already active for {child.name}</h2><p>Radio patrol with any new information. A second report will not be opened.</p>{patrol && <Link href={`/patrol/incidents/${existing.id}`}>Open incident</Link>}</div>;
  return <form data-testid="missing-form" className={s.card} onSubmit={e => {
    e.preventDefault();
    if (submitting.current) return;
    const form = new FormData(e.currentTarget);
    const read = (key: string) => String(form.get(key) ?? '').trim();
    if (!read('place') || !read('clothing') || !read('helmet') || !read('equipment')) { setError('Enter the last-seen place, clothing, helmet and equipment. Use “unknown” if needed.'); return; }
    if (!read('lastSeenAt').startsWith(`${lessonDay}T`) || !Number.isFinite(Date.parse(read('lastSeenAt')))) { setError('Enter a valid last-seen time on the lesson day.'); return; }
    submitting.current = true;
    const id = createIncident({ childId: child.id, reportedBy: patrol ? 'Casey Brooks · Patrol' : 'Tyler Ng', lastSeenAt: read('lastSeenAt'), place: read('place'), clothing: read('clothing'), helmet: read('helmet'), equipment: read('equipment'), notes: read('notes') });
    if (patrol) router.push(`/patrol/incidents/${id}`); else { setReference(id); setSent(true); }
  }}>
    <h2>Last seen details</h2><p>{child.name} ? Lesson {lessonDay} ? {patrol ? "Casey Brooks, Patrol" : "Tyler Ng, Instructor"}</p><p>Use America/Vancouver resort time. Radio patrol immediately.</p><p>Report what was observed. Use “unknown” rather than guessing.</p>
    <label>Last seen date and time<input data-testid="last-seen" required name="lastSeenAt" type="datetime-local" defaultValue={`${lessonDay}T10:00`} /></label>
    <label>Last seen place<input data-testid="last-place" required name="place" maxLength={300} /></label>
    <label>Reported clothing<input data-testid="reported-clothing" required name="clothing" maxLength={300} /></label>
    <label>Reported helmet<input data-testid="reported-helmet" required name="helmet" maxLength={200} /></label>
    <label>Equipment<input data-testid="equipment" required name="equipment" maxLength={300} /></label>
    <label>Notes<textarea data-testid="report-notes" name="notes" maxLength={2000} /></label>
    {error && <p data-testid="report-error" role="alert">{error}</p>}<button data-testid="submit-report" type="submit">Preview missing-child report</button>
  </form>;
}
