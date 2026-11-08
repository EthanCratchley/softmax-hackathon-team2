import { expect, test } from '@playwright/test';
import { adminReducer, createAdminState, groupChildren, operationalWarnings } from '../lib/admin/mock';

test('six-child capacity is enforced even when actions bypass the UI', () => {
  const state = createAdminState();
  const group = state.groups[0];
  // Test-only extra rows exercise a seventh enrolment; no production child fixture changes.
  state.roster = Array.from({ length: 7 }, (_, index) => ({ ...state.roster[0], id: `capacity-test-${index}`, group: index < 6 ? group.name : 'Other test group' }));
  const full = adminReducer(state, { type: 'assign-child', childId: 'capacity-test-6', groupId: group.id, day: group.day });
  expect(full.error).toContain('cannot exceed six');
  expect(groupChildren(full, group)).toHaveLength(6);
  expect(full.roster).toEqual(state.roster);
  const sameGroup = adminReducer(state, { type: 'assign-child', childId: 'capacity-test-0', groupId: group.id, day: group.day });
  expect(sameGroup.error).toBe('');
  expect(groupChildren(sameGroup, group)).toHaveLength(6);
});

test('assignments reject mismatched lesson days and unknown instructors', () => {
  const state = createAdminState();
  expect(adminReducer(state, { type: 'assign-child', childId: 'sam', groupId: state.groups[0].id, day: '2026-12-12' }).error).not.toBe('');
  expect(adminReducer(state, { type: 'assign-instructor', groupId: state.groups[0].id, day: '2026-12-12', instructorId: 'unknown' }).groups).toEqual(state.groups);
});

test('protected reads and corrections reject empty reasons at the mock action boundary', () => {
  const state = createAdminState();
  const refused = adminReducer(state, { type: 'open-details', childId: 'ava', reason: '  ', at: '2026-12-12T23:00:00Z' });
  expect(refused.openedChildId).toBeNull();
  expect(refused.access).toHaveLength(0);
  expect(refused.error).toContain('Give a reason');
  const correction = adminReducer(state, { type: 'correct', target: 'pickup:0', note: 'Test correction', reason: ' ', at: '2026-12-12T23:00:00Z' });
  expect(correction.corrections).toHaveLength(0);
  expect(correction.releases).toEqual(state.releases);
});

test('headcounts use the ten-minute threshold and clear on confirmation; warnings pause at lunch', () => {
  const state = createAdminState();
  expect(operationalWarnings(state, '2026-12-12', '2026-12-12T14:40:00-08:00').overdue).toHaveLength(0);
  expect(operationalWarnings(state, '2026-12-12', '2026-12-12T14:41:00-08:00').overdue).toHaveLength(1);
  expect(operationalWarnings(state, '2026-12-12').lostContact).toHaveLength(1);
  state.headcounts[0].confirmedAt = '2026-12-12T15:09:00-08:00';
  state.instructorContacts[0].lastContactAt = '2026-12-12T15:09:00-08:00';
  expect(operationalWarnings(state, '2026-12-12').overdue).toHaveLength(0);
  expect(operationalWarnings(state, '2026-12-12').lostContact).toHaveLength(0);
  const lunchState = createAdminState();
  lunchState.headcounts[0].dueAt = '2026-12-12T00:00:00Z';
  lunchState.instructorContacts[0].lastContactAt = '2026-12-12T00:00:00Z';
  // Resolve noon using the runtime's Pacific-zone rules, including future changes.
  const lunch = new Date('2026-12-12T20:00:00Z');
  const localHour = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: 'America/Vancouver' }).format(lunch));
  lunch.setUTCHours(lunch.getUTCHours() + 12 - localHour);
  expect(operationalWarnings(lunchState, '2026-12-12', lunch.toISOString())).toEqual({ overdue: [], lostContact: [] });
  expect(operationalWarnings(createAdminState(), '2026-12-12', undefined, false)).toEqual({ overdue: [], lostContact: [] });
});
