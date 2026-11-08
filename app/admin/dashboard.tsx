'use client';

import { useReducer, useState, type Dispatch, type FormEvent } from 'react';
import { lessonDays } from '@/lib/desk/fixtures';
import { incidentFor, authorizedAdults } from '@/lib/desk/pickup-mock';
import {
  adminReducer, createAdminState, dailySummary, demoNow, failedEmails, groupChildren,
  instructors, missingFields, operationalWarnings, pendingNotices, requiredFields,
  type AdminAction, type AdminState,
} from '@/lib/admin/mock';
import desk from '../desk/roster.module.css';
import styles from './dashboard.module.css';

const timeLabel = (at: string) => new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Vancouver' }).format(new Date(at)) + ' Pacific';

export default function AdminDashboard() {
  const [state, dispatch] = useReducer(adminReducer, undefined, createAdminState);
  const [day, setDay] = useState(lessonDays[0]);
  const summary = dailySummary(state, day);
  const warnings = operationalWarnings(state, day);
  const name = (id: string) => state.roster.find(child => child.id === id)?.name ?? 'Child not recorded';
  const incomplete = state.roster.filter(child => (missingFields[child.id]?.length ?? 0) > 0);
  const openIncidents = state.roster.filter(child => child.lessonDay === day && incidentFor(child.id, day) === 'open');
  const denials = state.denials.filter(record => record.lessonDay === day);
  const emails = failedEmails.filter(record => record.day === day);
  const notices = pendingNotices.filter(record => record.day === day);

  return <main className={`${desk.desk} ${styles.admin}`} data-testid="admin-dashboard">
    <header className={desk.header}><span className={desk.brand}>▲ KESTREL KIDS</span><span className={desk.tag}>ADMIN · MOCK PREVIEW</span></header>
    <div className={desk.title}><p className={desk.eyebrow}>HANA’S OPERATIONS DESK</p><h1>Every detail accounted for.</h1><p>Follow up on missing information, coordinate groups, and see what needs attention.</p></div>
    <p className={desk.notice}>Synthetic demo · Admin changes and logs reset on refresh. This is a separate snapshot of the shared child fixtures; desk session changes are not synchronized. No messages are sent.</p>
    <div className={desk.filters}><label>Lesson day (demo)<select data-testid="admin-lesson-day" value={day} onChange={event => { setDay(event.target.value); dispatch({ type: 'close-details' }); }}>{lessonDays.map(value => <option key={value}>{value}</option>)}</select></label><p>Operational snapshot: {timeLabel(demoNow(day))}</p></div>
    <section className={`${desk.summary} ${styles.summary}`} aria-label="Daily operational summary">
      {Object.entries(summary).map(([key, value]) => <div key={key}><strong data-testid={`admin-count-${key}`}>{value}</strong><span>{{ expected: 'Expected', checkedIn: 'Checked in', released: 'Released', missing: 'Missing' }[key]}</span></div>)}
    </section><p className={styles.caption}>Missing means an open incident, and can overlap attendance counts. Counts follow the selected demo day.</p>
    <div role="status" data-testid="admin-message">{state.message}</div>
    {state.error && <p className={desk.blocked} role="alert" data-testid="admin-error">{state.error}</p>}

    <section className={desk.panel} aria-label="Incomplete profiles"><h2>Missing required information</h2><p>All lesson days · Only missing field names appear here; no medical values.</p>
      <ul className={styles.list} data-testid="incomplete-profiles">{incomplete.map(child => <li key={child.id} data-testid={`incomplete-${child.id}`}><strong>{child.name}</strong><p>{child.lessonDay} · {child.group}</p><ul>{missingFields[child.id].map(field => <li key={field} data-testid={`missing-${child.id}-${field}`}>{requiredFields[field]}</li>)}</ul></li>)}</ul>
      {!incomplete.length && <p>No incomplete profiles.</p>}
    </section>

    <div className={styles.columns}>
      <section className={desk.panel} aria-label="Open missing-child incidents"><h2>Open missing-child incidents</h2><ul className={styles.list} data-testid="admin-open-incidents">{openIncidents.map(child => <li key={child.id} data-testid={`incident-${child.id}`}><strong>{child.name}</strong><p>{child.group} · Open · Call patrol. Use the patrol procedure; the app does not contact families or responders.</p></li>)}</ul>{!openIncidents.length && <p>No open incidents for this lesson day.</p>}</section>
      <section className={desk.panel} aria-label="Denied pickup attempts"><h2>Denied pickup attempts</h2><ul className={styles.list} data-testid="admin-denials">{denials.map((record, index) => <li key={index} data-testid="admin-denial"><strong>{name(record.childId)} · {record.adultName}</strong><p>{record.reason}</p><p><time dateTime={record.recordedAt}>{timeLabel(record.recordedAt)}</time> · {record.staff}</p></li>)}</ul>{!denials.length && <p>No denied pickup attempts for this lesson day.</p>}</section>
      <section className={desk.panel} aria-label="Overdue headcounts"><h2>Overdue headcounts</h2><ul className={styles.list} data-testid="admin-headcounts">{warnings.overdue.map(group => <li key={group.id}><strong>{group.name}</strong><p>Headcount more than 10 minutes overdue · Due {timeLabel(state.headcounts.find(record => record.groupId === group.id && record.day === day && !record.confirmedAt)!.dueAt)}.</p></li>)}</ul>{!warnings.overdue.length && <p>No overdue headcounts for this snapshot.</p>}</section>
      <section className={desk.panel} aria-label="Instructor contact warnings"><h2>Instructor contact</h2><ul className={styles.list} data-testid="admin-contact-warnings">{warnings.lostContact.map(group => <li key={group.id}><strong>{group.name} · {instructors.find(person => person.id === group.instructorId)?.name}</strong><p>Instructor not responding: try the radio</p><p>Last contact {timeLabel(state.instructorContacts.find(record => record.instructorId === group.instructorId && record.day === day)!.lastContactAt)}.</p></li>)}</ul>{!warnings.lostContact.length && <p>No instructor-contact warnings for this snapshot.</p>}</section>
      <section className={desk.panel} aria-label="Failed emails"><h2>Failed emails</h2><ul className={styles.list} data-testid="admin-failed-emails">{emails.map(record => <li key={record.id}><strong>{name(record.childId)} · {record.type}</strong><p>{record.message}</p><time dateTime={record.at}>{timeLabel(record.at)}</time></li>)}</ul>{!emails.length && <p>No failed emails for this lesson day.</p>}</section>
      <section className={desk.panel} aria-label="Pending notice tasks"><h2>Pending notice tasks</h2><ul className={styles.list} data-testid="admin-notice-tasks">{notices.map(task => <li key={task.id}><strong>{task.title} · {name(task.childId)}</strong><p>{task.cause}</p><p>Mailing address is not supplied in the demo fixture. Open child details with a reason to check availability; no notice has been sent.</p></li>)}</ul>{!notices.length && <p>No pending notices for this lesson day.</p>}</section>
    </div>

    <GroupAssignments key={day} state={state} day={day} dispatch={dispatch} />
    <ProtectedDetails state={state} dispatch={dispatch} />
    <Corrections key={`corrections-${day}`} state={state} day={day} dispatch={dispatch} />
    <footer className={desk.footer}>Admin preview · No live sign-in or server access controls are added. Temporary mock logs are not secure or persistent audit records.</footer>
  </main>;
}

type StateProps = { state: AdminState; dispatch: Dispatch<AdminAction> };
function GroupAssignments({ state, day, dispatch }: StateProps & { day: string }) {
  const groups = state.groups.filter(group => group.day === day);
  const children = state.roster.filter(child => child.lessonDay === day);
  const [childId, setChildId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [instructorGroup, setInstructorGroup] = useState('');
  const [instructorId, setInstructorId] = useState('');
  return <section className={desk.panel} aria-label="Group assignments"><h2>Group assignments</h2><p>Maximum six children per group. Assignments change only this admin preview.</p>
    <div className={styles.groupGrid}>{groups.map(group => <div className={styles.group} key={group.id} data-testid={`group-${group.id}`}><h3>{group.name} · <span data-testid={`group-count-${group.id}`}>{groupChildren(state, group).length}/6</span></h3><p data-testid={`group-instructor-${group.id}`}>{instructors.find(person => person.id === group.instructorId)?.name ?? 'Not assigned'}</p><ul>{groupChildren(state, group).map(child => <li key={child.id}>{child.name}</li>)}</ul></div>)}</div>
    {!groups.length && <p>No groups scheduled for this lesson day.</p>}
    <form className={styles.form} onSubmit={event => { event.preventDefault(); dispatch({ type: 'assign-child', childId, groupId, day }); }}><label>Child<select data-testid="assign-child" value={childId} onChange={event => setChildId(event.target.value)} required><option value="">Choose child</option>{children.map(child => <option key={child.id} value={child.id}>{child.name}</option>)}</select></label><label>Destination group<select data-testid="assign-child-group" value={groupId} onChange={event => setGroupId(event.target.value)} required><option value="">Choose group</option>{groups.map(group => <option key={group.id} value={group.id}>{group.name} ({groupChildren(state, group).length}/6)</option>)}</select></label><button data-testid="save-child-assignment" disabled={!childId || !groupId}>Assign child</button></form>
    <form className={styles.form} onSubmit={event => { event.preventDefault(); dispatch({ type: 'assign-instructor', groupId: instructorGroup, instructorId, day }); }}><label>Group<select data-testid="assign-instructor-group" value={instructorGroup} onChange={event => setInstructorGroup(event.target.value)} required><option value="">Choose group</option>{groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label><label>Instructor<select data-testid="assign-instructor" value={instructorId} onChange={event => setInstructorId(event.target.value)} required><option value="">Choose instructor</option>{instructors.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label><button data-testid="save-instructor-assignment" disabled={!instructorGroup || !instructorId}>Assign instructor</button></form>
  </section>;
}

function ProtectedDetails({ state, dispatch }: StateProps) {
  const [childId, setChildId] = useState('');
  const [reason, setReason] = useState('');
  const child = state.roster.find(row => row.id === state.openedChildId);
  const fields = child ? missingFields[child.id] : [];
  function open(event: FormEvent) { event.preventDefault(); dispatch({ type: 'open-details', childId, reason, at: new Date().toISOString() }); setReason(''); }
  return <section className={desk.panel} aria-label="Protected child details"><h2>Protected child details</h2><p>Give a reason for every opening. Only one child is shown at a time. This demonstration does not implement real access security.</p>
    <form className={styles.form} onSubmit={open}><label>Child<select data-testid="details-child" value={childId} onChange={event => { setChildId(event.target.value); setReason(''); dispatch({ type: 'close-details' }); }} required><option value="">Choose child</option>{state.roster.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label><label>Reason for access<input data-testid="details-reason" value={reason} onChange={event => setReason(event.target.value)} maxLength={500} required /></label><button data-testid="open-child-details" disabled={!childId || !reason.trim()}>Open details with reason</button></form>
    {child && <div className={styles.protected} data-testid="protected-child-details"><h3>{child.name}</h3><dl className={desk.record}><dt>Age</dt><dd>{child.age}</dd><dt>Other names</dt><dd>{child.otherNames.join(', ') || 'None supplied'}</dd><dt>Lesson day / group</dt><dd>{child.lessonDay} · {child.group}</dd><dt>Bib number</dt><dd>{child.bib ?? 'Not recorded'}</dd><dt>Authorized adults</dt><dd>{authorizedAdults(child.id, child.lessonDay).map(adult => adult.name).join(', ') || 'None valid for this lesson day'}</dd>{Object.entries(requiredFields).map(([key, label]) => <div className={styles.detailRow} key={key}><dt>{label}</dt><dd>{fields.includes(key as keyof typeof requiredFields) ? 'Required answer missing in synthetic checklist' : 'Marked answered in synthetic checklist; value not supplied'}</dd></div>)}</dl><p>Actual emergency contacts, mailing address and medical values are not supplied by the shared fixtures. No values have been invented.</p><button data-testid="close-child-details" onClick={() => dispatch({ type: 'close-details' })}>Close details</button></div>}
    <h3>Temporary access log</h3><ul className={styles.list} data-testid="admin-access-log">{state.access.map((entry, index) => <li key={index} data-testid="admin-access-entry"><div data-testid={`original-access-${index}`}>{state.roster.find(row => row.id === entry.childId)?.name} ({entry.childId}) · {entry.staff} · <time dateTime={entry.at}>{timeLabel(entry.at)}</time><p>Reason: {entry.reason}</p></div><CorrectionEntries state={state} target={`access:${index}`} /></li>)}</ul>{!state.access.length && <p>No protected details opened in this session.</p>}
  </section>;
}

function Corrections({ state, day, dispatch }: StateProps & { day: string }) {
  const [target, setTarget] = useState('');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const releases = state.releases.map((record, index) => ({ record, index })).filter(({ record }) => record.lessonDay === day);
  const accessEntries = state.access.map((entry, index) => ({ entry, index })).filter(({ entry }) => state.roster.some(child => child.id === entry.childId && child.lessonDay === day));
  return <section className={desk.panel} aria-label="Pickup records and corrections"><h2>Pickup records and corrections</h2><p>Add a reasoned correction beside a pickup record or access entry. There are no controls to edit or delete the originals.</p>
    {releases.map(({ record, index }) => <div className={styles.group} key={index}><div data-testid={`original-release-${record.childId}`}><strong>{state.roster.find(child => child.id === record.childId)?.name} · Released to {record.adultName}</strong><p>{timeLabel(record.releasedAt)} · {record.staff} · {record.source} · ID check confirmed</p></div><CorrectionEntries state={state} target={`pickup:${index}`} /></div>)}
    {!releases.length && <p>No pickup records for this lesson day.</p>}
    <form className={styles.form} onSubmit={event => { event.preventDefault(); dispatch({ type: 'correct', target, note, reason, at: new Date().toISOString() }); setNote(''); setReason(''); }}><label>Original record<select data-testid="correction-target" value={target} onChange={event => setTarget(event.target.value)} required><option value="">Choose record</option>{releases.map(({ record, index }) => <option key={`pickup:${index}`} value={`pickup:${index}`}>Pickup · {state.roster.find(child => child.id === record.childId)?.name} · {record.adultName}</option>)}{accessEntries.map(({ entry, index }) => <option key={`access:${index}`} value={`access:${index}`}>Access · {entry.childId} · {entry.reason}</option>)}</select></label><label>Correction<textarea data-testid="correction-note" value={note} onChange={event => setNote(event.target.value)} maxLength={1000} required /></label><label>Reason<textarea data-testid="correction-reason" value={reason} onChange={event => setReason(event.target.value)} maxLength={500} required /></label><button data-testid="add-correction" disabled={!target || !note.trim() || !reason.trim()}>Add correction</button></form>
  </section>;
}

function CorrectionEntries({ state, target }: { state: AdminState; target: string }) {
  return state.corrections.filter(entry => entry.target === target).map((entry, index) => <div className={styles.correction} key={index} data-testid="admin-correction"><strong>Added correction</strong><p>{entry.note}</p><p>Reason: {entry.reason}</p><p>{entry.staff} · <time dateTime={entry.at}>{timeLabel(entry.at)}</time></p></div>);
}
