'use client';

import { useActionState } from 'react';
import type { MedicalAnswer, Medication } from '@/lib/domain/types';
import { openDetailsAction } from '../../actions';
import desk from '../../../desk/roster.module.css';
import styles from '../../dashboard.module.css';

const answer = (value: MedicalAnswer<string>) => value === null ? 'Not answered yet' : value === 'none' ? 'None' : value.join(', ') || 'Not answered yet';
const medications = (value: MedicalAnswer<Medication>) => value === null ? 'Not answered yet' : value === 'none' ? 'None' : value.map(m => `${m.name} (${m.location}${m.heldAtDesk ? ', held at the desk' : ''})`).join('; ') || 'Not answered yet';

export default function DetailsPanel({ childId }: { childId: string }) {
  const [state, run, pending] = useActionState(openDetailsAction.bind(null, childId), null);
  if (state?.ok) {
    const { child, medical, emergencyContacts, authorizedAdults, consent } = state.profile;
    return <section className={`${desk.panel} ${styles.protected}`} data-testid="child-details" aria-label="Full child profile">
      <h2>{child.firstName} {child.lastName}</h2>
      <p className={desk.notice} data-testid="details-logged">This opening was logged with your reason.</p>
      <dl className={desk.record}>
        <dt>Other names</dt><dd>{child.otherNames.join(', ') || 'None'}</dd>
        <dt>Birth date</dt><dd>{child.birthDate}</dd>
        <dt>Ski level</dt><dd>{child.skiLevel}</dd>
        <dt>Mailing address</dt><dd data-testid="details-address">{child.mailingAddress ?? 'Not given'}</dd>
        <dt>Allergies</dt><dd data-testid="details-allergies">{answer(medical.allergies)}</dd>
        <dt>Conditions</dt><dd data-testid="details-conditions">{answer(medical.conditions)}</dd>
        <dt>Medications</dt><dd data-testid="details-medications">{medications(medical.medications)}</dd>
        <dt>Safety instructions</dt><dd>{medical.safetyInstructions || 'None given'}</dd>
        <dt>Emergency contacts</dt><dd data-testid="details-contacts">{emergencyContacts.length ? emergencyContacts.map(c => <p key={c.id}>{c.priority}. {c.name} ({c.relationship}) · {c.phone}</p>) : 'None given'}</dd>
        <dt>Pickup adults</dt><dd data-testid="details-adults">{authorizedAdults.length ? authorizedAdults.map(a => <p key={a.id}>{a.name} ({a.relationship}){a.phone ? ` · ${a.phone}` : ''}{a.isActive ? '' : ' · inactive'}</p>) : 'None given'}</dd>
        <dt>Consent</dt><dd data-testid="details-consent">{consent ? `Signed by ${consent.typedName} · photos ${consent.photoConsent ? 'allowed' : 'not allowed'}` : 'Not signed'}</dd>
      </dl>
    </section>;
  }
  return <section className={desk.panel} aria-label="Reason for access">
    <form action={run} data-testid="details-reason-form">
      {state && !state.ok && !state.fields && <p role="alert" className={desk.blocked} data-testid="details-error">{state.message}</p>}
      <label>Reason for opening (required)<textarea name="reason" maxLength={500} data-testid="details-reason" />{state && !state.ok && state.fields?.reason && <span role="alert" className={desk.blocked} data-testid="details-reason-error">{state.fields.reason}</span>}</label>
      <div className={styles.form}><button type="submit" disabled={pending} data-testid="details-open">{pending ? 'Opening…' : 'Open details'}</button></div>
    </form>
  </section>;
}
