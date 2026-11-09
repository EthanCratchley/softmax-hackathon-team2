'use client';

import { useActionState, useMemo, useState } from 'react';
import { saveParentProfile } from '@/app/parent/actions';
import type { ChildProfile, ChildProfileChanges, Medication } from '@/lib/domain/types';

type Answer = 'none' | 'items';
type AdultInput = { id?: string; name: string; relationship: string; phone: string; isActive: boolean };
type SaveState = { ok: boolean; message: string; fields: Record<string, string> };
const splitItems = (value: string) => value.split(',').map((part) => part.trim()).filter(Boolean);

export function ParentProfileForm({ profile, lessonDate }: { profile: ChildProfile; lessonDate: string }) {
  const [allergyAnswer, setAllergyAnswer] = useState<Answer>(profile.medical.allergies === 'none' ? 'none' : 'items');
  const [allergies, setAllergies] = useState(Array.isArray(profile.medical.allergies) ? profile.medical.allergies.join(', ') : '');
  const [conditionAnswer, setConditionAnswer] = useState<Answer>(profile.medical.conditions === 'none' ? 'none' : 'items');
  const [conditions, setConditions] = useState(Array.isArray(profile.medical.conditions) ? profile.medical.conditions.join(', ') : '');
  const [medicationAnswer, setMedicationAnswer] = useState<Answer>(profile.medical.medications === 'none' ? 'none' : 'items');
  const [medications, setMedications] = useState<Medication[]>(Array.isArray(profile.medical.medications) ? profile.medical.medications.map((m) => ({ ...m })) : [{ name: '', location: '', heldAtDesk: false }]);
  const [contacts, setContacts] = useState([1, 2].map((priority) => {
    const contact = profile.emergencyContacts.find((item) => item.priority === priority);
    return { name: contact?.name ?? '', relationship: contact?.relationship ?? '', phone: contact?.phone ?? '' };
  }));
  const [adults, setAdults] = useState<AdultInput[]>(profile.authorizedAdults.map(({ id, name, relationship, phone, isActive }) => ({ id, name, relationship, phone: phone ?? '', isActive })));
  const [newAdult, setNewAdult] = useState<AdultInput>({ name: '', relationship: '', phone: '', isActive: true });
  const [instructions, setInstructions] = useState(profile.medical.safetyInstructions);
  const [mailingAddress, setMailingAddress] = useState(profile.child.mailingAddress ?? '');
  const [typedName, setTypedName] = useState(profile.consent?.typedName ?? '');
  const [photoConsent, setPhotoConsent] = useState(profile.consent?.photoConsent ?? false);
  const [consentGiven, setConsentGiven] = useState(Boolean(profile.consent));
  const [clothingToday, setClothingToday] = useState(profile.clothing.find((item) => item.lessonDate === lessonDate)?.description ?? '');
  const [state, action, pending] = useActionState<SaveState, FormData>(saveParentProfile.bind(null, profile.child.id), { ok: false, message: '', fields: {} });

  const changes = useMemo<ChildProfileChanges>(() => ({
    allergies: allergyAnswer === 'none' ? 'none' : splitItems(allergies),
    conditions: conditionAnswer === 'none' ? 'none' : splitItems(conditions),
    medications: medicationAnswer === 'none' ? 'none' : medications.filter((m) => m.name.trim() || m.location.trim()).map((m) => ({ ...m, name: m.name.trim(), location: m.location.trim() })),
    safetyInstructions: instructions,
    emergencyContacts: contacts.map((contact, i) => ({ ...contact, priority: (i + 1) as 1 | 2 })),
    authorizedAdults: [...adults, ...(newAdult.name.trim() || newAdult.relationship.trim() || newAdult.phone.trim() ? [newAdult] : [])],
    mailingAddress,
    clothingToday: { lessonDate, description: clothingToday },
    ...(!profile.consent && consentGiven ? { consent: { typedName, photoConsent } } : {}),
  }), [profile.consent, allergyAnswer, allergies, conditionAnswer, conditions, medicationAnswer, medications, instructions, contacts, adults, newAdult, mailingAddress, clothingToday, consentGiven, typedName, photoConsent]);

  const missing = new Set(profile.completion.missing);
  const medicalMissing = (['allergies', 'conditions', 'medications'] as const).some((key) => missing.has(key));
  const contactsMissing = missing.has('emergencyContacts') || missing.has('pickupAdult');
  const consentMissing = missing.has('consent') || missing.has('mailingAddress');
  const firstIncomplete = medicalMissing ? 'medical' : contactsMissing ? 'contacts' : consentMissing ? 'consent' : null;
  const fieldError = (key: string) => state.fields[key] ? <span className="field-error">{state.fields[key]}</span> : null;
  return <form action={action} className="stack parent-form" data-testid="parent-profile-form">
    <details className="parent-section" data-testid="section-medical" open={firstIncomplete === 'medical' || Boolean(state.fields.allergies || state.fields.conditions || state.fields.medications)}>
      <summary><span className="section-heading"><strong>Medical information</strong><span>Allergies, conditions, and medication</span></span></summary>
      <div className="parent-section-body"><p className="muted section-hint">For each category, choose “None” when there is nothing to report. Leaving it blank keeps the profile incomplete.</p>
      <MedicalText label="Allergies" answer={allergyAnswer} setAnswer={setAllergyAnswer} value={allergies} setValue={setAllergies} testId="allergies" />{fieldError('allergies')}
      <MedicalText label="Medical conditions" answer={conditionAnswer} setAnswer={setConditionAnswer} value={conditions} setValue={setConditions} testId="conditions" />{fieldError('conditions')}
      <fieldset className="form-section"><legend>Medications and where they are kept</legend><AnswerChoice name="medication-answer" value={medicationAnswer} setValue={setMedicationAnswer} />
        {medicationAnswer === 'items' && <div className="stack">{medications.map((medication, i) => <div className="subcard" key={i}>
          <label className="field">Medication name<input value={medication.name} onChange={(e) => setMedications((list) => list.map((m, j) => j === i ? { ...m, name: e.target.value } : m))} /></label>
          <label className="field">Where is it kept?<input value={medication.location} onChange={(e) => setMedications((list) => list.map((m, j) => j === i ? { ...m, location: e.target.value } : m))} /></label>
          <label className="check-field"><input type="checkbox" checked={medication.heldAtDesk} onChange={(e) => setMedications((list) => list.map((m, j) => j === i ? { ...m, heldAtDesk: e.target.checked } : m))} /> The ski school desk holds this medication</label>
          {medications.length > 1 && <button type="button" className="button ghost" onClick={() => setMedications((list) => list.filter((_, j) => j !== i))}>Remove medication</button>}
          {fieldError(`medications.${i}.name`)}{fieldError(`medications.${i}.location`)}
        </div>)}<button type="button" className="button" onClick={() => setMedications((list) => [...list, { name: '', location: '', heldAtDesk: false }])}>Add medication</button></div>}{fieldError('medications')}
      </fieldset>
      <label className="field">Instructions for staff<textarea rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Optional: what staff should do" /></label>
      </div>
    </details>

    <details className="parent-section" data-testid="section-contacts" open={firstIncomplete === 'contacts' || Boolean(Object.keys(state.fields).some((key) => key.startsWith('emergencyContacts.') || key.startsWith('authorizedAdults.')))}>
      <summary><span className="section-heading"><strong>Contacts and pick-up adults</strong><span>Emergency contacts and authorized adults</span></span></summary>
      <div className="parent-section-body"><h2 className="subsection-title">Emergency contacts</h2><p className="muted section-hint">Provide two people we can reach. Phone numbers need 10 digits.</p>{contacts.map((contact, i) => <div className="subcard" key={i}><h3>Contact {i + 1}</h3>
      <label className="field">Full name<input value={contact.name} onChange={(e) => setContacts((list) => list.map((c, j) => j === i ? { ...c, name: e.target.value } : c))} autoComplete="name" /></label>{fieldError(`emergencyContacts.${i}.name`)}
      <label className="field">Relationship<input value={contact.relationship} onChange={(e) => setContacts((list) => list.map((c, j) => j === i ? { ...c, relationship: e.target.value } : c))} /></label>{fieldError(`emergencyContacts.${i}.relationship`)}
      <label className="field">Phone<input type="tel" inputMode="tel" autoComplete="tel" value={contact.phone} onChange={(e) => setContacts((list) => list.map((c, j) => j === i ? { ...c, phone: e.target.value } : c))} placeholder="604-555-0101" /></label>{fieldError(`emergencyContacts.${i}.phone`)}</div>)}{fieldError('emergencyContacts')}
      <h2 className="subsection-title">Authorized pick-up adults</h2><p className="muted section-hint">Only active adults on this list can pick up your child. Staff will check photo ID.</p>{adults.map((adult, i) => <div className="subcard" key={adult.id ?? i}>
        <h3>{adult.name || `Pick-up adult ${i + 1}`}</h3><label className="field">Full name<input value={adult.name} onChange={(e) => setAdults((list) => list.map((a, j) => j === i ? { ...a, name: e.target.value } : a))} /></label>{fieldError(`authorizedAdults.${i}.name`)}
        <label className="field">Relationship<input value={adult.relationship} onChange={(e) => setAdults((list) => list.map((a, j) => j === i ? { ...a, relationship: e.target.value } : a))} /></label>{fieldError(`authorizedAdults.${i}.relationship`)}
        <label className="field">Phone (optional)<input type="tel" inputMode="tel" value={adult.phone} onChange={(e) => setAdults((list) => list.map((a, j) => j === i ? { ...a, phone: e.target.value } : a))} placeholder="604-555-0101" /></label>{fieldError(`authorizedAdults.${i}.phone`)}
        <label className="check-field"><input type="checkbox" checked={adult.isActive} onChange={(e) => setAdults((list) => list.map((a, j) => j === i ? { ...a, isActive: e.target.checked } : a))} /> Authorized to pick up</label>
      </div>)}
      <div className="subcard add-adult"><h3>Add a pick-up adult</h3><label className="field">Full name<input value={newAdult.name} onChange={(e) => setNewAdult((a) => ({ ...a, name: e.target.value }))} /></label><label className="field">Relationship<input value={newAdult.relationship} onChange={(e) => setNewAdult((a) => ({ ...a, relationship: e.target.value }))} /></label><label className="field">Phone (optional)<input type="tel" inputMode="tel" value={newAdult.phone} onChange={(e) => setNewAdult((a) => ({ ...a, phone: e.target.value }))} /></label></div>
      </div>
    </details>

    <details className="parent-section" data-testid="section-lesson">
      <summary><span className="section-heading"><strong>Lesson-day details</strong><span>Clothing and equipment</span></span><span className="section-optional">Optional</span></summary>
      <div className="parent-section-body"><h2 className="subsection-title">What {profile.child.firstName} is wearing</h2><p className="muted section-hint">For the lesson on {new Date(`${lessonDate}T12:00:00`).toLocaleDateString('en-CA', { dateStyle: 'full', timeZone: 'America/Vancouver' })}.</p>
      <label className="field">Jacket, helmet, and equipment<textarea rows={2} value={clothingToday} onChange={(e) => setClothingToday(e.target.value)} placeholder="For example: red jacket, blue helmet" /></label>{fieldError('clothingToday')}
      </div>
    </details>

    <details className="parent-section" data-testid="section-consent" open={firstIncomplete === 'consent' || Boolean(state.fields.consent || state.fields['consent.typedName'] || state.fields.mailingAddress)}>
      <summary><span className="section-heading"><strong>Address and consent</strong><span>Mailing address and program permissions</span></span></summary>
      <div className="parent-section-body">
      <label className="field">Mailing address<input value={mailingAddress} onChange={(e) => setMailingAddress(e.target.value)} autoComplete="street-address" /></label>{fieldError('mailingAddress')}<p className="small muted section-hint">Used for required follow-up notices. Only authorized administrators can see it.</p>
      {profile.consent ? <div className="consent-record" role="status"><p className="small muted">Consent recorded on {new Date(profile.consent.consentedAt).toLocaleDateString('en-CA', { timeZone: 'America/Vancouver' })}.</p><p className="small muted">Photo consent: {profile.consent.photoConsent ? 'Granted' : 'Not granted'}.</p></div> : <label className="check-field"><input type="checkbox" checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)} /> I consent to Kestrel Kids using this information for child safety and program operations.</label>}{fieldError('consent')}
      {consentGiven && !profile.consent && <><label className="field">Type your full name<input value={typedName} onChange={(e) => setTypedName(e.target.value)} autoComplete="name" /></label>{fieldError('consent.typedName')}<label className="check-field"><input type="checkbox" checked={photoConsent} onChange={(e) => setPhotoConsent(e.target.checked)} /> I allow Kestrel Kids to use photos of my child</label></>}
      </div>
    </details>
    <input type="hidden" name="profile" value={JSON.stringify(changes)} />
    {state.message && !state.ok && <div className="alert danger" role="alert" data-testid="save-error">{state.message}</div>}
    {state.ok && <div className="alert ok" role="status">{state.message}</div>}
    <div className="form-actions"><button className="button primary save-button" type="submit" disabled={pending} data-testid="save-profile">{pending ? 'Saving…' : 'Save changes'}</button></div>
  </form>;
}

function AnswerChoice({ name, value, setValue }: { name: string; value: Answer; setValue: (v: Answer) => void }) {
  return <div className="choice-row"><label className="answer-option"><input type="radio" name={name} checked={value === 'none'} onChange={() => setValue('none')} /> None</label><label className="answer-option"><input type="radio" name={name} checked={value === 'items'} onChange={() => setValue('items')} /> Add details</label></div>;
}
function MedicalText({ label, answer, setAnswer, value, setValue, testId }: { label: string; answer: Answer; setAnswer: (v: Answer) => void; value: string; setValue: (v: string) => void; testId: string }) {
  return <fieldset className="form-section" data-testid={testId}><legend>{label}</legend><AnswerChoice name={`${testId}-answer`} value={answer} setValue={setAnswer} />{answer === 'items' && <label className="field">List {label.toLowerCase()}, separated by commas<textarea rows={2} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Add details" /></label>}</fieldset>;
}
