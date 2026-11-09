'use client';
import { useActionState } from 'react';
import type { FormState } from './ActionForm';
import s from './workspace.module.css';

const FIELDS = [
  ['lastSeenLocation', 'Last seen location', 'e.g. Top of Easy Street lift'],
  ['clothingDescription', 'Clothing now', 'Jacket, helmet, pants colours'],
  ['equipmentDescription', 'Equipment', 'Skis or snowboard, colour'],
] as const;

export function ReportForm(props: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  childName: string;
  defaultLastSeen: string;
}) {
  const [state, run, pending] = useActionState(props.action, null);
  const err = (key: string) =>
    state?.fields?.[key] && (
      <span className={s.fieldError} data-testid={`error-${key}`}>
        {state.fields[key]}
      </span>
    );
  return (
    <form action={run} className={s.form} data-testid="missing-report-form">
      <h2>Report {props.childName} missing</h2>
      <p className={s.warning}>Radio patrol now. This report does not call anyone.</p>
      {state?.error && (
        <p role="alert" className={s.error} data-testid="report-error">
          {state.error}
        </p>
      )}
      <fieldset disabled={pending}>
        <label className={s.field}>
          Last seen at (resort time)
          <input type="datetime-local" name="lastSeenAt" defaultValue={props.defaultLastSeen} required data-testid="last-seen-at" />
          {err('lastSeenAt')}
        </label>
        {FIELDS.map(([key, label, hint]) => (
          <label key={key} className={s.field}>
            {label}
            <input name={key} placeholder={hint} required={key === 'lastSeenLocation'} data-testid={key} />
            {err(key)}
          </label>
        ))}
        <label className={s.field}>
          Notes
          <textarea name="notes" rows={3} data-testid="notes" />
        </label>
        <button type="submit" className={`${s.action} ${s.submitDanger}`} data-testid="submit-report">
          {pending ? 'Sending…' : 'Report missing'}
        </button>
      </fieldset>
    </form>
  );
}
