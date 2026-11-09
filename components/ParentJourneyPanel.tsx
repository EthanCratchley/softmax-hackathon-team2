'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AuthorizedAdult, LessonDate, LessonPass, ParentActivityEvent } from '@/lib/domain/types';
import { PassQRCode } from './PassQRCode';

export function ParentJourneyPanel({ childId, childName, lessonDate, adults, dropoffPass, pickupPasses, dropoffQr, pickupQrByAdultId, activity }: {
  childId: string;
  childName: string;
  lessonDate: LessonDate;
  adults: AuthorizedAdult[];
  dropoffPass: LessonPass | null;
  pickupPasses: LessonPass[];
  dropoffQr: string | null;
  pickupQrByAdultId: Record<string, string | null>;
  activity: ParentActivityEvent[];
}) {
  const [purpose, setPurpose] = useState<'dropoff' | 'pickup'>('dropoff');
  const activeAdults = adults.filter((adult) => adult.isActive);
  const [adultId, setAdultId] = useState(activeAdults[0]?.id ?? '');
  const selectedAdult = activeAdults.find((adult) => adult.id === adultId) ?? activeAdults[0];
  const pass = purpose === 'dropoff' ? dropoffPass : pickupPasses.find((item) => item.adultId === selectedAdult?.id) ?? null;
  const [copied, setCopied] = useState(false);
  const today = activity.filter((event) => event.lessonDate === lessonDate);
  const checkedIn = today.some((event) => event.kind === 'checked_in');
  const pickedUp = today.some((event) => event.kind === 'released');
  const lessonDayLabel = new Date(`${lessonDate}T12:00:00-08:00`).toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/Vancouver',
  });

  async function copyCode() {
    if (!pass) return;
    try { await navigator.clipboard.writeText(pass.shortCode); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
    catch { setCopied(false); }
  }

  return <section className="journey-panel" aria-labelledby="journey-title" data-testid="journey-panel">
    <div className="journey-heading"><div><p className="eyebrow">{lessonDayLabel}</p><h2 id="journey-title">Drop-Off and Pick-Up</h2></div>
      <span className={`badge ${pickedUp || checkedIn ? 'ok' : 'warn'}`}>{pickedUp ? 'Picked up' : checkedIn ? 'Checked in' : 'Expected'}</span>
    </div>
    <div className="journey-grid">
      <div className="pass-card">
        <div className="pass-tabs" role="group" aria-label="Pass type">
          <button type="button" className={purpose === 'dropoff' ? 'selected' : ''} aria-pressed={purpose === 'dropoff'} onClick={() => setPurpose('dropoff')}>Drop-off</button>
          <button type="button" className={purpose === 'pickup' ? 'selected' : ''} aria-pressed={purpose === 'pickup'} onClick={() => setPurpose('pickup')}>Pick-up</button>
        </div>
        {purpose === 'pickup' && activeAdults.length > 0 && <label className="field pass-adult">Authorized adult
          <select value={selectedAdult?.id ?? ''} onChange={(event) => setAdultId(event.target.value)}>{activeAdults.map((adult) => <option key={adult.id} value={adult.id}>{adult.name} · {adult.relationship}</option>)}</select>
        </label>}
        {purpose === 'pickup' && activeAdults.length === 0 && <p className="small muted">Add an authorized adult in Contacts to create a pick-up pass.</p>}
        {pass ? <div className="pass-content">
          <PassQRCode dataUrl={purpose === 'dropoff' ? dropoffQr : (pass.adultId ? pickupQrByAdultId[pass.adultId] : null) ?? null} label={`${purpose} QR pass for ${childName}`} size={176} />
          <div className="pass-code-wrap"><span className="small muted">Or enter this 8-digit code</span><strong className="pass-code" data-testid={`${purpose}-pass-code`}>{pass.shortCode.slice(0, 4)} {pass.shortCode.slice(4)}</strong>
            <button className="button" type="button" onClick={copyCode}>{copied ? 'Copied' : 'Copy code'}</button>
            <Link className="button pass-fullscreen-link" href={`/parent/children/${encodeURIComponent(childId)}/pass?purpose=${purpose}${purpose === 'pickup' && selectedAdult ? `&adultId=${encodeURIComponent(selectedAdult.id)}` : ''}`}>Open full-screen pass</Link>
            <span className="small muted">Valid until {new Date(pass.expiresAt).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Vancouver' })}</span>
          </div>
        </div> : <div className="empty-state small">Pass unavailable. Reload the page or check the pickup list.</div>}
        <p className="small muted pass-footnote">Staff match the adult against your authorized list and check photo ID. A code alone never releases {childName}.</p>
      </div>
      <div className="activity-card"><div className="activity-heading"><h3>Recent Activity</h3></div>
        {activity.length ? <ol className="activity-list">{activity.map((event) => <li key={event.id}><span className={`activity-dot ${event.kind}`} aria-hidden="true" /><div><strong>{event.kind === 'checked_in' ? 'Dropped off' : 'Picked up'}</strong>{event.adultName && <span> by {event.adultName}</span>}<time dateTime={event.at}>{new Date(event.at).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Vancouver' })}</time></div></li>)}</ol> : <p className="empty-activity">No drop-off or pick-up activity yet.</p>}
        <p className="small muted">History is from the desk’s saved attendance and pickup records.</p>
      </div>
    </div>
  </section>;
}
