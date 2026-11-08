'use client';
import Link from 'next/link';
import { useState } from 'react';
import Shell from '@/components/instructor-patrol/shell';
import s from '@/components/instructor-patrol/workspace.module.css';
import { age, children, confirmHeadcount, groups, instructorId, lessonActive, lessonDay, nextHeadcount, usePreview } from '@/lib/instructor-patrol/preview';

export default function Instructor() {
  const [day, setDay] = useState(lessonDay);
  const [time, setTime] = useState('10:00');
  const data = usePreview();
  const assigned = groups.filter(g => g.instructorId === instructorId && g.day === day);
  return <Shell title="Your group. Every child.">
    <p className={s.muted}>Alex Morgan · Instructor · Only your assigned groups and need-to-know safety information.</p>
    <div className={s.grid}><label>Lesson day<input data-testid="lesson-day" type="date" value={day} onChange={e => setDay(e.target.value)} /></label><label>Preview lesson time<input data-testid="lesson-time" type="time" value={time} onChange={e => setTime(e.target.value)} /></label></div>
    {!assigned.length && <p data-testid="empty-roster">No assigned groups for this lesson day.</p>}
    {assigned.map(group => {
      const roster = children.filter(c => c.groupId === group.id);
      const confirmed = data.headcounts[group.id];
      const due = confirmed ? nextHeadcount(confirmed) : '10:00';
      return <section key={group.id} aria-label={`Group ${group.number}`}>
        <h2>Group {group.number} · {group.level} · {roster.length} children</h2>
        {lessonActive(time) ? <div className={s.banner} data-testid="headcount-panel"><strong>{time >= due ? 'Headcount due' : `Next headcount at ${due}`}</strong><p>Check every child is with the group.</p><div className={s.row}><button data-testid="all-here" disabled={time < due} onClick={() => confirmHeadcount(group.id, time)}>All {roster.length} here</button><a href="#roster" data-testid="someone-missing">Someone is missing</a></div>{confirmed && <p role="status" data-testid="headcount-confirmed">All {roster.length} accounted for at {confirmed}. Next prompt at {due}.</p>}</div> : <p data-testid="headcount-paused">Headcounts paused outside lesson time, including lunch from 11:45 to 12:45.</p>}
        <div className={s.grid} id="roster">{roster.map(child => <article className={s.card} data-testid={`child-${child.id}`} key={child.id}><h3>{child.name}</h3><p>Age {age(child, day)} · {child.level} · Bib {child.bib}</p>{child.alert && <div className={s.alert} data-testid={`alert-${child.id}`}><strong>{child.alert}</strong><p>{child.medication}</p><p>{child.instructions}</p></div>}<Link data-testid={`report-${child.id}`} href={`/instructor/report-missing/${child.id}`}>Report missing</Link></article>)}</div>
      </section>;
    })}
  </Shell>;
}
