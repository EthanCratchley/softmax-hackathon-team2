// In-memory implementation of the service contract over the synthetic seed.
// Authorization here is the real policy: the Piezas implementation must keep
// identical behaviour, and tests/unit/services.spec.ts holds both to it.
import { createDemoState, type DemoState } from '../fixtures';
import {
  ageOn,
  computeCompletion,
  endOfLessonDay,
  escalationTime,
  isValidPhone,
  matchesName,
  MAX_GROUP_SIZE,
  safetyAlerts,
} from '../domain/rules';
import type {
  AuditAction,
  Child,
  ChildProfile,
  ChildProfileChanges,
  DeskPickupState,
  DeskRosterEntry,
  Id,
  Incident,
  IncidentListItem,
  LessonDate,
  MedicalAnswer,
  Role,
  VerifiedUser,
} from '../domain/types';
import type { KestrelServices, Result, ServiceError } from './contract';
import { DEMO_LESSON_DATE } from '../fixtures';

const ok = <T>(data: T): Result<T> => ({ ok: true, data });
const fail = (code: ServiceError['code'], message: string, fields?: Record<string, string>): Result<never> => ({
  ok: false,
  error: fields ? { code, message, fields } : { code, message },
});
const NOT_FOUND = fail('not_found', 'Not found.');
const FORBIDDEN = fail('forbidden', 'You do not have access to this.');

export function createMockServices(
  state: DemoState,
  now: () => Date = () => new Date(),
): KestrelServices {
  const stamp = () => now().toISOString();
  const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  const defaultGroups = new Map(createDemoState().groups.map((group) => [group.id, group]));

  const audit = (user: VerifiedUser, action: AuditAction, entityType: string, entityId: Id, detailsSummary: string) => {
    state.audit.push({ id: newId('aud'), actorUserId: user.id, action, entityType, entityId, occurredAt: stamp(), detailsSummary });
  };

  const deny = (user: VerifiedUser, entityType: string, entityId: Id, what: string, result: Result<never> = FORBIDDEN) => {
    audit(user, 'access_denied', entityType, entityId, `${user.role} denied: ${what}`);
    return result;
  };

  const is = (user: VerifiedUser, ...roles: Role[]) => roles.includes(user.role);
  const findChild = (id: Id) => state.children.find((c) => c.id === id);
  const groupOf = (child: Child) => state.groups.find((g) => g.id === child.groupId) ?? null;
  const ownsChild = (user: VerifiedUser, child: Child) => user.role === 'parent' && child.parentUserIds.includes(user.id);
  const instructorAssigned = (user: VerifiedUser, child: Child, date: LessonDate) => {
    const group = groupOf(child);
    return user.role === 'instructor' && group?.instructorUserId === user.id && group.day === date;
  };
  const attendanceFor = (childId: Id, date: LessonDate) =>
    state.attendance.find((a) => a.childId === childId && a.lessonDate === date);
  const medicalFor = (childId: Id) => state.medical.find((m) => m.childId === childId)!;
  const incidentsFor = (childId: Id, date: LessonDate) =>
    state.incidents.filter((i) => i.childId === childId && i.lessonDate === date);

  const profileOf = (child: Child): ChildProfile => {
    const parts = {
      child,
      medical: medicalFor(child.id),
      emergencyContacts: state.contacts.filter((c) => c.childId === child.id).sort((a, b) => a.priority - b.priority),
      authorizedAdults: state.adults.filter((a) => a.childId === child.id),
      consent: state.consents.find((c) => c.childId === child.id) ?? null,
    };
    const clothing = state.attendance
      .filter((a) => a.childId === child.id)
      .map((a) => ({ lessonDate: a.lessonDate, description: a.clothingToday }));
    return structuredClone({ ...parts, clothing, completion: computeCompletion(parts) });
  };

  const deskEntry = (child: Child, date: LessonDate): DeskRosterEntry | null => {
    const att = attendanceFor(child.id, date);
    if (!att) return null;
    const incidents = incidentsFor(child.id, date);
    const pickup = state.pickups.find((p) => p.childId === child.id && p.lessonDate === date);
    const state_: DeskPickupState = incidents.some((i) => i.status === 'Open')
      ? { kind: 'OpenIncident' }
      : pickup
        ? { kind: 'Released', adultName: pickup.adultNameSnapshot, releasedAt: pickup.releasedAt, incidentToday: incidents.length > 0 }
        : incidents.length
          ? { kind: 'IncidentToday' }
          : { kind: att.status === 'CheckedIn' ? 'CheckedIn' : 'Expected' };
    return {
      childId: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      otherNames: [...child.otherNames],
      groupNumber: groupOf(child)?.groupNumber ?? null,
      status: att.status,
      bibNumber: att.bibNumber,
      checkedInAt: att.checkedInAt,
      needsInformation: profileOf(child).completion.status === 'NeedsInformation',
      pickup: state_,
    };
  };

  const incidentItem = (incident: Incident): IncidentListItem => {
    const child = findChild(incident.childId)!;
    return {
      id: incident.id,
      childId: child.id,
      childName: `${child.firstName} ${child.lastName}`,
      groupNumber: groupOf(child)?.groupNumber ?? null,
      status: incident.status,
      lastSeenAt: incident.lastSeenAt,
      lastSeenLocation: incident.lastSeenLocation,
      escalateAt: escalationTime(incident.lastSeenAt, incident.lessonDate),
    };
  };

  const validateList = (answer: MedicalAnswer<string> | undefined, key: string, errors: Record<string, string>) => {
    if (answer === undefined || answer === null || answer === 'none') return;
    if (!Array.isArray(answer) || answer.length === 0 || answer.some((v) => typeof v !== 'string' || !v.trim()))
      errors[key] = 'Enter each item, or choose "none".';
  };

  const validateChanges = (child: Child, changes: ChildProfileChanges): Record<string, string> => {
    const errors: Record<string, string> = {};
    validateList(changes.allergies, 'allergies', errors);
    validateList(changes.conditions, 'conditions', errors);
    const meds = changes.medications;
    if (Array.isArray(meds)) {
      if (meds.length === 0) errors.medications = 'Enter a medication, or choose "none".';
      meds.forEach((m, i) => {
        if (!m.name?.trim()) errors[`medications.${i}.name`] = 'Enter the medication name.';
        if (!m.location?.trim()) errors[`medications.${i}.location`] = 'Say where it is kept.';
      });
    } else if (meds !== undefined && meds !== null && meds !== 'none') errors.medications = 'Enter each medication, or choose "none".';
    if (changes.emergencyContacts) {
      if (changes.emergencyContacts.length > 2) errors.emergencyContacts = 'Enter up to two emergency contacts.';
      changes.emergencyContacts.forEach((c, i) => {
        if (!c.name?.trim()) errors[`emergencyContacts.${i}.name`] = 'Enter a name.';
        if (!c.relationship?.trim()) errors[`emergencyContacts.${i}.relationship`] = 'Enter the relationship.';
        if (!isValidPhone(c.phone ?? '')) errors[`emergencyContacts.${i}.phone`] = 'Enter a 10-digit phone number, e.g. 604-555-0101.';
      });
    }
    changes.authorizedAdults?.forEach((a, i) => {
      if (a.id && !state.adults.some((x) => x.id === a.id && x.childId === child.id)) errors[`authorizedAdults.${i}`] = 'Unknown adult.';
      if (!a.name?.trim()) errors[`authorizedAdults.${i}.name`] = 'Enter a name.';
      if (!a.relationship?.trim()) errors[`authorizedAdults.${i}.relationship`] = 'Enter the relationship.';
      if (a.phone && !isValidPhone(a.phone)) errors[`authorizedAdults.${i}.phone`] = 'Enter a 10-digit phone number, e.g. 604-555-0101.';
    });
    if (changes.consent && !changes.consent.typedName?.trim()) errors['consent.typedName'] = 'Type your full name to consent.';
    if (changes.mailingAddress !== undefined && !changes.mailingAddress.trim()) errors.mailingAddress = 'Enter a mailing address.';
    if (changes.clothingToday && !attendanceFor(child.id, changes.clothingToday.lessonDate))
      errors.clothingToday = 'This child has no lesson on that day.';
    return errors;
  };

  const trimList = <T>(answer: MedicalAnswer<T>, map: (v: T) => T): MedicalAnswer<T> =>
    Array.isArray(answer) ? answer.map(map) : answer;

  return {
    async getMyChildren(user) {
      if (!is(user, 'parent')) return FORBIDDEN;
      return ok(
        state.children
          .filter((c) => ownsChild(user, c))
          .map((c) => {
            const group = groupOf(c);
            const defaultGroup = c.groupId ? defaultGroups.get(c.groupId) : undefined;
            return ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            groupNumber: group?.groupNumber ?? null,
            skiLevel: group?.skiLevel || c.skiLevel || defaultGroup?.skiLevel || null,
            lessonDay: group ? group.day || defaultGroup?.day || DEMO_LESSON_DATE : null,
            completion: profileOf(c).completion,
            updatedAt: c.updatedAt,
          }); }),
      );
    },

    async getChildProfile(childId, user) {
      const child = findChild(childId);
      if (user.role === 'parent') return child && ownsChild(user, child) ? ok(profileOf(child)) : deny(user, 'Child', childId, 'profile', NOT_FOUND);
      return deny(user, 'Child', childId, 'full profile');
    },

    async updateChildProfile(childId, changes, user) {
      const child = findChild(childId);
      if (user.role !== 'parent') return deny(user, 'Child', childId, 'profile update');
      if (!child || !ownsChild(user, child)) return deny(user, 'Child', childId, 'profile update', NOT_FOUND);
      const errors = validateChanges(child, changes);
      if (Object.keys(errors).length) return fail('invalid', 'Please fix the highlighted fields.', errors);

      const at = stamp();
      const med = medicalFor(childId);
      const medicalChanged = (['allergies', 'conditions', 'medications', 'safetyInstructions'] as const).filter((k) => changes[k] !== undefined);
      if (changes.allergies !== undefined) med.allergies = trimList(changes.allergies, (v) => v.trim());
      if (changes.conditions !== undefined) med.conditions = trimList(changes.conditions, (v) => v.trim());
      if (changes.medications !== undefined)
        med.medications = trimList(changes.medications, (m) => ({ name: m.name.trim(), location: m.location.trim(), heldAtDesk: Boolean(m.heldAtDesk) }));
      if (changes.safetyInstructions !== undefined) med.safetyInstructions = changes.safetyInstructions.trim();
      if (medicalChanged.length) {
        med.updatedBy = user.id;
        med.updatedAt = at;
        audit(user, 'medical_updated', 'MedicalProfile', childId, `Updated ${medicalChanged.join(', ')}`);
      }

      if (changes.emergencyContacts) {
        state.contacts = state.contacts.filter((c) => c.childId !== childId);
        changes.emergencyContacts.forEach((c, i) =>
          state.contacts.push({ id: newId('ec'), childId, name: c.name.trim(), relationship: c.relationship.trim(), phone: c.phone.trim(), priority: (i + 1) as 1 | 2 }),
        );
        audit(user, 'contacts_updated', 'EmergencyContact', childId, `Set ${changes.emergencyContacts.length} emergency contact(s)`);
      }

      if (changes.authorizedAdults) {
        for (const a of changes.authorizedAdults) {
          const existing = a.id ? state.adults.find((x) => x.id === a.id) : undefined;
          const fields = { name: a.name.trim(), relationship: a.relationship.trim(), phone: a.phone?.trim() || null, isActive: a.isActive, updatedBy: user.id, updatedAt: at };
          if (existing) Object.assign(existing, fields);
          else state.adults.push({ id: newId('adl'), childId, ...fields });
        }
        audit(user, 'pickup_adults_updated', 'AuthorizedAdult', childId, `Updated ${changes.authorizedAdults.length} pickup adult(s)`);
      }

      if (changes.consent) {
        state.consents = state.consents.filter((c) => c.childId !== childId);
        state.consents.push({ childId, parentUserId: user.id, typedName: changes.consent.typedName.trim(), photoConsent: changes.consent.photoConsent, consentedAt: at });
        audit(user, 'consent_given', 'Consent', childId, `Consent given (photos: ${changes.consent.photoConsent ? 'yes' : 'no'})`);
      }
      if (changes.mailingAddress !== undefined) child.mailingAddress = changes.mailingAddress.trim();
      if (changes.clothingToday) {
        attendanceFor(childId, changes.clothingToday.lessonDate)!.clothingToday = changes.clothingToday.description.trim() || null;
      }
      child.updatedAt = at;
      return ok(profileOf(child));
    },

    async issueLessonPass(childId, input, user) {
      const child = findChild(childId);
      if (!child || !ownsChild(user, child)) return deny(user, 'LessonPass', childId, 'issue pass', NOT_FOUND);
      if (!attendanceFor(childId, input.lessonDate)) return fail('invalid', 'This child has no lesson on that day.');
      let adultId: string | null = null;
      let adultName: string | null = null;
      if (input.purpose === 'pickup') {
        const adult = state.adults.find((item) => item.id === input.adultId && item.childId === childId && item.isActive);
        if (!adult) return fail('invalid', 'Choose an active authorized pick-up adult.');
        adultId = adult.id;
        adultName = adult.name;
      } else if (input.adultId) return fail('invalid', 'A drop-off pass is not tied to an adult.');
      const existing = state.passes.find((pass) => pass.childId === childId && pass.lessonDate === input.lessonDate && pass.purpose === input.purpose && pass.adultId === adultId);
      if (existing) return ok(structuredClone(existing));
      const token = [...crypto.getRandomValues(new Uint8Array(32))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
      let shortCode = String(crypto.getRandomValues(new Uint32Array(1))[0] % 100_000_000).padStart(8, '0');
      while (state.passes.some((pass) => pass.lessonDate === input.lessonDate && pass.shortCode === shortCode)) {
        shortCode = String(crypto.getRandomValues(new Uint32Array(1))[0] % 100_000_000).padStart(8, '0');
      }
      const expires = endOfLessonDay(input.lessonDate);
      const pass = { id: newId('pss'), childId, lessonDate: input.lessonDate, purpose: input.purpose, adultId, adultName, token, shortCode, createdAt: stamp(), expiresAt: expires, redeemedAt: null, redeemedByStaffId: null, idChecked: false };
      state.passes.push(pass);
      audit(user, 'pass_issued', 'LessonPass', pass.id, `Issued ${input.purpose} pass`);
      return ok(structuredClone(pass));
    },

    async listLessonPasses(childId, lessonDate, user) {
      const child = findChild(childId);
      if (!child || !ownsChild(user, child)) return deny(user, 'LessonPass', childId, 'list passes', NOT_FOUND);
      return ok(structuredClone(state.passes.filter((pass) => pass.childId === childId && pass.lessonDate === lessonDate)));
    },

    async resolveLessonPass(rawValue, lessonDate, user) {
      if (!is(user, 'desk')) return deny(user, 'LessonPass', '', 'resolve pass');
      const attempts = state.passAttempts.find((item) => item.lessonDate === lessonDate);
      if (attempts?.lockedUntil && Date.parse(attempts.lockedUntil) > now().getTime()) return fail('blocked', 'Too many incorrect codes. Wait five minutes, then try again.');
      if (attempts?.lockedUntil && Date.parse(attempts.lockedUntil) <= now().getTime()) { attempts.count = 0; attempts.lockedUntil = null; }
      const value = rawValue.trim().replace(/^pss:/i, '');
      if (!value) return fail('invalid', 'Scan a pass or enter its 8-digit code.');
      const matches = state.passes.filter((pass) => pass.lessonDate === lessonDate && (pass.token === value || pass.shortCode === value));
      if (matches.length !== 1) {
        const row = attempts ?? { id: newId('pat'), lessonDate, count: 0, lockedUntil: null };
        row.count += 1;
        if (row.count >= 5) row.lockedUntil = new Date(now().getTime() + 5 * 60_000).toISOString();
        if (!attempts) state.passAttempts.push(row);
        audit(user, 'pass_lookup_failed', 'LessonPass', '', 'Pass lookup failed');
        return fail(matches.length ? 'blocked' : 'not_found', matches.length ? 'That number matches more than one pass. Scan the QR code.' : 'No pass matches that code for today.');
      }
      if (attempts) attempts.count = 0;
      const pass = matches[0];
      const child = findChild(pass.childId);
      if (!child) return NOT_FOUND;
      const adult = pass.adultId ? state.adults.find((item) => item.id === pass.adultId && item.childId === child.id && item.isActive) : null;
      const expired = Date.parse(pass.expiresAt) <= now().getTime();
      const openIncident = pass.purpose === 'pickup' && incidentsFor(child.id, lessonDate).some((incident) => incident.status === 'Open');
      const blockedReason = expired ? 'This pass has expired.' : pass.redeemedAt ? 'This pass has already been used once.' : pass.purpose === 'pickup' && !adult ? 'That adult is no longer on the active pickup list.' : openIncident ? 'Release blocked: call patrol.' : null;
      return ok({ passId: pass.id, childId: child.id, childFirstName: child.firstName, childLastName: child.lastName, groupNumber: groupOf(child)?.groupNumber ?? null, lessonDate, purpose: pass.purpose, adultName: adult?.name ?? pass.adultName, adultOnList: pass.purpose !== 'pickup' || Boolean(adult), expiresAt: pass.expiresAt, redeemedAt: pass.redeemedAt, canRedeem: !blockedReason, blockedReason });
    },

    async redeemLessonPass(passId, input, user) {
      if (!is(user, 'desk')) return deny(user, 'LessonPass', passId, 'redeem pass');
      const pass = state.passes.find((item) => item.id === passId);
      if (!pass) return NOT_FOUND;
      const child = findChild(pass.childId);
      const attendance = attendanceFor(pass.childId, pass.lessonDate);
      if (!child || !attendance) return NOT_FOUND;
      if (Date.parse(pass.expiresAt) <= now().getTime()) return fail('blocked', 'This pass has expired.');
      if (pass.redeemedAt) return fail('blocked', 'This pass has already been used once.');
      if (pass.purpose === 'dropoff') {
        if (attendance.status !== 'Expected') return fail('blocked', 'This child is already checked in or released.');
        if (!input.bibNumber?.trim()) return fail('invalid', 'Enter the child’s bib number.', { bibNumber: 'Enter the child’s bib number.' });
        Object.assign(attendance, { status: 'CheckedIn', bibNumber: input.bibNumber.trim(), checkedInAt: stamp(), checkedInBy: user.id });
        audit(user, 'child_checked_in', 'Attendance', attendance.id, 'Checked in using a lesson pass');
      } else {
        if (!input.idChecked) return fail('invalid', 'Confirm that you checked the adult’s photo ID.');
        if (attendance.status !== 'CheckedIn') return fail('blocked', 'The child must be checked in before pick-up.');
        if (incidentsFor(child.id, pass.lessonDate).some((incident) => incident.status === 'Open')) return fail('blocked', 'Release blocked: call patrol.');
        const adult = pass.adultId ? state.adults.find((item) => item.id === pass.adultId && item.childId === child.id && item.isActive) : null;
        if (!adult) return fail('blocked', 'That adult is no longer on the active pick-up list.');
        if (state.pickups.some((item) => item.childId === child.id && item.lessonDate === pass.lessonDate)) return fail('blocked', 'This child has already been picked up.');
        const pickup = { id: newId('pkp'), childId: child.id, lessonDate: pass.lessonDate, authorizedAdultId: adult.id, adultNameSnapshot: adult.name, verifiedByUserId: user.id, idChecked: true as const, releasedAt: stamp() };
        state.pickups.push(pickup);
        attendance.status = 'Released';
        audit(user, 'child_released', 'PickupLog', pickup.id, 'Released using a lesson pass after an ID check');
      }
      pass.redeemedAt = stamp();
      pass.redeemedByStaffId = user.id;
      pass.idChecked = input.idChecked;
      audit(user, 'pass_redeemed', 'LessonPass', pass.id, `Redeemed ${pass.purpose} pass`);
      return ok({ redeemedAt: pass.redeemedAt, adultName: pass.adultName });
    },

    async listParentActivity(childId, user) {
      const child = findChild(childId);
      if (!child || !ownsChild(user, child)) return deny(user, 'Child', childId, 'view activity', NOT_FOUND);
      const entries = [
        ...state.attendance.filter((item) => item.childId === childId && item.checkedInAt).map((item) => ({ id: item.id, kind: 'checked_in' as const, at: item.checkedInAt!, lessonDate: item.lessonDate })),
        ...state.pickups.filter((item) => item.childId === childId).map((item) => ({ id: item.id, kind: 'released' as const, at: item.releasedAt, lessonDate: item.lessonDate, adultName: item.adultNameSnapshot })),
      ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
      return ok(entries);
    },

    async getInstructorRoster(lessonDate, user) {
      if (!is(user, 'instructor')) return FORBIDDEN;
      return ok(
        state.groups
          .filter((g) => g.instructorUserId === user.id && g.day === lessonDate)
          .map((g) => ({
            groupId: g.id,
            groupNumber: g.groupNumber,
            skiLevel: g.skiLevel,
            children: state.children
              .filter((c) => c.groupId === g.id)
              .map((c) => ({
                childId: c.id,
                firstName: c.firstName,
                lastName: c.lastName,
                age: ageOn(c.birthDate, lessonDate),
                skiLevel: c.skiLevel,
                alerts: safetyAlerts(medicalFor(c.id)),
                hasOpenIncident: incidentsFor(c.id, lessonDate).some((i) => i.status === 'Open'),
              })),
          })),
      );
    },

    async getDeskRoster(lessonDate, user, query = '') {
      if (!is(user, 'desk')) return FORBIDDEN;
      const q = query.trim();
      return ok(
        state.children
          .filter((c) => matchesName(c, q) || String(groupOf(c)?.groupNumber ?? '') === q)
          .map((c) => deskEntry(c, lessonDate))
          .filter((e): e is DeskRosterEntry => e !== null),
      );
    },

    async getDeskPickupView(childId, lessonDate, user) {
      if (!is(user, 'desk')) return deny(user, 'Child', childId, 'desk pickup view');
      const child = findChild(childId);
      const entry = child && deskEntry(child, lessonDate);
      if (!child || !entry) return NOT_FOUND;
      const meds = medicalFor(childId).medications;
      return ok({
        entry,
        authorizedAdults: state.adults.filter((a) => a.childId === childId && a.isActive).map(({ id, name, relationship }) => ({ id, name, relationship })),
        deskHeldMedications: Array.isArray(meds) ? meds.filter((m) => m.heldAtDesk).map((m) => `Holds ${m.name} for this child`) : [],
      });
    },

    async checkInChild(childId, lessonDate, bibNumber, user) {
      if (!is(user, 'desk')) return deny(user, 'Attendance', childId, 'check-in');
      const child = findChild(childId);
      const att = attendanceFor(childId, lessonDate);
      if (!child || !att) return NOT_FOUND;
      if (!bibNumber.trim()) return fail('invalid', 'Enter the bib number.', { bibNumber: 'Enter the bib number.' });
      if (att.status !== 'Expected') return fail('blocked', `Already ${att.status === 'CheckedIn' ? 'checked in' : 'released'}.`);
      Object.assign(att, { status: 'CheckedIn', bibNumber: bibNumber.trim(), checkedInAt: stamp(), checkedInBy: user.id });
      audit(user, 'child_checked_in', 'Attendance', att.id, `Checked in with bib ${att.bibNumber}`);
      return ok(deskEntry(child, lessonDate)!);
    },

    async getAuthorizedAdults(childId, user) {
      if (!is(user, 'desk')) return deny(user, 'AuthorizedAdult', childId, 'pickup list');
      if (!findChild(childId)) return NOT_FOUND;
      return ok(state.adults.filter((a) => a.childId === childId && a.isActive).map(({ id, name, relationship }) => ({ id, name, relationship })));
    },

    async recordPickup(childId, authorizedAdultId, idChecked, lessonDate, user) {
      if (!is(user, 'desk')) return deny(user, 'PickupLog', childId, 'release');
      const child = findChild(childId);
      const att = attendanceFor(childId, lessonDate);
      if (!child || !att) return NOT_FOUND;
      const prior = state.pickups.find((p) => p.childId === childId && p.lessonDate === lessonDate);
      if (prior) return fail('blocked', `Already released to ${prior.adultNameSnapshot} at ${prior.releasedAt}. Ask an admin to review.`);
      if (incidentsFor(childId, lessonDate).some((i) => i.status === 'Open')) return fail('blocked', 'Release blocked: call patrol.');
      if (att.status !== 'CheckedIn') return fail('blocked', 'Child is not checked in.');
      const adult = state.adults.find((a) => a.id === authorizedAdultId && a.childId === childId && a.isActive);
      if (!adult)
        return fail('blocked', 'Release blocked: this adult is not on the active pickup list. Contact an authorized parent or the ski school admin.');
      if (idChecked !== true) return fail('invalid', 'Confirm you checked photo ID.', { idChecked: 'Confirm you checked photo ID.' });
      const log = { id: newId('pkp'), childId, lessonDate, authorizedAdultId: adult.id, adultNameSnapshot: adult.name, verifiedByUserId: user.id, idChecked: true as const, releasedAt: stamp() };
      state.pickups.push(log);
      att.status = 'Released';
      audit(user, 'child_released', 'PickupLog', log.id, `Released to authorized adult ${adult.id} after ID check`);
      return ok({ ...log });
    },

    async recordDeniedPickup(childId, statedAdultName, reason, lessonDate, user) {
      if (!is(user, 'desk')) return deny(user, 'DeniedPickup', childId, 'record denial');
      if (!findChild(childId) || !attendanceFor(childId, lessonDate)) return NOT_FOUND;
      const errors: Record<string, string> = {};
      if (!statedAdultName.trim()) errors.statedAdultName = 'Enter the name the adult gave.';
      if (!reason.trim()) errors.reason = 'Enter the reason.';
      if (Object.keys(errors).length) return fail('invalid', 'Please fix the highlighted fields.', errors);
      const denial = { id: newId('dnp'), childId, lessonDate, statedAdultName: statedAdultName.trim(), reason: reason.trim(), staffUserId: user.id, occurredAt: stamp() };
      state.denials.push(denial);
      audit(user, 'pickup_denied', 'DeniedPickup', denial.id, 'Pickup refused: adult not on active list');
      return ok({ ...denial });
    },

    async reportMissingChild(childId, lessonDate, details, user) {
      const child = findChild(childId);
      if (!is(user, 'instructor', 'desk', 'patrol')) return deny(user, 'Incident', childId, 'report missing');
      if (!child || !attendanceFor(childId, lessonDate)) return NOT_FOUND;
      if (user.role === 'instructor' && !instructorAssigned(user, child, lessonDate)) return deny(user, 'Incident', childId, 'report missing (unassigned)', NOT_FOUND);
      const errors: Record<string, string> = {};
      if (Number.isNaN(Date.parse(details.lastSeenAt))) errors.lastSeenAt = 'Enter when the child was last seen.';
      if (!details.lastSeenLocation?.trim()) errors.lastSeenLocation = 'Enter where the child was last seen.';
      if (Object.keys(errors).length) return fail('invalid', 'Please fix the highlighted fields.', errors);
      if (incidentsFor(childId, lessonDate).some((i) => i.status === 'Open')) return fail('blocked', 'An open incident already exists for this child.');
      const incident: Incident = {
        id: newId('inc'),
        childId,
        lessonDate,
        reportedBy: user.id,
        reportedAt: stamp(),
        lastSeenAt: new Date(details.lastSeenAt).toISOString(),
        lastSeenLocation: details.lastSeenLocation.trim(),
        clothingDescription: details.clothingDescription?.trim() ?? '',
        equipmentDescription: details.equipmentDescription?.trim() ?? '',
        notes: details.notes?.trim() ?? '',
        status: 'Open',
        actions: [],
        locatedAt: null,
        resolvedAt: null,
      };
      state.incidents.push(incident);
      audit(user, 'incident_reported', 'Incident', incident.id, `Missing child reported by ${user.role}`);
      return ok(structuredClone(incident));
    },

    async searchChildren(query, lessonDate, user) {
      if (!is(user, 'patrol')) return FORBIDDEN;
      if (!query.trim()) return ok([]);
      return ok(
        state.children
          .filter((c) => attendanceFor(c.id, lessonDate) && matchesName(c, query))
          .map((c) => ({ childId: c.id, firstName: c.firstName, lastName: c.lastName, age: ageOn(c.birthDate, lessonDate), groupNumber: groupOf(c)?.groupNumber ?? null })),
      );
    },

    async listOpenIncidents(user) {
      if (!is(user, 'patrol', 'admin')) return FORBIDDEN;
      return ok(state.incidents.filter((i) => i.status !== 'Closed').map(incidentItem));
    },

    async getIncidentPacket(incidentId, user) {
      if (!is(user, 'patrol')) return deny(user, 'Incident', incidentId, 'emergency packet');
      const incident = state.incidents.find((i) => i.id === incidentId);
      if (!incident) return NOT_FOUND;
      if (incident.status === 'Closed') return fail('blocked', 'This incident is closed.');
      const child = findChild(incident.childId)!;
      const group = groupOf(child);
      const att = attendanceFor(child.id, incident.lessonDate);
      audit(user, 'incident_packet_viewed', 'Incident', incident.id, `Emergency packet opened for incident ${incident.id}`);
      return ok({
        incident: structuredClone(incident),
        child: {
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          otherNames: [...child.otherNames],
          age: ageOn(child.birthDate, incident.lessonDate),
          skiLevel: child.skiLevel,
          liftPassNumber: child.liftPassNumber,
          bibNumber: att?.bibNumber ?? null,
        },
        group: group ? { groupNumber: group.groupNumber, instructorName: state.users.find((u) => u.id === group.instructorUserId)?.displayName ?? 'Unknown' } : null,
        parentClothingToday: att?.clothingToday ?? null,
        alerts: safetyAlerts(medicalFor(child.id)),
        emergencyContacts: state.contacts
          .filter((c) => c.childId === child.id)
          .sort((a, b) => a.priority - b.priority)
          .map(({ name, relationship, phone, priority }) => ({ name, relationship, phone, priority })),
        escalateAt: escalationTime(incident.lastSeenAt, incident.lessonDate),
      });
    },

    async updateIncident(incidentId, update, user) {
      if (!is(user, 'patrol')) return deny(user, 'Incident', incidentId, 'incident update');
      const incident = state.incidents.find((i) => i.id === incidentId);
      if (!incident) return NOT_FOUND;
      if (incident.status === 'Closed') return fail('blocked', 'This incident is closed.');
      const at = stamp();
      if (update.kind === 'action') {
        if (!update.note?.trim()) return fail('invalid', 'Add a note for this action.', { note: 'Add a note for this action.' });
        incident.actions.push({ id: newId('act'), type: update.type, note: update.note.trim(), staffUserId: user.id, occurredAt: at });
        audit(user, 'incident_updated', 'Incident', incident.id, `Action: ${update.type}`);
        if (update.type === 'shared_with_police_or_rescuers') {
          const child = findChild(incident.childId)!;
          const task = { id: newId('tsk'), childId: child.id, childName: `${child.firstName} ${child.lastName}`, incidentId: incident.id, mailingAddress: child.mailingAddress, createdBy: user.id, createdAt: at, status: 'Open' as const };
          state.noticeTasks.push(task);
          audit(user, 'notice_task_created', 'NoticeTask', task.id, `Notice task created for incident ${incident.id}`);
        }
        return ok(structuredClone(incident));
      }
      if (!['Open', 'Located', 'Closed'].includes(update.status)) return fail('invalid', 'Unknown status.');
      if (update.status === incident.status) return fail('blocked', `Already ${incident.status}.`);
      incident.actions.push({ id: newId('act'), type: 'status_change', note: `${incident.status} → ${update.status}${update.note?.trim() ? `: ${update.note.trim()}` : ''}`, staffUserId: user.id, occurredAt: at });
      incident.status = update.status;
      if (update.status === 'Located') incident.locatedAt = at;
      if (update.status === 'Closed') incident.resolvedAt = at;
      audit(user, 'incident_updated', 'Incident', incident.id, `Status set to ${update.status}`);
      return ok(structuredClone(incident));
    },

    async getProfileCompletionSummary(user) {
      if (!is(user, 'admin')) return FORBIDDEN;
      return ok(
        state.children
          .map((c) => ({ c, completion: profileOf(c).completion }))
          .filter(({ completion }) => completion.status === 'NeedsInformation')
          .map(({ c, completion }) => ({ childId: c.id, firstName: c.firstName, lastName: c.lastName, groupNumber: groupOf(c)?.groupNumber ?? null, missing: completion.missing })),
      );
    },

    async getOperationsSnapshot(lessonDate, user) {
      if (!is(user, 'admin')) return FORBIDDEN;
      const day = state.attendance.filter((a) => a.lessonDate === lessonDate);
      return ok({
        lessonDate,
        expected: day.length,
        checkedIn: day.filter((a) => a.status !== 'Expected').length,
        released: day.filter((a) => a.status === 'Released').length,
        openIncidents: state.incidents.filter((i) => i.lessonDate === lessonDate && i.status !== 'Closed').map(incidentItem),
        deniedPickups: state.denials.filter((d) => d.lessonDate === lessonDate).map(({ id, childId, statedAdultName, occurredAt }) => ({ id, childId, statedAdultName, occurredAt })),
      });
    },

    async openChildDetailsWithReason(childId, reason, user) {
      if (!is(user, 'admin')) return deny(user, 'Child', childId, 'details with reason');
      const child = findChild(childId);
      if (!child) return NOT_FOUND;
      if (!reason.trim()) return deny(user, 'Child', childId, 'details without a reason', fail('invalid', 'Give a reason to open these details.', { reason: 'Give a reason to open these details.' }));
      audit(user, 'admin_viewed_child_details', 'Child', childId, `Reason: ${reason.trim()}`);
      return ok(profileOf(child));
    },

    async assignChildToGroup(childId, groupId, user) {
      if (!is(user, 'admin')) return deny(user, 'Child', childId, 'group assignment');
      const child = findChild(childId);
      const group = state.groups.find((g) => g.id === groupId);
      if (!child || !group) return NOT_FOUND;
      if (child.groupId === groupId) return ok({ childId, groupId });
      if (state.children.filter((c) => c.groupId === groupId).length >= MAX_GROUP_SIZE)
        return fail('blocked', `Group ${group.groupNumber} already has ${MAX_GROUP_SIZE} children.`);
      const from = child.groupId;
      child.groupId = groupId;
      child.updatedAt = stamp();
      audit(user, 'group_assignment_changed', 'Child', childId, `Moved from ${from ?? 'no group'} to ${groupId}`);
      return ok({ childId, groupId });
    },

    async assignInstructorToGroup(groupId, instructorUserId, user) {
      if (!is(user, 'admin')) return deny(user, 'LessonGroup', groupId, 'instructor assignment');
      const group = state.groups.find((g) => g.id === groupId);
      if (!group) return NOT_FOUND;
      if (!state.users.some((u) => u.id === instructorUserId && u.role === 'instructor'))
        return fail('invalid', 'Choose an instructor account.', { instructorUserId: 'Choose an instructor account.' });
      const from = group.instructorUserId;
      group.instructorUserId = instructorUserId;
      audit(user, 'group_assignment_changed', 'LessonGroup', groupId, `Instructor changed from ${from} to ${instructorUserId}`);
      return ok({ groupId, instructorUserId });
    },

    async addPickupCorrection(pickupLogId, reason, note, user) {
      if (!is(user, 'admin')) return deny(user, 'PickupLog', pickupLogId, 'pickup correction');
      if (!state.pickups.some((p) => p.id === pickupLogId)) return NOT_FOUND;
      const errors: Record<string, string> = {};
      if (!reason.trim()) errors.reason = 'Enter why this correction is needed.';
      if (!note.trim()) errors.note = 'Enter the correction.';
      if (Object.keys(errors).length) return fail('invalid', 'Please fix the highlighted fields.', errors);
      const correction = { id: newId('cor'), pickupLogId, correctedBy: user.id, reason: reason.trim(), note: note.trim(), createdAt: stamp() };
      state.corrections.push(correction);
      audit(user, 'pickup_corrected', 'PickupLog', pickupLogId, `Correction added: ${correction.reason}`);
      return ok({ ...correction });
    },

    async getNoticeTasks(user) {
      if (!is(user, 'admin')) return FORBIDDEN;
      return ok(structuredClone(state.noticeTasks.filter((t) => t.status === 'Open')));
    },

    async getAuditLog(user) {
      if (!is(user, 'admin')) return FORBIDDEN;
      return ok(structuredClone(state.audit).reverse());
    },
  };
}
