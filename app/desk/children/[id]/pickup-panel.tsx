'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';
import type { DeskRosterEntry, DeskPickupView } from '@/lib/domain/types';
import { checkInAction, deniedPickupAction, pickupAction } from './actions';
import styles from '../../roster.module.css';

const statusLabels = { Expected: 'Expected', CheckedIn: 'Checked in', Released: 'Released' } as const;
const timestamp = (value: string) => new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Vancouver' }).format(new Date(value)) + ' Pacific';
type PickupPanelView = Pick<DeskPickupView, 'authorizedAdults' | 'deskHeldMedications'> & { entry: DeskRosterEntry };

export default function PickupPanel({ childId, day, view, error }: { childId: string; day: string; view: PickupPanelView | null; error?: string }) {
  const router = useRouter();
  const [adultId, setAdultId] = useState('');
  const [idChecked, setIdChecked] = useState(false);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);
  const [pending, startTransition] = useTransition();

  function runAction(action: Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action;
      setMessage(result.message);
      setMessageError(!result.ok);
      if (result.ok) {
        setAdultId('');
        setIdChecked(false);
        router.refresh();
      }
    });
  }

  function submitCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction(checkInAction.bind(null, childId, day)(new FormData(event.currentTarget)));
  }

  function submitRelease(event: FormEvent) {
    event.preventDefault();
    if (!adultId || !idChecked || pending) return;
    runAction(pickupAction(childId, day, adultId, idChecked));
  }

  function submitDenial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction(deniedPickupAction.bind(null, childId, day)(new FormData(event.currentTarget)));
    event.currentTarget.reset();
  }

  const entry = view?.entry;
  const released = entry?.pickup.kind === 'Released' ? entry.pickup : null;
  const blocked = !entry || entry.pickup.kind === 'OpenIncident' || entry.status === 'Released';
  const name = entry ? `${entry.firstName} ${entry.lastName}` : 'Child pickup';

  return <main className={styles.desk} data-testid="pickup-page">
    <header className={styles.header}><span className={styles.brand}>▲ KESTREL KIDS</span><span className={styles.tag}>DESK</span></header>
    <Link className={styles.backLink} data-testid="back-to-desk" href={`/desk?day=${encodeURIComponent(day)}`}>← Back to roster</Link>
    <div className={styles.title}><p className={styles.eyebrow}>AUTHORIZED PICKUP · {day}</p><h1 data-testid="pickup-child-name">{name}</h1>{entry && <p data-testid="pickup-child-details">{entry.groupNumber === null ? 'Unassigned group' : `Group ${entry.groupNumber}`} · Bib {entry.bibNumber ?? 'not assigned'} · <span data-testid="pickup-attendance">{statusLabels[entry.status]}</span></p>}</div>
    {error && <p className={styles.blocked} role="alert" data-testid="pickup-load-error">Could not load pickup details: {error}</p>}
    {message && <p className={messageError ? styles.blocked : styles.notice} role={messageError ? 'alert' : 'status'} data-testid="pickup-action-message">{message}</p>}
    {entry?.needsInformation && <p className={styles.warning}>Needs information · Ask parent to update profile.</p>}
    {view?.deskHeldMedications.map(line => <p className={styles.notice} data-testid="medication-held-indicator" key={line}>{line}</p>)}
    {entry && <section className={styles.panel} aria-label="Check-in history" data-testid="check-in-history"><h2>Check-in history</h2>{entry.checkedInAt ? <dl className={styles.record}><dt>Checked in at</dt><dd><time data-testid="pickup-check-in-time" dateTime={entry.checkedInAt}>{timestamp(entry.checkedInAt)}</time></dd>{entry.bibNumber && <><dt>Bib number</dt><dd data-testid="pickup-check-in-bib">{entry.bibNumber}</dd></>}</dl> : <p data-testid="no-check-in-history">No check-in recorded for this lesson.</p>}</section>}
    {entry?.pickup.kind === 'OpenIncident' && <p className={styles.blocked} role="status" data-testid="release-blocked">Release blocked: Call patrol. A missing-child incident is open.</p>}
    {entry?.pickup.kind === 'IncidentToday' && <p className={styles.notice} data-testid="incident-located">An incident happened today. Refer family questions to Hana.</p>}
    {released && <section className={styles.panel} data-testid="release-record" aria-label="Release record"><h2>Released to {released.adultName}</h2><dl className={styles.record}><dt>Authorized pickup adult</dt><dd>{released.adultName}</dd><dt>Released at</dt><dd><time dateTime={released.releasedAt}>{timestamp(released.releasedAt)}</time></dd><dt>Release status</dt><dd>Recorded by the shared service</dd></dl><p>A second release is blocked.</p></section>}
    {entry?.status === 'Expected' && <section className={styles.panel} aria-label="Check in child"><h2>Check in</h2><p>Check-in is saved by the shared service.</p><form onSubmit={submitCheckIn} className={styles.form}><label>Bib number<input name="bibNumber" data-testid="bib-number" inputMode="numeric" required pattern="[1-9][0-9]{0,2}" maxLength={3} /></label><button data-testid="check-in-child" type="submit" disabled={pending}>{pending ? 'Saving…' : 'Check in'}</button></form></section>}
    <section className={styles.panel} aria-label="Authorized pickup adults"><h2>Authorized adults</h2><p>Only active authorized adults are shown. Match the adult’s physical ID before release.</p>
      <form onSubmit={submitRelease}>
        <fieldset className={styles.adults} disabled={pending || blocked || entry?.status !== 'CheckedIn'}><legend>Select the adult collecting this child</legend>
          {view?.authorizedAdults.map(adult => <label className={styles.adult} key={adult.id}><input type="radio" name="adult" value={adult.id} checked={adultId === adult.id} data-testid={`adult-${adult.id}`} onChange={() => { setAdultId(adult.id); setIdChecked(false); setMessage(''); }} /><span><strong>{adult.name}</strong><span>{adult.relationship}</span></span></label>)}
          {view && !view.authorizedAdults.length && <p data-testid="no-authorized-adults">No active authorized adults are available for this lesson.</p>}
        </fieldset>
        <label className={styles.idCheck}><input type="checkbox" data-testid="id-confirmation" checked={idChecked} disabled={pending || blocked || entry?.status !== 'CheckedIn' || !adultId} onChange={event => setIdChecked(event.target.checked)} /><span>I physically checked this adult’s ID and it matches the selected authorized adult.</span></label>
        <button type="submit" data-testid="release-child" disabled={pending || blocked || entry?.status !== 'CheckedIn' || !adultId || !idChecked}>{pending ? 'Saving…' : 'Confirm release'}</button>
      </form>
    </section>
    <section className={styles.panel} aria-label="Unlisted pickup attempt"><h2>Adult not listed?</h2><p>Release is blocked. Contact an authorized parent or Hana. Recording an attempt never authorizes pickup.</p><form onSubmit={submitDenial} className={styles.denialForm}><label>Attempted pickup adult’s name<input name="statedAdultName" data-testid="denial-name" required maxLength={100} /></label><label>Reason for denial<input name="reason" data-testid="denial-reason" required maxLength={500} /></label><button data-testid="record-denial" type="submit" disabled={pending || !entry}>{pending ? 'Saving…' : 'Record denied attempt'}</button></form></section>
    <footer className={styles.footer}>Desk view · Only desk-safe information is shown.</footer>
  </main>;
}
