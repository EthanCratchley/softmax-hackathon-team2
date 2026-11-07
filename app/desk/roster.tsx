'use client';

import { useState, type FormEvent } from 'react';
import { initialRoster, lessonDays, mockDeskStaff, type DeskChild } from '@/lib/desk/fixtures';
import styles from './roster.module.css';

const statusLabels = { expected: 'Expected', 'checked-in': 'Checked in', released: 'Released' };
const dayLabel = (day: string) => new Intl.DateTimeFormat('en-CA', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));

export default function DeskRoster() {
  const [roster, setRoster] = useState<DeskChild[]>(initialRoster);
  const [day, setDay] = useState(lessonDays[0]);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const daily = roster.filter(child => child.lessonDay === day);
  const groups = [...new Set(daily.map(child => child.group))].sort();
  const search = query.trim().toLocaleLowerCase();
  const visible = daily.filter(child => (group === 'all' || child.group === group) && [child.name, ...child.otherNames, child.group].some(value => value.toLocaleLowerCase().includes(search)));

  function checkIn(event: FormEvent<HTMLFormElement>, child: DeskChild) {
    event.preventDefault();
    setError('');
    const bib = String(new FormData(event.currentTarget).get('bib') ?? '').trim();
    if (!/^[1-9]\d{0,2}$/.test(bib)) {
      setError('Enter a bib number from 1 to 999.');
      return;
    }
    if (daily.some(other => other.id !== child.id && other.bib === bib && other.status === 'checked-in')) {
      setError(`Bib ${bib} is already in use for this lesson day.`);
      return;
    }
    const checkedInAt = new Date().toISOString();
    setRoster(current => current.map(row => row.id === child.id && row.lessonDay === day && row.status === 'expected' ? { ...row, status: 'checked-in', bib, checkedInAt, checkedInBy: mockDeskStaff } : row));
    setMessage(`${child.name} checked in with bib ${bib}.`);
  }

  return (
    <main className={styles.desk} data-testid="desk-roster">
      <header className={styles.header}><span className={styles.brand}>▲ KESTREL KIDS</span><span className={styles.tag}>DESK · MOCK PREVIEW</span></header>
      <div className={styles.title}><p className={styles.eyebrow}>LESSON DAY OPERATIONS</p><h1>Ready for the mountain.</h1><p>Find a child, check their information status, and get them checked in.</p></div>
      <p className={styles.notice}>Synthetic demo data · Check-ins reset on refresh. No parent notifications are sent.</p>
      <section className={styles.summary} aria-label="Lesson day attendance">
        {(['expected', 'checked-in', 'released'] as const).map(status => <div key={status}><strong data-testid={`count-${status}`}>{daily.filter(child => child.status === status).length}</strong><span>{statusLabels[status]}</span></div>)}
      </section>
      <section className={styles.filters} aria-label="Roster filters">
        <label>Lesson day<select data-testid="lesson-day" value={day} onChange={event => { setDay(event.target.value); setGroup('all'); setMessage(''); setError(''); }}>{lessonDays.map(value => <option key={value} value={value}>{dayLabel(value)}</option>)}</select></label>
        <label className={styles.search}>Search children or groups<input data-testid="roster-search" type="search" placeholder="Name, other name, or group…" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <label>Group<select data-testid="group-filter" value={group} onChange={event => setGroup(event.target.value)}><option value="all">All groups</option>{groups.map(value => <option key={value}>{value}</option>)}</select></label>
      </section>
      <div role="status" aria-live="polite" data-testid="check-in-message">{message}</div>
      {error && <p role="alert" className={styles.warning} data-testid="check-in-error">{error}</p>}
      <div className={styles.listHeading}><h2>Child roster</h2><span data-testid="roster-result-count">{visible.length} of {daily.length} children</span></div>
      <div className={styles.list}>
        {visible.map(child => <article className={styles.child} key={child.id} data-testid={`child-${child.id}`}>
          <div className={styles.identity}><h3>{child.name}</h3>{child.otherNames.length > 0 && <p>Also known as {child.otherNames.join(', ')}</p>}<p>Age {child.age} · {child.group}</p><span className={child.profileComplete ? styles.complete : styles.warning} data-testid={`profile-${child.id}`}>{child.profileComplete ? 'Profile complete' : 'Needs information · Ask parent to update profile'}</span></div>
          <div className={styles.attendance}><span className={styles.status} data-testid={`status-${child.id}`}>{statusLabels[child.status]}</span>
            {child.status === 'expected' ? <form onSubmit={event => checkIn(event, child)} className={styles.checkIn}><label htmlFor={`bib-${child.id}`}>Bib number<input id={`bib-${child.id}`} name="bib" data-testid={`bib-${child.id}`} inputMode="numeric" required pattern="[1-9][0-9]{0,2}" maxLength={3} placeholder="e.g. 14" /></label><button data-testid={`check-in-${child.id}`} type="submit">Check in</button></form> : <p data-testid={`check-in-details-${child.id}`}>Bib {child.bib}{child.checkedInAt && <><br /><time dateTime={child.checkedInAt}>{new Intl.DateTimeFormat('en-CA', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Vancouver' }).format(new Date(child.checkedInAt))} Pacific</time><br />Checked in by {child.checkedInBy}</>}</p>}
          </div>
        </article>)}
        {visible.length === 0 && <p className={styles.empty} data-testid="roster-empty">{daily.length === 0 ? 'No children scheduled for this lesson day.' : 'No children match these filters. Try another name or group.'}</p>}
      </div>
      <footer className={styles.footer}>Desk view · Profile warnings contain no medical details.</footer>
    </main>
  );
}
