// piezas-scenario: S-025 v=3bf1b35aba61
// S-025: Group limits hold
//   Given a group already has six children
//   When Hana tries to add a seventh
//   Then the app refuses and the group stays at six
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { expect, test, type Page } from '../scenario-test';
import type { VerifiedUser } from '../../lib/domain/types';
import { CHILD_IDS, createDemoState, GROUP_IDS, USER_IDS } from '../../lib/fixtures';
import { createMockServices } from '../../lib/services/mock';
import { signIn } from '../sign-in';
import { Piezas } from '@piezas/sdk';
import { entityDefinitionsFor, slugsFor } from '../../lib/piezas-schema';

async function move(page: Page, childId: string, groupId: string, expected: string | RegExp) {
  await page.getByTestId('assign-child-select').selectOption(childId);
  await page.getByTestId('assign-child-group').selectOption(groupId);
  await page.getByTestId('assign-child-submit').click();
  await expect(page.getByTestId('assign-child-message')).toHaveText(expected);
}

// The demo has exactly six children, so the UI can fill a group to six but has
// no seventh child to try. Keep this service-level check alongside the real
// admin-screen refusal below, which adds one temporary child to the TEST copy.
test('S-025: a seventh child is refused by the group service and the group stays at six', async () => {
  const state = createDemoState();
  state.children.push({ ...structuredClone(state.children[0]), id: 'chd_seventh', firstName: 'Test', lastName: 'Seventh' });
  const svc = createMockServices(state);
  const hana = { ...state.users.find((u) => u.id === USER_IDS.admin)!, __verified: true } as VerifiedUser;
  for (const id of [CHILD_IDS.ava, CHILD_IDS.owen, CHILD_IDS.ella]) expect((await svc.assignChildToGroup(id, GROUP_IDS.group9, hana)).ok).toBe(true);
  expect(state.children.filter((c) => c.groupId === GROUP_IDS.group9)).toHaveLength(6);

  const refused = await svc.assignChildToGroup('chd_seventh', GROUP_IDS.group9, hana);
  expect(refused).toEqual({ ok: false, error: { code: 'blocked', message: 'Group 9 already has 6 children.' } });
  expect(state.children.filter((c) => c.groupId === GROUP_IDS.group9)).toHaveLength(6);
  expect(state.children.find((c) => c.id === 'chd_seventh')!.groupId).toBe(GROUP_IDS.group14);
});

test('S-025: Hana fills a group to six through the admin screen and the roster shows six', async ({ page }) => {
  await signIn(page, 'hana.sato@example.test');
  await page.goto('/admin');
  try {
    for (const [id, name] of [[CHILD_IDS.ava, 'Ava Shah'], [CHILD_IDS.owen, 'Owen Parr'], [CHILD_IDS.ella, 'Ella Haddad']] as const)
      await move(page, id, GROUP_IDS.group9, `Moved ${name} to Group 9.`);

    await signIn(page, 'sam.rivera@example.test');
    await page.goto('/instructor');
    const roster = page.locator('[data-testid^="child-chd_"]');
    await expect(roster).toHaveCount(6);
    for (const id of Object.values(CHILD_IDS)) await expect(page.getByTestId(`child-${id}`)).toBeVisible();
  } finally {
    // Other scenarios rely on Jordan's Group 14 roster.
    await signIn(page, 'hana.sato@example.test');
    await page.goto('/admin');
    for (const [id, name] of [[CHILD_IDS.ava, 'Ava Shah'], [CHILD_IDS.owen, 'Owen Parr'], [CHILD_IDS.ella, 'Ella Haddad']] as const)
      await move(page, id, GROUP_IDS.group14, `Moved ${name} to Group 14.`);
  }
});

test('S-025: Hana cannot move a seventh child into a full group through the admin screen', async ({ page }) => {
  const key = process.env.PIEZAS_TEST_API_KEY;
  if (!key?.startsWith('sk_test_') || key === process.env.PIEZAS_API_KEY)
    throw new Error('This check requires a separate Piezas test copy.');
  const piezas = new Piezas({ apiKey: key, apiBaseUrl: process.env.PIEZAS_API_URL });
  const slug = slugsFor(key).children;
  const children = (await piezas.defineEntities({ [slug]: entityDefinitionsFor(key)[slug] }))[slug];
  const seventh = { ...structuredClone(createDemoState().children[0]), id: 'chd_seventh_ui', firstName: 'Test', lastName: 'Seventh', groupId: GROUP_IDS.group14 };
  const record = await children.create({ title: seventh.id, data: { key: seventh.id, payload: JSON.stringify(seventh) } });
  try {
    await signIn(page, 'hana.sato@example.test');
    await page.goto('/admin');
    for (const [id, name] of [[CHILD_IDS.ava, 'Ava Shah'], [CHILD_IDS.owen, 'Owen Parr'], [CHILD_IDS.ella, 'Ella Haddad']] as const)
      await move(page, id, GROUP_IDS.group9, `Moved ${name} to Group 9.`);
    await expect(page.getByTestId(`group-count-${GROUP_IDS.group9}`)).toHaveText('6 of 6 places');

    await move(page, seventh.id, GROUP_IDS.group9, 'Group 9 already has 6 children.');
    await page.reload();
    await expect(page.getByTestId(`group-count-${GROUP_IDS.group9}`)).toHaveText('6 of 6 places');
    await expect(page.getByTestId(`group-children-${GROUP_IDS.group9}`)).not.toContainText('Test Seventh');
    await expect(page.getByTestId(`group-count-${GROUP_IDS.group14}`)).toHaveText('1 of 6 places');
    await expect(page.getByTestId(`group-children-${GROUP_IDS.group14}`)).toHaveText('Test Seventh');
  } finally {
    try {
      await signIn(page, 'hana.sato@example.test');
      await page.goto('/admin');
      for (const [id, name] of [[CHILD_IDS.ava, 'Ava Shah'], [CHILD_IDS.owen, 'Owen Parr'], [CHILD_IDS.ella, 'Ella Haddad']] as const)
        await move(page, id, GROUP_IDS.group14, `Moved ${name} to Group 14.`);
    } finally {
      await children.delete(record.id);
    }
  }
});
