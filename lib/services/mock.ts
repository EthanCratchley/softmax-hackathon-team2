// In-memory implementation of the service contract over the synthetic seed.
// Authorization here is the real policy: the Piezas implementation must keep
// identical behaviour, and tests/unit/services.spec.ts holds both to it.
import type { DemoState } from '../fixtures';
import {
  ageOn,
  computeCompletion,
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
        ? { kind: 'Released', adultName: pickup.adultNameSnapshot, releasedAt: pickup.releasedAt }
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
    if (!Array.isArray(answer) || answer.some((v) => typeof v !== 'string' || !v.trim()))
      errors[key] = 'Enter each item, or choose "none".';
  };

  const validateChanges = (child: Child, changes: ChildProfileChanges): Record<string, string> => {
    const errors: Record<string, string> = {};
    validateList(changes.allergies, 'allergies', errors);
    validateList(changes.conditions, 'conditions', errors);
    const meds = changes.medications;
    if (Array.isArray(meds)) {
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
          .map((c) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            groupNumber: groupOf(c)?.groupNumber ?? null,
            completion: profileOf(c).completion,
            updatedAt: c.updatedAt,
          })),
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
