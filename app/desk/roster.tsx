'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { DeskRosterEntry } from '@/lib/domain/types';
import { lessonDays } from '@/lib/desk/fixtures';
import styles from './roster.module.css';

const statusLabels = { Expected: 'Expected', CheckedIn: 'Checked in', Released: 'Released' };
const dayLabel = (day: string) => new Intl.DateTimeFormat('en-CA', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));
const childName = (child: DeskRosterEntry) => `${child.firstName} ${child.lastName}`;

export default function DeskRoster({ roster, day, error }: { roster: DeskRosterEntry[]; day: string; error?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const groups = [...new Set(roster.map(child => child.groupNumber === null ? 'Unassigned' : `Group ${child.groupNumber}`))].sort();
  const search = query.trim().toLocaleLowerCase();
  const visible = roster.filter(child => {
    const groupName = child.groupNumber === null ? 'Unassigned' : `Group ${child.groupNumber}`;
    return (group === 'all' || group === groupName) && [child.firstName, child.lastName, ...child.otherNames, groupName].some(value => value.toLocaleLowerCase().includes(search));
  });
  const counts = {
    Expected: roster.filter(child => child.status === 'Expected').length,
    CheckedIn: roster.filter(child => child.status === 'CheckedIn').length,
    Released: roster.filter(child => child.status === 'Released').length,
  };

  return (
    <main className={styles.desk} data-testid="desk-roster">
      <header className={styles.header}><span className={styles.brand}>▲ KESTREL KIDS</span><span className={styles.tag}>DESK</span></header>
      <div className={styles.title}><p className={styles.eyebrow}>LESSON DAY OPERATIONS</p><h1>Ready for the mountain.</h1><p>Find a child, check their information status, and get them checked in.</p></div>
      <p className={styles.notice}>Open a child to check them in, release them to an authorized adult, or record a denied pickup.</p>
      <Link className={styles.pickupLink} data-testid="open-pass-scanner" href={`/desk/scan?day=${day}`}>Scan a parent's lesson pass →</Link>
      <section className={styles.summary} aria-label="Lesson day attendance">
        {(['Expected', 'CheckedIn', 'Released'] as const).map(status => <div key={status}><strong data-testid={`count-${status === 'CheckedIn' ? 'checked-in' : status.toLowerCase()}`}>{counts[status]}</strong><span>{statusLabels[status]}</span></div>)}
      </section>
      <section className={styles.filters} aria-label="Roster filters">
        <label>Lesson day<select data-testid="lesson-day" value={day} onChange={event => router.push(`/desk?day=${encodeURIComponent(event.target.value)}`)}>{lessonDays.map(value => <option key={value} value={value}>{dayLabel(value)}</option>)}</select></label>
        <label className={styles.search}>Search children or groups<input data-testid="roster-search" type="search" placeholder="Name, other name, or group…" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <label>Group<select data-testid="group-filter" value={group} onChange={event => setGroup(event.target.value)}><option value="all">All groups</option>{groups.map(value => <option key={value}>{value}</option>)}</select></label>
      </section>
      {error && <p role="alert" className={styles.warning} data-testid="roster-error">Could not load the roster: {error}</p>}
      <div className={styles.listHeading}><h2>Child roster</h2><span data-testid="roster-result-count">{visible.length} of {roster.length} children</span></div>
      <div className={styles.list}>
        {visible.map(child => {
          const groupName = child.groupNumber === null ? 'Unassigned' : `Group ${child.groupNumber}`;
          return <article className={styles.child} key={child.childId} data-testid={`child-${child.childId}`}>
            <div className={styles.identity}><h3>{childName(child)}</h3>{child.otherNames.length > 0 && <p>Also known as {child.otherNames.join(', ')}</p>}<p>{groupName}</p><span className={child.needsInformation ? styles.warning : styles.complete} data-testid={`profile-${child.childId}`}>{child.needsInformation ? 'Needs information · Ask parent to update profile' : 'Profile complete'}</span></div>
            <div className={styles.attendance}><span className={styles.status} data-testid={`status-${child.childId}`}>{statusLabels[child.status]}</span>
              <Link className={styles.pickupLink} data-testid={`pickup-${child.childId}`} href={`/desk/children/${child.childId}?day=${day}`}>View pickup →</Link>
              {child.checkedInAt && <p data-testid={`check-in-time-${child.childId}`}>Checked in at <time dateTime={child.checkedInAt}>{new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Vancouver' }).format(new Date(child.checkedInAt))} Pacific</time></p>}
            </div>
          </article>;
        })}
        {!error && visible.length === 0 && <p className={styles.empty} data-testid="roster-empty">{roster.length === 0 ? 'No children scheduled for this lesson day.' : 'No children match these filters. Try another name or group.'}</p>}
      </div>
      <footer className={styles.footer}>Desk view · Profile warnings contain no medical details.</footer>
    </main>
  );
}
