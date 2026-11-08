'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { authorizedAdults, incidentFor, releaseBlock } from '@/lib/desk/pickup-mock';
import { useDeskMock } from '../../mock-context';
import styles from '../../roster.module.css';

const statusLabels = { expected: 'Expected', 'checked-in': 'Checked in', released: 'Released' };
const timestamp = (value: string) => new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Vancouver' }).format(new Date(value)) + ' Pacific';

export default function PickupPanel({ childId, day }: { childId: string; day: string }) {
  const { state, dispatch, setDay } = useDeskMock();
  const [adultId, setAdultId] = useState('');
  const [idChecked, setIdChecked] = useState(false);
  const [denialName, setDenialName] = useState('');
  useEffect(() => { setDay(day); dispatch({ type: 'clear-error' }); }, [day, dispatch, setDay]);
  const child = state.roster.find(row => row.id === childId && row.lessonDay === day)!;
  const adults = authorizedAdults(childId, day);
  const block = releaseBlock(state, child);
  const release = state.releases.find(record => record.childId === childId && record.lessonDay === day);
  const denials = state.denials.filter(record => record.childId === childId && record.lessonDay === day);
  const incident = incidentFor(childId, day);

  function releaseChild(event: FormEvent) {
    event.preventDefault();
    dispatch({ type: 'release', childId, day, adultId, idChecked, at: new Date().toISOString() });
  }
  function denyPickup(event: FormEvent) {
    event.preventDefault();
    dispatch({ type: 'deny', childId, day, adultName: denialName, at: new Date().toISOString() });
    setDenialName(''); setAdultId(''); setIdChecked(false);
  }

  return <main className={styles.desk} data-testid="pickup-page">
    <header className={styles.header}><span className={styles.brand}>▲ KESTREL KIDS</span><span className={styles.tag}>DESK · MOCK PREVIEW</span></header>
    <Link className={styles.backLink} data-testid="back-to-desk" href="/desk">← Back to roster</Link>
    <div className={styles.title}><p className={styles.eyebrow}>AUTHORIZED PICKUP · {day}</p><h1 data-testid="pickup-child-name">{child.name}</h1><p data-testid="pickup-child-details">{child.group} · Bib {child.bib ?? 'not assigned'} · <span data-testid="pickup-attendance">{statusLabels[child.status]}</span></p></div>
    <p className={styles.notice}>Synthetic demo · Check-ins, releases and denial logs stay in this page session only and reset on refresh. No notifications are sent.</p>
    {!child.profileComplete && <p className={styles.warning}>Needs information · Ask parent to update profile.</p>}
    {block && <p className={styles.blocked} role="status" data-testid="release-blocked">{block}</p>}
    {incident === 'located' && <p className={styles.notice} data-testid="incident-located">An incident happened today. Refer family questions to Hana.</p>}
    {state.error && <p className={styles.blocked} role="alert" data-testid="pickup-error">{state.error}</p>}
    {release && <section className={styles.panel} data-testid="release-record" aria-label="Mock release record"><h2>Released to {release.adultName}</h2><dl className={styles.record}><dt>Authorized adult</dt><dd>{release.adultName} ({release.adultId})</dd><dt>Lesson day</dt><dd>{release.lessonDay}</dd><dt>Released at</dt><dd><time dateTime={release.releasedAt}>{timestamp(release.releasedAt)}</time></dd><dt>Staff member</dt><dd>{release.staff}</dd><dt>Physical ID check</dt><dd>Confirmed</dd><dt>Authorization source</dt><dd>{release.source}{release.linkId && ` (${release.linkId})`}</dd></dl><p>Mock release record · No edit or delete controls.</p></section>}
    <section className={styles.panel} aria-label="Authorized pickup adults"><h2>Authorized adults</h2><p>Only active authorizations valid for {day} appear. Match the adult’s physical ID before release.</p>
      <form onSubmit={releaseChild}>
        <fieldset className={styles.adults} disabled={Boolean(block)}><legend>Select the adult collecting this child</legend>
          {adults.map(adult => <label className={styles.adult} key={adult.id}><input type="radio" name="adult" value={adult.id} checked={adultId === adult.id} data-testid={`adult-${adult.id}`} onChange={() => { setAdultId(adult.id); setIdChecked(false); dispatch({ type: 'clear-error' }); }} /><span><strong>{adult.name}</strong><span>{adult.relationship} · {adult.source}</span><span>{adult.validUntil ? `Valid ${adult.validFrom ?? 'through'} to ${adult.validUntil}` : 'Active pickup authorization'}</span></span></label>)}
          {!adults.length && <p data-testid="no-authorized-adults">No authorized adults are valid for this lesson day. Contact an authorized parent or Hana.</p>}
        </fieldset>
        <label className={styles.idCheck}><input type="checkbox" data-testid="id-confirmation" checked={idChecked} disabled={Boolean(block) || !adultId} onChange={event => setIdChecked(event.target.checked)} /><span>I physically checked this adult’s ID and it matches the selected authorized adult.</span></label>
        <button type="submit" data-testid="release-child" disabled={Boolean(block) || !adultId || !idChecked}>Confirm release</button>
      </form>
    </section>
    <section className={styles.panel} aria-label="Unlisted pickup attempt"><h2>Adult not listed?</h2><p>Release blocked. Contact an authorized parent or Hana. Recording a name here never authorizes pickup or releases a child.</p><form onSubmit={denyPickup} className={styles.denialForm}><label>Attempted pickup adult’s name<input data-testid="denial-name" value={denialName} onChange={event => setDenialName(event.target.value)} required maxLength={100} /></label><button data-testid="record-denial" type="submit" disabled={!denialName.trim()}>Record denied attempt</button></form>
      {denials.length > 0 && <div role="status" className={styles.blocked} data-testid="denial-message">Release blocked. Denied attempt recorded in the mock log. Contact an authorized parent or Hana.</div>}
      <ul className={styles.denialLog} data-testid="denial-log">{denials.map((record, index) => <li key={index} data-testid="denial-record"><strong>{record.adultName}</strong><p>{record.reason}</p><p><time dateTime={record.recordedAt}>{timestamp(record.recordedAt)}</time> · {record.staff} · {record.lessonDay}</p></li>)}</ul>
    </section>
    <footer className={styles.footer}>Desk view · No medical records displayed. Mock logs are temporary and are not a secure audit trail.</footer>
  </main>;
}
