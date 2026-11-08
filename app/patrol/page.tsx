'use client';
import { useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/instructor-patrol/shell';
import ReportForm from '@/components/instructor-patrol/report-form';
import s from '@/components/instructor-patrol/workspace.module.css';
import { age, children, escalation, groups, lessonDay, usePreview } from '@/lib/instructor-patrol/preview';

export default function Patrol() {
  const data = usePreview();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');
  const active = data.incidents.filter(i => i.status === 'Open');
  const child = children.find(c => c.id === selected);
  return <Shell title="Patrol command">
    <p className={s.muted}>Casey Brooks · Ski patrol · Work from the radio. Record each action.</p>
    <h2>Open incidents · {active.length}</h2>
    {!active.length && <p data-testid="no-open-incidents">No open incidents.</p>}
    <div className={s.grid}>{active.map(incident => { const c = children.find(c => c.id === incident.childId)!; return <article className={s.card} data-testid={`incident-${incident.id}`} key={incident.id}><span className={s.pill}>{incident.status}</span><h2>{c.name}</h2><p>Last seen {incident.lastSeenAt.slice(11, 16)} · {incident.place}</p><p><strong>Escalate by {escalation(incident.lastSeenAt)}</strong></p><Link data-testid={`open-${incident.id}`} href={`/patrol/incidents/${incident.id}`}>Open emergency packet</Link></article>; })}</div>
    <section className={s.card}><h2>Report received by radio?</h2><p>Find the child, then open an incident. Search results show only name, age and group.</p><label>Find a child by any name<input type="search" data-testid="child-search" value={search} onChange={e => { setSearch(e.target.value); setSelected(''); }} /></label>
    {search.trim() && <div data-testid="search-results">{children.filter(c => `${c.name} ${c.otherNames}`.toLowerCase().includes(search.trim().toLowerCase())).map(c => <div className={s.row} key={c.id}><p>{c.name}{c.otherNames ? ` (also ${c.otherNames})` : ''} · Age {age(c, lessonDay)} · Group {groups.find(g => g.id === c.groupId)?.number}</p><button data-testid={`select-${c.id}`} onClick={() => setSelected(c.id)}>Select {c.name}</button></div>)}{!children.some(c => `${c.name} ${c.otherNames}`.toLowerCase().includes(search.trim().toLowerCase())) && <p>No matching children.</p>}</div>}
    </section>
    {child && <section className={s.card}><h2>Radio report: {child.name}</h2><ReportForm child={child} patrol /></section>}
    {data.incidents.some(i => i.status !== 'Open') && <section className={s.card}><h2>Located and closed</h2>{data.incidents.filter(i => i.status !== 'Open').map(i => <p key={i.id}><Link data-testid={`history-${i.id}`} href={`/patrol/incidents/${i.id}`}>{children.find(c => c.id === i.childId)?.name} · {i.status}</Link></p>)}</section>}
  </Shell>;
}
