'use client';
import { useActionState, type ReactNode } from 'react';
import s from './workspace.module.css';

export type FormState = { error: string; fields?: Record<string, string> } | null;

/** A form posting to a server action; shows the action's error message (success redirects). */
export function ActionForm(props: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  testId: string;
  className?: string;
  children: ReactNode;
}) {
  const [state, run, pending] = useActionState(props.action, null);
  return (
    <form action={run} className={props.className} data-testid={props.testId}>
      {state?.error && (
        <p role="alert" className={s.error} data-testid={`${props.testId}-error`}>
          {state.error}
        </p>
      )}
      <fieldset disabled={pending} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: 'contents' }}>
        {props.children}
      </fieldset>
    </form>
  );
}
