'use client';

import { useEffect, useRef, useState } from 'react';
import type { PassLookupView } from '@/lib/domain/types';
import { redeemDeskPass, resolveDeskPass } from '@/app/desk/scan/actions';

export function DeskPassScanner() {
  const [value, setValue] = useState('');
  const [pass, setPass] = useState<PassLookupView | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [idChecked, setIdChecked] = useState(false);
  const [bibNumber, setBibNumber] = useState('');
  const [pending, setPending] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  async function lookup(raw: string) {
    setPending(true); setPass(null); setError(''); setNotice(''); setIdChecked(false); setBibNumber('');
    try {
      const result = await resolveDeskPass(raw);
      if (result.ok) setPass(result.data); else setError(result.error.message);
    } catch { setError('Could not check the pass. Check the connection and try again.'); }
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
      } catch { setError('Camera unavailable. Enter the 8-digit code instead.'); setCameraOpen(false); }
    }
    void start();
    return () => { cancelled = true; controlsRef.current?.stop(); controlsRef.current = null; };
  }, [cameraOpen]);

  async function redeem() {
    if (!pass) return;
    setPending(true); setError(''); setNotice('');
    try {
      const result = await redeemDeskPass(pass.passId, { idChecked, bibNumber });
      if (!result.ok) { setError(result.error.message); return; }
      setNotice(pass.purpose === 'dropoff' ? 'Drop-off recorded.' : `Pick-up recorded for ${result.data.adultName ?? pass.adultName ?? 'authorized adult'}.`);
      setPass(null); setValue('');
    } catch { setError('Could not save this update. Check the connection and try again.'); }
    finally { setPending(false); }
  }

  const matchingLabel = pass ? `${pass.childFirstName} ${pass.childLastName} · ${pass.purpose === 'dropoff' ? 'Drop-off' : `Pick-up · ${pass.adultName ?? 'authorized adult'}`}` : '';
  const canRedeem = Boolean(pass?.canRedeem) && !pending && (pass?.purpose !== 'pickup' || idChecked) && (pass?.purpose !== 'dropoff' || Boolean(bibNumber.trim()));

  return <div className="desk-scan-layout">
    <section className="desk-scan-card" aria-labelledby="scanner-title">
      <p className="eyebrow">Lesson day check-in</p><h1 id="scanner-title">Scan a family pass</h1>
      <p className="muted">Scan the QR code or type the 8-digit number shown in the parent portal.</p>
      <div className="scanner-input-row"><label className="field">QR or 8-digit code<input data-testid="pass-input" inputMode="text" autoComplete="off" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Enter code" onKeyDown={(event) => { if (event.key === 'Enter') void lookup(value); }} /></label><button data-testid="pass-lookup" type="button" className="button primary" disabled={pending || !value.trim()} onClick={() => void lookup(value)}>{pending ? 'Checking…' : 'Find pass'}</button></div>
      {!cameraOpen ? <button type="button" className="button camera-button" onClick={() => { setError(''); setCameraOpen(true); }}>Open camera scanner</button> : <div className="camera-box"><video ref={videoRef} muted playsInline /><button type="button" className="button" onClick={() => { controlsRef.current?.stop(); setCameraOpen(false); }}>Stop camera</button></div>}
      {error && <p role="alert" className="alert danger">{error}</p>}{notice && <p data-testid="desk-notice" role="status" className="alert ok">{notice}</p>}
      {pass && <div className="scan-result" data-testid="scan-result"><p className="eyebrow">Pass found</p><h2>{matchingLabel}</h2><p>Lesson date: {pass.lessonDate}</p><p>Expires: {new Date(pass.expiresAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Vancouver' })}</p>
        {pass.blockedReason && <p className="alert warn" role="status">{pass.blockedReason}</p>}
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
