import type { ReactNode } from 'react';
import s from './workspace.module.css';

/** Page frame for the instructor and patrol screens. `day` adds a lesson-day picker (plain GET form). */
export function Shell(props: { eyebrow: string; title: string; lead: string; day?: string; testId: string; children: ReactNode }) {
  return (
    <main className={s.command} data-testid={props.testId}>
      <section className={s.hero}>
        <div>
          <p className={s.eyebrow}>{props.eyebrow}</p>
          <h1>{props.title}</h1>
          <p>{props.lead}</p>
        </div>
        {props.day && (
          <form className={s.dayForm}>
            <label>
              Lesson day
              <input type="date" name="day" defaultValue={props.day} data-testid="lesson-day" />
            </label>
            <button type="submit" className={s.actionQuiet} data-testid="lesson-day-go">
              Show
            </button>
          </form>
        )}
      </section>
      <p className={s.radioNotice}>
        <span aria-hidden="true">↗</span> Use radios and resort procedures when urgent help is needed. Fictional demo information only.
      </p>
      {props.children}
      <footer className={s.footer}>People contact families and rescuers. The app records what happened; it never calls them automatically.</footer>
    </main>
  );
}
