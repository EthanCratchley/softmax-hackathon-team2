'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { PassLookupView } from '@/lib/domain/types';
import { redeemDeskPass, resolveDeskPass } from '@/app/desk/scan/actions';
import styles from '@/app/desk/scan/scan-confirmation.module.css';

type ScanFeedback =
  | { kind: 'success'; childName: string; eventType: 'checked_in' | 'released'; adultName: string | null; at: string }
  | { kind: 'failure'; reason: string };

const safeFailureReason = (message: string, code?: string) => {
  const lower = message.toLowerCase();
  if (code === 'not_found') return 'No active pass matches that code for today.';
  if (lower.includes('expired')) return 'This pass has expired.';
  if (lower.includes('already') || lower.includes('used') || lower.includes('picked up')) return 'This pass has already been used or the child’s attendance has changed.';
  if (lower.includes('adult') || lower.includes('authorized') || lower.includes('photo id')) return 'Pickup could not be confirmed. Staff must verify an active authorized adult and photo ID.';
  if (lower.includes('patrol') || lower.includes('incident')) return 'Release is paused while staff resolve a safety incident.';
  if (lower.includes('matches that number more than one')) return 'This code is not unique. Scan the QR code or ask staff for help.';
  if (lower.includes('8-digit')) return 'Enter the 8-digit code or scan the QR code.';
  return 'This pass could not be confirmed. Ask staff for help.';
};

const displayTime = (value: string) => new Date(value).toLocaleString('en-CA', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Vancouver',
});

export function DeskPassScanner() {
  const [value, setValue] = useState('');
  const [pass, setPass] = useState<PassLookupView | null>(null);
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
  const [idChecked, setIdChecked] = useState(false);
  const [bibNumber, setBibNumber] = useState('');
  const [pending, setPending] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  async function lookup(raw: string) {
    setPending(true); setPass(null); setFeedback(null); setIdChecked(false); setBibNumber('');
    try {
      const result = await resolveDeskPass(raw);
      if (!result.ok) setFeedback({ kind: 'failure', reason: safeFailureReason(result.error.message, result.error.code) });
      else if (!result.data.canRedeem) setFeedback({ kind: 'failure', reason: safeFailureReason(result.data.blockedReason ?? 'Pass unavailable.') });
      else setPass(result.data);
    } catch { setFeedback({ kind: 'failure', reason: 'Could not check the pass. Check the connection and try again.' }); }
    finally { setPending(false); }
  }

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!cameraOpen || !videoRef.current) return;
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser');
        if (cancelled || !videoRef.current) return;
        const reader = new BrowserQRCodeReader();
        controlsRef.current = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
          if (result) { const raw = result.getText(); setValue(raw); setCameraOpen(false); controlsRef.current?.stop(); void lookup(raw); }
        });
      } catch { setFeedback({ kind: 'failure', reason: 'Camera unavailable. Enter the 8-digit code instead.' }); setCameraOpen(false); }
    }
    void start();
    return () => { cancelled = true; controlsRef.current?.stop(); controlsRef.current = null; };
  }, [cameraOpen]);

  async function redeem() {
    if (!pass) return;
    setPending(true); setFeedback(null);
    try {
      const result = await redeemDeskPass(pass.passId, { idChecked, bibNumber });
      if (!result.ok) {
        setFeedback({ kind: 'failure', reason: safeFailureReason(result.error.message, result.error.code) });
        setPass(null);
        return;
      }
      setFeedback({ kind: 'success', childName: result.data.childName, eventType: result.data.eventType, adultName: result.data.adultName, at: result.data.occurredAt });
      setPass(null); setValue('');
    } catch {
      setFeedback({ kind: 'failure', reason: 'Could not save this update. Check the connection and try again.' });
      setPass(null);
    } finally { setPending(false); }
  }

  const reset = () => { setFeedback(null); setPass(null); setValue(''); setIdChecked(false); setBibNumber(''); };
  const matchingLabel = pass ? `${pass.childFirstName} ${pass.childLastName} · ${pass.purpose === 'dropoff' ? 'Drop-off' : `Pick-up · ${pass.adultName ?? 'authorized adult'}`}` : '';
  const canRedeem = Boolean(pass?.canRedeem) && !pending && (pass?.purpose !== 'pickup' || idChecked) && (pass?.purpose !== 'dropoff' || Boolean(bibNumber.trim()));

  return <div className="desk-scan-layout">
    <section className="desk-scan-card" aria-labelledby="scanner-title">
      <p className="eyebrow">Lesson day check-in</p><h1 id="scanner-title">Scan a family pass</h1>
      <p className="muted">Scan the QR code or type the 8-digit number shown in the parent portal.</p>
      {!feedback && <>
        <div className="scanner-input-row"><label className="field">QR or 8-digit code<input data-testid="pass-input" inputMode="text" autoComplete="off" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Enter code" onKeyDown={(event) => { if (event.key === 'Enter') void lookup(value); }} /></label><button data-testid="pass-lookup" type="button" className="button primary" disabled={pending || !value.trim()} onClick={() => void lookup(value)}>{pending ? 'Checking…' : 'Find pass'}</button></div>
        {!cameraOpen ? <button type="button" className="button camera-button" onClick={() => setCameraOpen(true)}>Open camera scanner</button> : <div className="camera-box"><video ref={videoRef} muted playsInline aria-label="Camera view for scanning a family pass" /><button type="button" className="button" onClick={() => { controlsRef.current?.stop(); setCameraOpen(false); }}>Stop camera</button></div>}
      </>}
      {feedback?.kind === 'failure' && <section className={`${styles.result} ${styles.failure}`} data-testid="scan-failure" role="alert" aria-labelledby="scan-failure-title">
        <span className={styles.failureMark} aria-hidden="true">!</span><h2 id="scan-failure-title">Pass Not Confirmed</h2><p>{feedback.reason}</p>
        <div className={styles.actions}><button type="button" className="button primary" onClick={reset}>Try again</button><Link className="button" href="/desk">Get staff assistance</Link></div>
      </section>}
      {feedback?.kind === 'success' && <section className={`${styles.result} ${styles.success}`} data-testid="scan-confirmation" role="status" aria-live="polite" aria-labelledby="scan-success-title">
        <span className={styles.checkmark} aria-hidden="true">✓</span><h2 id="scan-success-title">{feedback.eventType === 'checked_in' ? 'Drop-Off Confirmed' : 'Pick-Up Confirmed'}</h2>
        <p className={styles.childName}>{feedback.childName}</p>
        <p>{feedback.eventType === 'checked_in' ? 'Checked in' : `Released to ${feedback.adultName ?? 'authorized adult'}`}</p>
        <p className={styles.timestamp}><time dateTime={feedback.at}>{displayTime(feedback.at)}</time></p>
        <button type="button" className="button primary" onClick={reset}>Scan another pass</button>
      </section>}
      {pass && <div className="scan-result" data-testid="scan-result"><p className="eyebrow">Pass found</p><h2>{matchingLabel}</h2><p>Lesson date: {pass.lessonDate}</p><p>Expires: {displayTime(pass.expiresAt)}</p>
        {pass.needsInformation && <p className="alert warn" role="status" data-testid="pass-needs-information">Needs information · Ask the parent to update the profile.</p>}
        {pass.purpose === 'pickup' && <>
          <p className="small" data-testid="pass-authorized-adult"><strong>Authorized adult on active list:</strong> {pass.adultName ?? 'No active adult found'}</p>
          <label className="check-field id-check"><input data-testid="pass-id-check" type="checkbox" checked={idChecked} disabled={!pass.adultOnList} onChange={(event) => setIdChecked(event.target.checked)} /> I verified the adult present matches this authorized adult and checked their photo ID.</label>
        </>}
        {pass.purpose === 'dropoff' && <label className="field">Bib number<input data-testid="pass-bib-number" inputMode="numeric" value={bibNumber} onChange={(event) => setBibNumber(event.target.value)} placeholder="Enter bib number" /></label>}
        <button data-testid="pass-redeem" type="button" className="button primary" disabled={!canRedeem} onClick={() => void redeem()}>{pending ? 'Saving…' : pass.purpose === 'dropoff' ? 'Record drop-off' : 'Record pick-up'}</button>
      </div>}
    </section>
    <aside className="desk-safety-note"><span aria-hidden="true">✓</span><div><strong>For every pick-up</strong><p>Confirm the adult is active on this child’s authorized list and check photo ID. The pass code alone never releases a child.</p></div></aside>
  </div>;
}
