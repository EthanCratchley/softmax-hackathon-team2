import { expect, test } from '@playwright/test';
import type { VerifiedUser } from '../../lib/domain/types';
import { ADULT_IDS, CHILD_IDS, createDemoState, DEMO_LESSON_DATE as DAY, GROUP_IDS, USER_IDS, type DemoState } from '../../lib/fixtures';
import type { KestrelServices, Result } from '../../lib/services/contract';
import { createMockServices } from '../../lib/services/mock';

let state: DemoState;
let svc: KestrelServices;
const as = (id: string): VerifiedUser => ({ ...state.users.find((u) => u.id === id)!, __verified: true });
const data = <T>(r: Result<T>): T => {
  if (!r.ok) throw new Error(`expected ok, got ${r.error.code}: ${r.error.message}`);
  return r.data;
};
const errCode = (r: Result<unknown>) => (r.ok ? 'ok' : r.error.code);

test.beforeEach(() => {
  state = createDemoState();
  svc = createMockServices(state, () => new Date('2026-12-12T15:00:00-07:00'));
});

test.describe('parent isolation (S-001)', () => {
  test('lists only linked children', async () => {
    expect(data(await svc.getMyChildren(as(USER_IDS.parentAva))).map((c) => c.id)).toEqual([CHILD_IDS.ava]);
  });

  test("Parent A gets not_found for Parent B's child, read and write", async () => {
    const r = await svc.getChildProfile(CHILD_IDS.lily, as(USER_IDS.parentAva));
    expect(r).toEqual({ ok: false, error: { code: 'not_found', message: 'Not found.' } });
    expect(errCode(await svc.updateChildProfile(CHILD_IDS.lily, { allergies: 'none' }, as(USER_IDS.parentAva)))).toBe('not_found');
    expect(state.medical.find((m) => m.childId === CHILD_IDS.lily)!.allergies).toBe('none');
    expect(state.audit.at(-1)).toMatchObject({ action: 'access_denied', actorUserId: USER_IDS.parentAva });
  });

  test('a non-existent id looks the same as a forbidden one', async () => {
    expect(await svc.getChildProfile('chd_nope', as(USER_IDS.parentAva))).toEqual(await svc.getChildProfile(CHILD_IDS.lily, as(USER_IDS.parentAva)));
  });

  test('staff roles cannot read the full profile', async () => {
    for (const id of [USER_IDS.instructorGroup14, USER_IDS.desk, USER_IDS.patrol, USER_IDS.admin])
      expect(errCode(await svc.getChildProfile(CHILD_IDS.ava, as(id))), id).toBe('forbidden');
  });
});

test.describe('parent updates (S-002 to S-005)', () => {
  test('a full update makes Ava Complete and records who and when', async () => {
    const parent = as(USER_IDS.parentAva);
    const r = data(
      await svc.updateChildProfile(
        CHILD_IDS.ava,
        {
          allergies: ['Tree nuts'],
          conditions: 'none',
          medications: [{ name: 'EpiPen', location: 'Jacket right pocket', heldAtDesk: false }],
          safetyInstructions: 'Give EpiPen in outer thigh, then call patrol.',
          emergencyContacts: [
            { name: 'Priya Shah', relationship: 'Mother', phone: '604-555-0101', priority: 1 },
            { name: 'Arun Shah', relationship: 'Father', phone: '(604) 555-0102', priority: 2 },
          ],
          consent: { typedName: 'Priya Shah', photoConsent: false },
        },
        parent,
      ),
    );
    expect(r.completion).toEqual({ status: 'Complete', missing: [] });
    expect(r.medical).toMatchObject({ updatedBy: USER_IDS.parentAva, updatedAt: new Date('2026-12-12T15:00:00-07:00').toISOString() });
    expect(data(await svc.getChildProfile(CHILD_IDS.ava, parent)).medical.allergies).toEqual(['Tree nuts']);
  });

  test('a 9-digit phone is rejected and nothing is saved', async () => {
    const before = structuredClone(state.contacts);
    const r = await svc.updateChildProfile(
      CHILD_IDS.lily,
      { emergencyContacts: [{ name: 'Dana Whitfield', relationship: 'Mother', phone: '604555-187', priority: 1 }] },
      as(USER_IDS.parentLily),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.fields).toEqual({ 'emergencyContacts.0.phone': 'Enter a 10-digit phone number, e.g. 604-555-0101.' });
    expect(state.contacts).toEqual(before);
  });

  test('validation rejects blank items, missing medication location, unknown adult ids and empty consent', async () => {
    const r = await svc.updateChildProfile(
      CHILD_IDS.ava,
      {
        allergies: ['  '],
        medications: [{ name: 'EpiPen', location: '', heldAtDesk: false }],
        authorizedAdults: [{ id: ADULT_IDS.lilyUncle, name: 'Mark', relationship: 'Uncle', phone: null, isActive: true }],
        consent: { typedName: ' ', photoConsent: true },
      },
      as(USER_IDS.parentAva),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.error.fields!).sort()).toEqual(['allergies', 'authorizedAdults.0', 'consent.typedName', 'medications.0.location']);
    expect(state.adults.find((a) => a.id === ADULT_IDS.lilyUncle)!.isActive).toBe(false);
  });

  test('a new allergy reaches only the assigned instructor (S-005, S-006)', async () => {
    await svc.updateChildProfile(CHILD_IDS.ava, { allergies: ['Tree nuts'], safetyInstructions: 'Give EpiPen.' }, as(USER_IDS.parentAva));
    const roster = data(await svc.getInstructorRoster(DAY, as(USER_IDS.instructorGroup14)));
    const ava = roster.flatMap((g) => g.children).find((c) => c.childId === CHILD_IDS.ava)!;
    expect(ava.alerts).toEqual([{ kind: 'allergy', summary: 'Allergy: Tree nuts', medicationLocation: null, instructions: 'Give EpiPen.' }]);

    const other = data(await svc.getInstructorRoster(DAY, as(USER_IDS.instructorGroup9)));
    expect(other.flatMap((g) => g.children).map((c) => c.childId)).not.toContain(CHILD_IDS.ava);
    expect(errCode(await svc.updateChildProfile(CHILD_IDS.ava, { allergies: 'none' }, as(USER_IDS.instructorGroup14)))).toBe('forbidden');
  });

  test('roster is empty on a day with no assignment', async () => {
    expect(data(await svc.getInstructorRoster('2026-12-13', as(USER_IDS.instructorGroup14)))).toEqual([]);
  });

  test('audit entries never carry medical values', async () => {
    await svc.updateChildProfile(CHILD_IDS.ava, { allergies: ['Tree nuts'], conditions: ['Eczema'] }, as(USER_IDS.parentAva));
    expect(JSON.stringify(state.audit)).not.toMatch(/Tree nuts|Eczema/);
  });
});

test.describe('desk and pickup (S-009 to S-014)', () => {
  test('search by other name, check in, flag needs-information without medical data', async () => {
    const desk = as(USER_IDS.desk);
    expect(data(await svc.getDeskRoster(DAY, desk, 'Okafor')).map((e) => e.childId)).toEqual([CHILD_IDS.owen]);
    const entry = data(await svc.checkInChild(CHILD_IDS.owen, DAY, '14', desk));
    expect(entry).toMatchObject({ status: 'CheckedIn', bibNumber: '14', needsInformation: true });
    expect(JSON.stringify(entry)).not.toMatch(/Asthma|inhaler/i);
    expect(errCode(await svc.checkInChild(CHILD_IDS.owen, DAY, '14', desk))).toBe('blocked');
  });

  test('search by group number', async () => {
    expect(data(await svc.getDeskRoster(DAY, as(USER_IDS.desk), '9')).map((e) => e.childId).sort()).toEqual([CHILD_IDS.lily, CHILD_IDS.mateo, CHILD_IDS.noor].sort());
  });

  test('desk pickup view lists only active adults and desk-held meds, nothing else medical', async () => {
    const view = data(await svc.getDeskPickupView(CHILD_IDS.noor, DAY, as(USER_IDS.desk)));
    expect(view.authorizedAdults).toEqual([{ id: ADULT_IDS.noorMother, name: 'Leila Haddad', relationship: 'Mother' }]);
    expect(view.deskHeldMedications).toEqual(['Holds Glucose gel for this child']);
    expect(JSON.stringify(view)).not.toMatch(/diabetes/i);
    expect(data(await svc.getAuthorizedAdults(CHILD_IDS.lily, as(USER_IDS.desk))).map((a) => a.id)).toEqual([ADULT_IDS.lilyFather]);
  });

  test('desk cannot read medical records or change the pickup list (S-010, S-011)', async () => {
    const desk = as(USER_IDS.desk);
    expect(errCode(await svc.getChildProfile(CHILD_IDS.ava, desk))).toBe('forbidden');
    expect(
      errCode(await svc.updateChildProfile(CHILD_IDS.lily, { authorizedAdults: [{ id: ADULT_IDS.lilyUncle, name: 'Mark Whitfield', relationship: 'Uncle', phone: null, isActive: true }] }, desk)),
    ).toBe('forbidden');
    expect(state.adults.find((a) => a.id === ADULT_IDS.lilyUncle)!.isActive).toBe(false);
  });

  test('Story B: unlisted uncle blocked, parent authorizes, released exactly once (S-012, S-013)', async () => {
    const desk = as(USER_IDS.desk);
    const blocked = await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyUncle, true, DAY, desk);
    expect(errCode(blocked)).toBe('blocked');
    data(await svc.recordDeniedPickup(CHILD_IDS.lily, 'Mark Whitfield', 'Not on active pickup list', DAY, desk));
    expect(state.pickups).toHaveLength(0);
    expect(state.denials).toHaveLength(1);

    data(await svc.updateChildProfile(CHILD_IDS.lily, { authorizedAdults: [{ id: ADULT_IDS.lilyUncle, name: 'Mark Whitfield', relationship: 'Uncle', phone: '604-555-0113', isActive: true }] }, as(USER_IDS.parentLily)));
    expect(data(await svc.getAuthorizedAdults(CHILD_IDS.lily, desk)).map((a) => a.id)).toContain(ADULT_IDS.lilyUncle);

    expect(errCode(await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyUncle, false, DAY, desk))).toBe('invalid');
    const log = data(await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyUncle, true, DAY, desk));
    expect(log).toMatchObject({ childId: CHILD_IDS.lily, lessonDate: DAY, authorizedAdultId: ADULT_IDS.lilyUncle, adultNameSnapshot: 'Mark Whitfield', verifiedByUserId: USER_IDS.desk, idChecked: true });

    const again = await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyFather, true, DAY, desk);
    expect(errCode(again)).toBe('blocked');
    if (!again.ok) expect(again.error.message).toContain('Mark Whitfield');
    expect(state.pickups).toHaveLength(1);
    expect(data(await svc.getDeskPickupView(CHILD_IDS.lily, DAY, desk)).entry.pickup).toMatchObject({ kind: 'Released', adultName: 'Mark Whitfield' });
  });

  test("an adult from another child's list cannot release this child", async () => {
    expect(errCode(await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.avaMother, true, DAY, as(USER_IDS.desk)))).toBe('blocked');
  });

  test('a child not checked in cannot be released', async () => {
    expect(errCode(await svc.recordPickup(CHILD_IDS.ava, ADULT_IDS.avaMother, true, DAY, as(USER_IDS.desk)))).toBe('blocked');
  });

  test('only desk can release', async () => {
    for (const id of [USER_IDS.parentLily, USER_IDS.instructorGroup9, USER_IDS.patrol, USER_IDS.admin])
      expect(errCode(await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyFather, true, DAY, as(id))), id).toBe('forbidden');
  });
});

test.describe('incidents (S-015 to S-022)', () => {
  const details = { lastSeenAt: '2026-12-12T14:30:00-07:00', lastSeenLocation: 'Top of Pigeon chair', clothingDescription: 'Blue jacket, white helmet', equipmentDescription: 'Green skis', notes: 'Was behind the group' };

  test('assigned instructor reports, desk blocks release, patrol packet is complete and logged', async () => {
    const incident = data(await svc.reportMissingChild(CHILD_IDS.owen, DAY, details, as(USER_IDS.instructorGroup14)));
    expect(incident.status).toBe('Open');

    const desk = as(USER_IDS.desk);
    data(await svc.checkInChild(CHILD_IDS.owen, DAY, '14', desk));
    const view = data(await svc.getDeskPickupView(CHILD_IDS.owen, DAY, desk));
    expect(view.entry.pickup).toEqual({ kind: 'OpenIncident' });
    expect(JSON.stringify(view)).not.toMatch(/Pigeon|Asthma/);
    expect(errCode(await svc.recordPickup(CHILD_IDS.owen, ADULT_IDS.owenFather, true, DAY, desk))).toBe('blocked');

    const packet = data(await svc.getIncidentPacket(incident.id, as(USER_IDS.patrol)));
    expect(packet.child).toMatchObject({ firstName: 'Owen', otherNames: ['Owen Okafor-Parr', 'Okafor-Parr'], liftPassNumber: 'KK-24-1003', bibNumber: '14', age: 10 });
    expect(packet.group).toEqual({ groupNumber: 14, instructorName: 'Jordan Lee' });
    expect(packet.parentClothingToday).toBe('Red jacket, blue helmet');
    expect(packet.incident.clothingDescription).toBe('Blue jacket, white helmet');
    expect(packet.alerts.map((a) => a.summary)).toEqual(['Condition: Asthma']);
    expect(packet.emergencyContacts.map((c) => c.phone)).toEqual(['604-555-0121', '604-555-0122']);
    expect(packet.escalateAt).toBe(new Date('2026-12-12T15:30:00-07:00').toISOString());
    expect(state.audit.at(-1)).toMatchObject({ action: 'incident_packet_viewed', actorUserId: USER_IDS.patrol, entityId: incident.id });
  });

  test('unassigned instructor cannot report; second open incident is blocked; bad input rejected', async () => {
    expect(errCode(await svc.reportMissingChild(CHILD_IDS.owen, DAY, details, as(USER_IDS.instructorGroup9)))).toBe('not_found');
    expect(errCode(await svc.reportMissingChild(CHILD_IDS.owen, DAY, { ...details, lastSeenAt: 'soon', lastSeenLocation: '' }, as(USER_IDS.desk)))).toBe('invalid');
    data(await svc.reportMissingChild(CHILD_IDS.owen, DAY, details, as(USER_IDS.desk)));
    expect(errCode(await svc.reportMissingChild(CHILD_IDS.owen, DAY, details, as(USER_IDS.patrol)))).toBe('blocked');
    expect(errCode(await svc.reportMissingChild(CHILD_IDS.owen, DAY, details, as(USER_IDS.parentOwen)))).toBe('forbidden');
  });

  test('only patrol can open the packet (S-020)', async () => {
    const incident = data(await svc.reportMissingChild(CHILD_IDS.owen, DAY, details, as(USER_IDS.desk)));
    for (const id of [USER_IDS.instructorGroup14, USER_IDS.desk, USER_IDS.parentOwen, USER_IDS.admin])
      expect(await svc.getIncidentPacket(incident.id, as(id)), id).toEqual({ ok: false, error: { code: 'forbidden', message: 'You do not have access to this.' } });
    expect(errCode(await svc.getIncidentPacket('inc_nope', as(USER_IDS.patrol)))).toBe('not_found');
  });

  test('patrol search returns identity only', async () => {
    const results = data(await svc.searchChildren('owen', DAY, as(USER_IDS.patrol)));
    expect(results).toEqual([{ childId: CHILD_IDS.owen, firstName: 'Owen', lastName: 'Parr', age: 10, groupNumber: 14 }]);
    expect(errCode(await svc.searchChildren('owen', DAY, as(USER_IDS.desk)))).toBe('forbidden');
  });

  test('patrol logs actions, Located then Closed; closed is final (S-021, S-017)', async () => {
    const patrol = as(USER_IDS.patrol);
    const { id } = data(await svc.reportMissingChild(CHILD_IDS.owen, DAY, details, as(USER_IDS.instructorGroup14)));
    expect(errCode(await svc.updateIncident(id, { kind: 'action', type: 'note', note: ' ' }, patrol))).toBe('invalid');
    data(await svc.updateIncident(id, { kind: 'action', type: 'family_contacted', note: 'Called mother' }, patrol));
    data(await svc.updateIncident(id, { kind: 'status', status: 'Located' }, patrol));
    expect(data(await svc.getDeskPickupView(CHILD_IDS.owen, DAY, as(USER_IDS.desk))).entry.pickup).toEqual({ kind: 'IncidentToday' });
    const closed = data(await svc.updateIncident(id, { kind: 'status', status: 'Closed' }, patrol));
    expect(closed.actions.map((a) => a.type)).toEqual(['family_contacted', 'status_change', 'status_change']);
    expect(closed.actions.every((a) => a.staffUserId === USER_IDS.patrol)).toBe(true);
    expect(closed.locatedAt).not.toBeNull();
    expect(closed.resolvedAt).not.toBeNull();
    expect(errCode(await svc.updateIncident(id, { kind: 'status', status: 'Open' }, patrol))).toBe('blocked');
    expect(state.audit.filter((a) => a.action === 'incident_updated')).toHaveLength(3);
    expect(errCode(await svc.updateIncident(id, { kind: 'action', type: 'note', note: 'x' }, as(USER_IDS.desk)))).toBe('forbidden');
  });
});

test.describe('admin (S-024 to S-029)', () => {
  test('completion summary lists only incomplete children with missing fields and no medical values', async () => {
    const rows = data(await svc.getProfileCompletionSummary(as(USER_IDS.admin)));
    expect(rows.map((r) => [r.childId, r.missing])).toEqual([
      [CHILD_IDS.ava, ['emergencyContacts', 'allergies', 'conditions', 'medications', 'consent']],
      [CHILD_IDS.owen, ['consent']],
      [CHILD_IDS.mateo, ['emergencyContacts', 'consent']],
      [CHILD_IDS.ella, ['conditions']],
    ]);
    expect(JSON.stringify(rows)).not.toMatch(/Asthma|diabetes|inhaler/i);
    expect(errCode(await svc.getProfileCompletionSummary(as(USER_IDS.desk)))).toBe('forbidden');
  });

  test('group limit of six holds (S-025)', async () => {
    const admin = as(USER_IDS.admin);
    for (let i = 0; i < 3; i++)
      state.children.push({ ...state.children[0], id: `chd_extra_${i}`, groupId: GROUP_IDS.group9 });
    expect(state.children.filter((c) => c.groupId === GROUP_IDS.group9)).toHaveLength(6);
    expect(errCode(await svc.assignChildToGroup(CHILD_IDS.ava, GROUP_IDS.group9, admin))).toBe('blocked');
    expect(state.children.find((c) => c.id === CHILD_IDS.ava)!.groupId).toBe(GROUP_IDS.group14);
    data(await svc.assignChildToGroup(CHILD_IDS.lily, GROUP_IDS.group14, admin));
    expect(errCode(await svc.assignChildToGroup(CHILD_IDS.lily, GROUP_IDS.group9, as(USER_IDS.instructorGroup9)))).toBe('forbidden');
  });

  test('operations snapshot counts the day (S-026)', async () => {
    const desk = as(USER_IDS.desk);
    await svc.checkInChild(CHILD_IDS.ava, DAY, '3', desk);
    await svc.recordDeniedPickup(CHILD_IDS.lily, 'Mark Whitfield', 'Not listed', DAY, desk);
    await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyFather, true, DAY, desk);
    await svc.reportMissingChild(CHILD_IDS.owen, DAY, { lastSeenAt: '2026-12-12T14:30:00-07:00', lastSeenLocation: 'Pigeon chair', clothingDescription: '', equipmentDescription: '', notes: '' }, desk);
    const snap = data(await svc.getOperationsSnapshot(DAY, as(USER_IDS.admin)));
    expect({ expected: snap.expected, checkedIn: snap.checkedIn, released: snap.released, incidents: snap.openIncidents.length, denied: snap.deniedPickups.length }).toEqual({
      expected: 6,
      checkedIn: 2,
      released: 1,
      incidents: 1,
      denied: 1,
    });
  });

  test('corrections add beside the original pickup (S-027)', async () => {
    const log = data(await svc.recordPickup(CHILD_IDS.lily, ADULT_IDS.lilyFather, true, DAY, as(USER_IDS.desk)));
    const original = structuredClone(state.pickups[0]);
    const c = data(await svc.addPickupCorrection(log.id, 'Wrong adult tapped', 'Actually released to Dana Whitfield', as(USER_IDS.admin)));
    expect(c).toMatchObject({ pickupLogId: log.id, correctedBy: USER_IDS.admin });
    expect(state.pickups).toEqual([original]);
    expect(errCode(await svc.addPickupCorrection(log.id, '', 'x', as(USER_IDS.admin)))).toBe('invalid');
    expect(errCode(await svc.addPickupCorrection(log.id, 'r', 'x', as(USER_IDS.desk)))).toBe('forbidden');
  });

  test('full details need a logged reason (S-029)', async () => {
    const admin = as(USER_IDS.admin);
    expect(errCode(await svc.openChildDetailsWithReason(CHILD_IDS.ava, '  ', admin))).toBe('invalid');
    const profile = data(await svc.openChildDetailsWithReason(CHILD_IDS.ava, 'Parent called about allergy form', admin));
    expect(profile.child.id).toBe(CHILD_IDS.ava);
    expect(state.audit.at(-1)).toMatchObject({ action: 'admin_viewed_child_details', actorUserId: USER_IDS.admin, entityId: CHILD_IDS.ava, detailsSummary: 'Reason: Parent called about allergy form' });
    expect(errCode(await svc.openChildDetailsWithReason(CHILD_IDS.ava, 'curious', as(USER_IDS.patrol)))).toBe('forbidden');
  });

  test('audit log is admin-only and returns copies', async () => {
    await svc.getChildProfile(CHILD_IDS.lily, as(USER_IDS.parentAva));
    const log = data(await svc.getAuditLog(as(USER_IDS.admin)));
    expect(log).toHaveLength(1);
    log[0].detailsSummary = 'tampered';
    expect(state.audit[0].detailsSummary).not.toBe('tampered');
    expect(errCode(await svc.getAuditLog(as(USER_IDS.desk)))).toBe('forbidden');
  });
});
