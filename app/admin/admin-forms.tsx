'use client';

import { useActionState } from 'react';
import { addCorrectionAction, assignChildAction, assignInstructorAction, completeNoticeAction, type AdminFormState } from './actions';
import desk from '../desk/roster.module.css';
import styles from './dashboard.module.css';

type Option = { id: string; label: string };

function Feedback({ state, testId }: { state: AdminFormState; testId: string }) {
  if (!state) return null;
  return state.ok
    ? <p role="status" className={desk.notice} data-testid={testId}>{state.message}</p>
    : <p role="alert" className={desk.blocked} data-testid={testId}>{state.message}</p>;
}

const FieldError = ({ state, name, testId }: { state: AdminFormState; name: string; testId: string }) =>
  state && !state.ok && state.fields?.[name] ? <span role="alert" className={desk.blocked} data-testid={testId}>{state.fields[name]}</span> : null;

export function GroupForms({ kids, groups, instructors }: { kids: Option[]; groups: Option[]; instructors: Option[] }) {
  const [moveState, move, moving] = useActionState(assignChildAction, null);
  const [leadState, lead, leading] = useActionState(assignInstructorAction, null);
  return <>
    <form action={move} className={styles.form} data-testid="assign-child-form">
      <label>Child<select name="childId" data-testid="assign-child-select">{kids.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
      <label>Move to group<select name="groupId" data-testid="assign-child-group">{groups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}</select></label>
      <button type="submit" disabled={moving} data-testid="assign-child-submit">{moving ? 'Saving…' : 'Move child'}</button>
    </form>
    <Feedback state={moveState} testId="assign-child-message" />
    <form action={lead} className={styles.form} data-testid="assign-instructor-form">
      <label>Group<select name="groupId" data-testid="assign-instructor-group">{groups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}</select></label>
      <label>Instructor<select name="instructorUserId" data-testid="assign-instructor-select">{instructors.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}</select><FieldError state={leadState} name="instructorUserId" testId="assign-instructor-error" /></label>
      <button type="submit" disabled={leading} data-testid="assign-instructor-submit">{leading ? 'Saving…' : 'Set instructor'}</button>
    </form>
    <Feedback state={leadState} testId="assign-instructor-message" />
  </>;
}

export function CorrectionForm({ pickupLogId }: { pickupLogId: string }) {
  const [state, run, pending] = useActionState(addCorrectionAction.bind(null, pickupLogId), null);
  return <form action={run} data-testid={`correction-form-${pickupLogId}`}>
    <div className={styles.form}>
      <label>Reason (required)<input name="reason" maxLength={500} data-testid={`correction-reason-${pickupLogId}`} /><FieldError state={state} name="reason" testId={`correction-reason-error-${pickupLogId}`} /></label>
      <label>Correction (required)<textarea name="note" maxLength={2000} data-testid={`correction-note-${pickupLogId}`} /><FieldError state={state} name="note" testId={`correction-note-error-${pickupLogId}`} /></label>
      <button type="submit" disabled={pending} data-testid={`correction-submit-${pickupLogId}`}>{pending ? 'Saving…' : 'Add correction'}</button>
    </div>
    <Feedback state={state} testId={`correction-message-${pickupLogId}`} />
  </form>;
}

export function NoticeDoneForm({ taskId }: { taskId: string }) {
  const [state, run, pending] = useActionState(completeNoticeAction.bind(null, taskId), null);
  return <form action={run}>
    <button type="submit" disabled={pending} data-testid={`notice-done-${taskId}`}>{pending ? 'Saving…' : 'Mark notice as mailed'}</button>
    <Feedback state={state} testId={`notice-done-message-${taskId}`} />
  </form>;
}
