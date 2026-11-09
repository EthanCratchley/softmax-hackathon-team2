'use client';

import type { MissingField } from '@/lib/domain/types';

const SECTION_FOR: Partial<Record<MissingField, { section: string; label: string }>> = {
  allergies: { section: 'section-medical', label: 'Allergies' },
  conditions: { section: 'section-medical', label: 'Medical conditions' },
  medications: { section: 'section-medical', label: 'Medications' },
  emergencyContacts: { section: 'section-contacts', label: 'Two emergency contacts' },
  pickupAdult: { section: 'section-contacts', label: 'An authorized pick-up adult' },
  consent: { section: 'section-consent', label: 'Your consent' },
  mailingAddress: { section: 'section-consent', label: 'A mailing address' },
};

export function ProfileChecklist({ missing }: { missing: MissingField[] }) {
  const items = missing.flatMap((field) => SECTION_FOR[field] ? [{ field, ...SECTION_FOR[field]! }] : []);
  const total = 7;
  const done = Math.max(0, total - items.length);

  function goTo(testId: string) {
    const section = document.querySelector<HTMLDetailsElement>(`[data-testid="${testId}"]`);
    if (!section) return;
    section.open = true;
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    section.querySelector<HTMLElement>('summary')?.focus({ preventScroll: true });
  }

  if (items.length === 0) return null;
  return <section className="checklist" aria-labelledby="checklist-title" data-testid="profile-progress">
    <div className="checklist-head"><div><h2 id="checklist-title">To Complete This Profile</h2><p className="checklist-count">{done} of {total} complete</p></div>
      <progress className="checklist-bar" value={done} max={total}>{done} of {total}</progress></div>
    <ol className="checklist-items">{items.map(({ field, section, label }, index) => <li key={field} data-testid={`missing-${field}`}><button type="button" className="checklist-item" onClick={() => goTo(section)}>
      <span className="checklist-number" aria-hidden="true">{index + 1}</span><span className="checklist-label">{label}</span><span className="checklist-go" aria-hidden="true" />
    </button></li>)}</ol>
    <p className="checklist-foot">Choose an item to open its section. Save whenever you like.</p>
  </section>;
}
