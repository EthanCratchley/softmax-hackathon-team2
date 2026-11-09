'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { escalation, lessonActive, lessonDay, type Child, type Group, type Incident, type Member } from '@/lib/safety/model';
import styles from './workspace.module.css';

type Role = 'instructor' | 'patrol';
type VisibleChild = Partial<Child> & { id: string; name: string };
type View = {
  practice?: boolean;
  practiceSession?: string;
  clock?: { day: string; time: string };
  who: Member;
  children: VisibleChild[];
  groups: Group[];
  incidents: Partial<Incident>[];
  flags: { groupId: string; due: string; confirmed?: string; overdue: boolean; lostContact: boolean }[];
};
type Act = (body: Record<string, unknown>) => Promise<any>;

export async function rpc(body: Record<string, unknown>) {
  const response = await fetch('/api/safety', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

type WorkspaceProps = { role: Role; id?: string; report?: boolean };

export default function Workspace(props: WorkspaceProps) {
  return <Suspense fallback={<main className={styles.command}><p>Loading your workspace…</p></main>}><WorkspaceContent {...props}/></Suspense>;
}

function WorkspaceContent({ role, id, report = false }: WorkspaceProps) {
  const router = useRouter();
  const path = usePathname();
  const query = useSearchParams();
  const selectedDay = query.get('day');
  const day = selectedDay && /^\d{4}-\d{2}-\d{2}$/.test(selectedDay) ? selectedDay : lessonDay;
  const [data, setData] = useState<View>();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [search, setSearch] = useState('');
  const [packet, setPacket] = useState<{ child: Child; incident: Incident; group: Group; bib?: string }>();

  const load = useCallback(async () => {
    const response = await fetch(`/api/safety?day=${day}`, { cache: 'no-store' });
    const value = await response.json();
    if (response.status === 401) { router.replace('/login'); return; }
    if (!response.ok) throw new Error(value.error);
    if (value.who.role !== role) { router.replace('/'); return; }
    if (id && role === 'patrol' && !report) setPacket(await rpc({ action: 'packet', incidentId: id, practiceSession: value.practiceSession }));
    setData(value);
  }, [day, role, router, id, report]);

  useEffect(() => {
    setData(undefined); setPacket(undefined); setError('');
    load().catch(e => setError(e.message));
    const timer = setInterval(() => load().catch(e => setError(e.message)), 30000);
    return () => clearInterval(timer);
  }, [load, path]);

  async function act(body: Record<string, unknown>) {
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await rpc({ ...body, day, practiceSession: data?.practiceSession });
      setMessage('Saved.'); await load(); return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
      return undefined;
    } finally { setBusy(false); }
  }

  const child = data?.children.find(c => c.id === id);
  const resetNotice = data?.practice && query.get('reset') === data.practiceSession ? 'Practice session reset. Previous history is preserved.' : '';
  return <main data-testid="safety-workspace" className={styles.command}>
    <header><Link href="/" className="brand"><svg aria-hidden="true" viewBox="0 0 40 32" width="38" height="32" fill="none"><path d="M2 29 15 5l8 14 5-9 10 19H2Z" stroke="currentColor" strokeWidth="2.5"/><path d="m10 14 5 3 4-4" stroke="currentColor" strokeWidth="2"/></svg><span>KESTREL KIDS<small>ALPINE SAFETY</small></span></Link><span>{data?.who.name}<small>{role === 'instructor' ? 'Lesson team' : 'Ski patrol'}</small></span></header>
    <nav className="toolbar">
      <Link href={`/${role}?day=${day}`}>My workspace</Link>
      <button data-testid="refresh" onClick={() => load().catch(e => setError(e.message))}>Refresh</button>
      <button onClick={async () => {
        await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
        router.replace('/login');
      }}>Sign out</button>
    </nav>
    <section className={styles.hero}>
      <div><p className={styles.eyebrow}>{role === 'instructor' ? 'ON THE MOUNTAIN / INSTRUCTOR' : 'MOUNTAIN RESPONSE / PATROL'}</p>
        <h1>{role === 'instructor' ? 'Your group. Every child.' : 'Every minute matters.'}</h1>
        <p>{role === 'instructor' ? 'Know your group. Keep safety in sight.' : 'Clear information. Coordinated response.'}</p>
      </div>
      <label>Lesson day<input data-testid="lesson-day" type="date" value={day} onChange={e => {
        if (!e.target.value) return;
        const nextQuery = new URLSearchParams(query.toString());
        nextQuery.set('day', e.target.value);
        setData(undefined); setPacket(undefined);
        router.replace(`${path}?${nextQuery}`, { scroll: false });
      }}/></label>
    </section>
    <p className={styles.radioNotice}><span aria-hidden="true">↗</span> Use radios and resort procedures when urgent help is needed. <span>Fictional demo information only.</span></p>
    {error && <p role="alert" data-testid="error" className="error">{error}</p>}
    {(message || resetNotice) && <p role="status" data-testid="saved">{message || resetNotice}</p>}
    {!data && !error && <p>Loading your workspace…</p>}
    {data?.practice && <section className={styles.practice} aria-label="Practice session">
      <strong>Isolated practice session</strong><p>Profiles and sign-in stay intact. Reset starts fresh group checks and patrol work; previous practice history is retained.</p>
      {!confirmReset ? <button data-testid="reset-practice" disabled={busy} onClick={() => setConfirmReset(true)}>Reset practice session</button> : <div role="group" aria-label="Confirm practice reset">
        <p>Start a fresh session for both instructor and patrol? All other open practice screens will need refreshing.</p>
        <button data-testid="confirm-reset-practice" disabled={busy} onClick={async () => {
          setBusy(true); setError('');
          try {
            const result = await rpc({ action: 'reset-practice', confirmation: 'RESET PRACTICE', practiceSession: data.practiceSession });
            setSearch(''); setPacket(undefined); setConfirmReset(false); setData(undefined);
            setMessage('Practice session reset. Previous history is preserved.');
            router.replace(`/${role}?day=${lessonDay}&reset=${result.practiceSession}`);
            if (!id && day === lessonDay) await load();
          } catch (e) { setError(e instanceof Error ? e.message : 'Could not reset practice.'); }
          finally { setBusy(false); }
        }}>Confirm reset</button>
        <button disabled={busy} onClick={() => setConfirmReset(false)}>Keep practising</button>
      </div>}
    </section>}
    {data && <fieldset disabled={busy} className="workspace-content">
      {report && (child ? <Report key={`${child.id}-${day}`} child={child} day={day} act={async b => {
        const result = await act(b);
        if (result) setMessage('Missing report saved. Return to your workspace or radio patrol.');
      }}/> : <p data-testid="not-found">Not found</p>)}
      {id && role === 'patrol' && !report && packet && <Packet packet={packet} act={act}/>}
      {!id && <>
        {role === 'patrol' && <label className={styles.search}>Find a child or group<input data-testid="search" placeholder="Search name or group number" value={search} onChange={e => setSearch(e.target.value)}/></label>}
        {role === 'instructor' && data.groups.map(g => <section key={g.id} data-testid={`group-${g.id}`}>
          <h2>Group {g.number} · {g.level} · {g.instructor}</h2>
          {data.flags.filter(f => f.groupId === g.id).map(f => <div key={g.id} data-testid={`group-status-${g.id}`}>
            {data.clock?.day === day && lessonActive(data.clock.time) ? <div className="notice" data-testid="headcount-panel">
              <strong>Next headcount at {f.due}</strong>
              {f.confirmed && <p data-testid="headcount-confirmed">Confirmed at {f.confirmed}</p>}
              <button data-testid="all-here" disabled={(data.clock?.time || '') < f.due} onClick={() => act({ action: 'headcount', groupId: g.id })}>
                All {data.children.filter(c => c.groupId === g.id).length} here
              </button>
              <a href="#roster" data-testid="someone-missing">Someone is missing</a>
            </div> : <p data-testid="headcount-paused">Headcounts paused outside lesson time, including lunch from 11:45 to 12:45.</p>}
          </div>)}
        </section>)}
        <div className="grid" id="roster">{data.children.filter(c =>
          `${c.name} ${c.otherNames || ''} ${data.groups.find(g => g.id === c.groupId)?.number || ''}`.toLowerCase().includes(search.toLowerCase())
        ).map(c => <article key={c.id} data-testid={`child-${c.id}`}>
          <span className={styles.cardLabel}>{role === 'instructor' ? 'LESSON ROSTER' : 'PATROL DIRECTORY'}</span><h2>{c.name}</h2>
          <p>{c.otherNames} Age {Number(day.slice(0, 4)) - Number(c.birthDate?.slice(0, 4)) - (day.slice(5) < (c.birthDate?.slice(5) || '') ? 1 : 0)} · {c.level}</p>
          {role === 'instructor' ? <>
            {[c.allergies, c.conditions, c.medications].some(v => v && v.toLowerCase() !== 'none') && <div className="notice" data-testid={`alert-${c.id}`}>
              <strong>{[c.allergies, c.conditions, c.medications].filter(v => v && v.toLowerCase() !== 'none').join(' · ')}</strong>
              <p>{c.medications} · {c.location}</p><p>{c.instructions}</p>
            </div>}
            <Link className="button" data-testid={`report-${c.id}`} href={`/instructor/report-missing/${c.id}?day=${day}`}>Report missing</Link>
          </> : <>
            <p>Group {data.groups.find(g => g.id === c.groupId)?.number}</p>
            {data.incidents.filter(i => i.childId === c.id).map(i => <Link className="button" data-status={i.status} key={i.id} href={`/patrol/incidents/${i.id}?day=${i.day || day}`}>{i.status} incident <span aria-hidden="true">↗</span></Link>)}
            <Link className="button secondary" href={`/patrol/report-missing/${c.id}?day=${day}`}>Open incident from radio call</Link>
          </>}
        </article>)}</div>
      </>}
    </fieldset>}
    <footer>People contact families and rescuers. The app records what happened; it never calls them automatically.</footer>
  </main>;
}

function Report({child,day,act}:{child:VisibleChild;day:string;act:Act}){return <form data-testid="missing-report-form" onSubmit={e=>{e.preventDefault();const fields=Object.fromEntries(new FormData(e.currentTarget));act({action:'report',childId:child.id,...fields});}}><h2>Report {child.name} missing</h2><p>Radio patrol immediately. This report does not call anyone.</p><label>Last seen at<input data-testid="last-seen-at" type="datetime-local" name="lastSeenAt" defaultValue={`${day}T14:30`} required/></label>{[['place','Last-seen place'],['clothing','Reported jacket'],['helmet','Reported helmet'],['equipment','Equipment'],['notes','Notes']].map(([key,label])=><label key={key}>{label}<input data-testid={key} name={key} required={['place','clothing','helmet'].includes(key)}/></label>)}<button data-testid="submit-report">Report missing</button></form>;}
function Packet({packet,act}:{packet:{child:Child;incident:Incident;group:Group;bib?:string};act:Act}){const {child:c,incident:i,group:g}=packet;return <section data-testid="emergency-packet"><h2>{c.name} <span className={styles.incidentStatus} data-incident-status={i.status}>{i.status}</span></h2><p>{c.otherNames} · Age {Number(i.day.slice(0,4))-Number(c.birthDate.slice(0,4))-(i.day.slice(5)<c.birthDate.slice(5)?1:0)} · Birth date {c.birthDate} · {c.level} · Group {g?.number} · {g?.instructor}</p><div className="grid"><article><h3>Search details</h3><p>Last seen: {i.lastSeenAt} · {i.place}</p><p>Instructor-reported: {i.clothing}, {i.helmet}, {i.equipment}</p><p>Parent-given: {c.jacket}, {c.helmet}</p><p>Pass {c.pass} · Bib {packet.bib||'Not checked in'}</p><p>{i.notes}</p><p data-testid="escalation">Escalate by {escalation(i.lastSeenAt)}</p></article><article><h3>Safety information</h3><p>{c.allergies} · {c.conditions}</p><p>{c.medications} · {c.location}</p><p>{c.instructions}</p></article><article><h3>Emergency contacts</h3>{c.contacts.map((v,n)=><p key={n}>{v.name} · {v.relationship} · <a href={`tel:${v.phone}`}>{v.phone}</a></p>)}</article></div><h3>Timeline</h3>{i.actions.map((a,n)=><p key={n} data-testid="timeline-entry">{a.type} · {a.staff} · {a.at} · {a.note}</p>)}{i.status!=='Closed'&&<form onSubmit={e=>{e.preventDefault();const b=Object.fromEntries(new FormData(e.currentTarget));act({action:'incident-action',incidentId:i.id,...b});}}><label>Action<select name="type" data-testid="incident-action"><option>Note</option><option>Family contacted</option><option>Shared with police or rescuers</option>{i.status==='Open'?<option>Located</option>:<option>Closed</option>}</select></label><label>Notes / where located<input data-testid="action-note" name="note"/></label><button data-testid="save-action">Record action</button></form>}</section>;}

