import { expect, test } from '@playwright/test';
import { authorizedAdults, createMockDeskState, mockDeskReducer } from '../lib/desk/pickup-mock';

const at = '2026-12-12T23:00:00Z';
test('mock transition rejects unlisted, expired, cancelled, future and other-child authorizations', () => {
  for (const adultId of ['unlisted', 'lily-expired', 'lily-cancelled', 'lily-future', 'ava-parent']) {
    const state = mockDeskReducer(createMockDeskState(), { type: 'release', childId: 'lily', day: '2026-12-12', adultId, idChecked: true, at });
    expect(state.error).toContain('Release blocked');
    expect(state.releases.filter(record => record.childId === 'lily')).toHaveLength(0);
    expect(state.roster.find(child => child.id === 'lily')?.status).toBe('checked-in');
  }
  expect(authorizedAdults('lily', '2026-12-13').some(adult => adult.id === 'lily-grace')).toBe(false);
});

test('mock transition requires checked ID and prevents duplicate submissions', () => {
  const action = { type: 'release' as const, childId: 'lily', day: '2026-12-12', adultId: 'lily-grace', idChecked: false, at };
  const refused = mockDeskReducer(createMockDeskState(), action);
  expect(refused.error).toContain('physically check');
  expect(refused.releases).toHaveLength(1);
  const released = mockDeskReducer(refused, { ...action, idChecked: true });
  const duplicate = mockDeskReducer(released, { ...action, idChecked: true });
  expect(duplicate.error).toContain('already been released');
  expect(duplicate.releases.filter(record => record.childId === 'lily')).toHaveLength(1);
  expect(duplicate.releases.find(record => record.childId === 'lily')).toMatchObject({ adultId: 'lily-grace', adultName: 'Grace Okafor', idChecked: true, source: 'Parent pickup link', linkId: 'demo-lily-grace', releasedAt: at });
});

test('mock transition blocks an open incident even after check-in and ID confirmation', () => {
  const checkedIn = mockDeskReducer(createMockDeskState(), { type: 'check-in', childId: 'owen', day: '2026-12-12', bib: '14', at });
  const state = mockDeskReducer(checkedIn, { type: 'release', childId: 'owen', day: '2026-12-12', adultId: 'owen-parent', idChecked: true, at });
  expect(state.error).toContain('Call patrol');
  expect(state.releases.filter(record => record.childId === 'owen')).toHaveLength(0);
});
