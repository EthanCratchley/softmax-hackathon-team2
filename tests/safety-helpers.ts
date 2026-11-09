// Shared steps for the instructor/patrol scenarios. Everything goes through the UI.
import { existsSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';
import { demoPassword } from '../lib/piezas-schema';

if (!process.env.DEMO_ACCOUNT_SECRET && existsSync('.env')) process.loadEnvFile('.env');

export const DAY = '2026-12-12';
export const JORDAN = 'jordan.lee@example.test';
export const SAM = 'sam.rivera@example.test';
export const ROB = 'rob.fournier@example.test';
export const CASEY = 'casey.morgan@example.test';
export const PRIYA = 'priya.shah@example.test';
export const HANA = 'hana.sato@example.test';

export async function signInAs(page: Page, email: string) {
  const secret = process.env.DEMO_ACCOUNT_SECRET;
  expect(secret, 'DEMO_ACCOUNT_SECRET must be set (in .env)').toBeTruthy();
  await page.context().clearCookies();
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(demoPassword(secret!, email));
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('home')).toBeVisible();
}

/** Patrol closes any not-yet-closed incident for this child, so a test starts clean. */
export async function closeIncidentsFor(page: Page, childId: string) {
  await signInAs(page, ROB);
  for (;;) {
    await page.goto('/patrol');
    const row = page.locator(`[data-child="${childId}"]`).first();
    if ((await row.count()) === 0) return;
    await row.click();
    await page.getByTestId('status-closed').click();
    await expect(page.getByTestId('incident-closed')).toBeVisible();
  }
}

/** Jordan (Group 14) reports a child missing through the roster. */
export async function instructorReports(page: Page, childId: string, d: { time: string; location: string; clothing?: string; equipment?: string }) {
  await signInAs(page, JORDAN);
  await page.goto(`/instructor?day=${DAY}`);
  await page.getByTestId(`report-${childId}`).click();
  await expect(page.getByTestId('missing-report-form')).toBeVisible();
  await page.getByTestId('last-seen-at').fill(`${DAY}T${d.time}`);
  await page.getByTestId('lastSeenLocation').fill(d.location);
  if (d.clothing) await page.getByTestId('clothingDescription').fill(d.clothing);
  if (d.equipment) await page.getByTestId('equipmentDescription').fill(d.equipment);
  await page.getByTestId('submit-report').click();
  await expect(page.getByTestId('report-confirmation')).toBeVisible();
}

/** Patrol opens the child's open incident from the list. */
export async function patrolOpensPacket(page: Page, childId: string) {
  await signInAs(page, ROB);
  await page.goto('/patrol');
  await page.locator(`[data-child="${childId}"]`).first().click();
  await expect(page.getByTestId('emergency-packet')).toBeVisible();
}

/** Patrol takes a radio call: search, open the report form, enter last-seen time and place. */
export async function patrolReports(page: Page, childId: string, q: string, d: { time: string; location: string }) {
  await signInAs(page, ROB);
  await page.goto(`/patrol?day=${DAY}&q=${encodeURIComponent(q)}`);
  await page.getByTestId(`open-incident-${childId}`).click();
  await expect(page.getByTestId('missing-report-form')).toBeVisible();
  await page.getByTestId('last-seen-at').fill(`${DAY}T${d.time}`);
  await page.getByTestId('lastSeenLocation').fill(d.location);
  await page.getByTestId('submit-report').click();
  await expect(page.getByTestId('emergency-packet')).toBeVisible();
}

/** Hana's audit trail: the action names recorded for an entity id (newest first). */
export async function auditActionsFor(page: Page, entityId: string): Promise<string[]> {
  await signInAs(page, HANA);
  await page.goto('/admin/audit');
  await expect(page.getByTestId('audit-log')).toBeVisible();
  return page.getByTestId('audit-log').locator('li', { hasText: entityId }).evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-action') ?? ''));
}
