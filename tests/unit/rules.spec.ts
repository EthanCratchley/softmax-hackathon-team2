import { expect, test } from '@playwright/test';
import { ageOn, computeCompletion, escalationTime, isValidPhone, matchesName, normalizePhone, safetyAlerts } from '../../lib/domain/rules';
import { CHILD_IDS, createDemoState } from '../../lib/fixtures';

test.describe('phone validation (R-003)', () => {
  test('accepts 10-digit numbers in common formats', () => {
    for (const p of ['604-555-0101', '(604) 555-0101', '604 555 0101', '6045550101', '+1 604 555 0101', '1-604-555-0101'])
      expect(normalizePhone(p), p).toBe('+16045550101');
  });

  test('rejects too few, too many, letters and empty', () => {
    for (const p of ['604555-187', '604-555-010', '604-555-01011', '2-604-555-0101', '604-555-01O1', '', '   '])
      expect(isValidPhone(p), p).toBe(false);
  });
});

test.describe('profile completion (R-004, R-005)', () => {
  const parts = (id: string) => {
    const s = createDemoState();
    return {
      child: s.children.find((c) => c.id === id)!,
      medical: s.medical.find((m) => m.childId === id)!,
      emergencyContacts: s.contacts.filter((c) => c.childId === id),
      authorizedAdults: s.adults.filter((a) => a.childId === id),
      consent: s.consents.find((c) => c.childId === id) ?? null,
    };
  };

  test('a fully answered profile is Complete', () => {
    expect(computeCompletion(parts(CHILD_IDS.lily))).toEqual({ status: 'Complete', missing: [] });
  });

  test('blank conditions are not "none"', () => {
    const p = parts(CHILD_IDS.ella);
    expect(computeCompletion(p).missing).toEqual(['conditions']);
    p.medical.conditions = [];
    expect(computeCompletion(p).missing).toEqual(['conditions']);
    p.medical.conditions = 'none';
    expect(computeCompletion(p).status).toBe('Complete');
  });

  test('names each missing field', () => {
    expect(computeCompletion(parts(CHILD_IDS.mateo)).missing).toEqual(['emergencyContacts', 'consent']);
    expect(computeCompletion(parts(CHILD_IDS.ava)).missing).toEqual(['emergencyContacts', 'allergies', 'conditions', 'medications', 'consent']);
  });

  test('an invalid phone does not count toward two contacts', () => {
    const p = parts(CHILD_IDS.lily);
    p.emergencyContacts[1].phone = '604555-187';
    expect(computeCompletion(p).missing).toEqual(['emergencyContacts']);
  });

  test('only active pickup adults count; parent link required', () => {
    const p = parts(CHILD_IDS.lily);
    p.authorizedAdults.forEach((a) => (a.isActive = false));
    p.child.parentUserIds = [];
    expect(computeCompletion(p).missing).toEqual(['parent', 'pickupAdult']);
  });
});

test.describe('escalation time (R-029, S-022)', () => {
  test('60 minutes after last seen when that is before 4 p.m.', () => {
    expect(escalationTime('2026-12-12T14:30:00-07:00', '2026-12-12')).toBe(new Date('2026-12-12T15:30:00-07:00').toISOString());
  });

  test('4 p.m. when last seen + 60 is later', () => {
    expect(escalationTime('2026-12-12T15:30:00-07:00', '2026-12-12')).toBe(new Date('2026-12-12T16:00:00-07:00').toISOString());
  });

  test('exactly at the boundary', () => {
    expect(escalationTime('2026-12-12T15:00:00-07:00', '2026-12-12')).toBe(new Date('2026-12-12T16:00:00-07:00').toISOString());
  });

  test('uses daylight time after the March change', () => {
    expect(escalationTime('2027-03-20T15:45:00-07:00', '2027-03-20')).toBe(new Date('2027-03-20T16:00:00-07:00').toISOString());
  });
});

test('safety alerts carry only the need-to-know fields', () => {
  const s = createDemoState();
  const alerts = safetyAlerts(s.medical.find((m) => m.childId === CHILD_IDS.owen)!);
  expect(alerts).toEqual([
    {
      kind: 'condition',
      summary: 'Condition: Asthma',
      medicationLocation: 'Blue reliever inhaler: Jacket left chest pocket',
      instructions: 'If wheezing, help him use the inhaler (2 puffs). Call patrol if no improvement in 5 minutes.',
    },
  ]);
  expect(safetyAlerts(s.medical.find((m) => m.childId === CHILD_IDS.lily)!)).toEqual([]);
});

test('age on lesson day handles birthdays not yet reached', () => {
  expect(ageOn('2016-11-20', '2026-12-12')).toBe(10);
  expect(ageOn('2016-12-13', '2026-12-12')).toBe(9);
  expect(ageOn('2016-12-12', '2026-12-12')).toBe(10);
});

test('name search matches any name, case-insensitive (R-014)', () => {
  const owen = { firstName: 'Owen', lastName: 'Parr', otherNames: ['Owen Okafor-Parr', 'Okafor-Parr'] };
  for (const q of ['parr', 'Okafor', 'okafor-parr', 'owen parr', 'OW']) expect(matchesName(owen, q), q).toBe(true);
  expect(matchesName(owen, 'Shah')).toBe(false);
});
