'use client';
import { use, useState } from 'react';
import Shell from '@/components/instructor-patrol/shell';
import s from '@/components/instructor-patrol/workspace.module.css';
import { addAction, age, children, escalation, groups, lessonDay, usePreview, type Incident } from '@/lib/instructor-patrol/preview';

export default function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const data = usePreview();
  const incident = data.incidents.find(i => i.id === id);
  const child = children.find(c => c.id === incident?.childId);
  const [type, setType] = useState('Search update');
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState('');
  if (!incident || !child) return <Shell title="Incident not found"><p data-testid="incident-not-found">No emergency packet is available for this incident.</p></Shell>;
  const group = groups.find(g => g.id === child.groupId)!;
  function changeStatus(status: Incident['status']) { addAction(id, `Status changed to ${status}`, '', status); setFeedback(`Incident marked ${status}.`); }
  return <Shell title={`${child.name} · Emergency packet`}>
    <p className={s.muted}>Fictional patrol view. Packet access logging will be connected with secure sign-in.</p>
    <div className={s.alert} data-testid="escalation"><span className={s.pill}>{incident.status}</span><h2>Escalate by {escalation(incident.lastSeenAt)} on {incident.lastSeenAt.slice(0, 10)}</h2><p>Earlier of 60 minutes after last seen or 16:00, resort local time. Follow patrol procedure; make calls yourself.</p></div>
    <div className={s.grid}>
      <section className={s.card}><h2>Child and group</h2><dl><dt>Name</dt><dd>{child.name}</dd><dt>Other names</dt><dd>{child.otherNames || 'None recorded'}</dd><dt>Age / level</dt><dd>{age(child, lessonDay)} · {child.level}</dd><dt>Group</dt><dd>Group {group.number}</dd><dt>Instructor</dt><dd>{group.instructor}</dd><dt>Lift pass</dt><dd>{child.pass || 'Not recorded'}</dd><dt>Bib</dt><dd>{child.bib || 'Not recorded'}</dd></dl></section>
      <section className={s.card}><h2>Last seen</h2><dl><dt>Date and time</dt><dd>{incident.lastSeenAt.replace('T', ' ')}</dd><dt>Place</dt><dd>{incident.place}</dd><dt>Reported by</dt><dd>{incident.reportedBy}</dd><dt>Equipment</dt><dd>{incident.equipment}</dd><dt>Notes</dt><dd>{incident.notes || 'None recorded'}</dd></dl></section>
      <section className={s.card} data-testid="clothing-comparison"><h2>Clothing descriptions</h2><h3>Reported by instructor / radio</h3><p>{incident.clothing} · {incident.helmet}</p><h3>Parent-given for today</h3><p>{child.jacket} · {child.helmet}</p><p className={s.muted}>Descriptions may differ. Confirm by radio; do not assume either is correct.</p></section>
      <section className={s.card}><h2>Safety information</h2>{child.alert ? <div className={s.alert}><strong>{child.alert}</strong><p>{child.medication}</p><p>{child.instructions}</p></div> : <p>No safety alert recorded. This does not confirm there are no medical needs.</p>}<h3>Emergency contacts</h3>{child.contacts.map(contact => <div key={contact.phone}><p><strong>{contact.name}</strong> · {contact.relationship}</p><a data-testid={`contact-${contact.phone}`} href={`tel:${contact.phone}`}>{contact.phone}</a></div>)}</section>
    </div>
    <section className={s.card}><h2>Incident status</h2><div className={s.row}>{(['Open', 'Located', 'Closed'] as const).map(status => <button key={status} data-testid={`status-${status.toLowerCase()}`} disabled={incident.status === status} onClick={() => changeStatus(status)}>Mark {status}</button>)}</div>{incident.locatedAt && <p>Located at {incident.locatedAt}</p>}</section>
    <div className={s.grid}><section className={s.card}><h2>Record an action</h2><form onSubmit={e => { e.preventDefault(); if (!note.trim()) return; addAction(id, type, note.trim()); setNote(''); setFeedback('Action added to the preview timeline.'); }}><label>Action<select data-testid="action-type" value={type} onChange={e => setType(e.target.value)}><option>Search update</option><option>Family contacted</option><option>Shared with police or rescuers</option></select></label><label>What happened<textarea data-testid="action-note" required maxLength={2000} value={note} onChange={e => setNote(e.target.value)} /></label><button data-testid="add-action">Add timed action</button></form>{feedback && <p role="status" data-testid="action-feedback">{feedback}</p>}{data.noticeTasks.includes(id) && <p className={s.banner} data-testid="notice-task">Preview follow-up: Hana must mail the family notice. The real task will be created when services are connected; the mailing address stays out of patrol views.</p>}</section>
    <section className={s.card}><h2>Incident timeline</h2><ol data-testid="incident-timeline">{incident.actions.map((action, index) => <li key={index}><strong>{action.type}</strong><p>{action.note}</p><small>{action.staff} · {action.at}</small></li>)}</ol></section></div>
  </Shell>;
}
