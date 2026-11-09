import { expect, test } from '@playwright/test';

test('instructor preview limits the roster and fits a gloved phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/instructor');
  await expect(page.getByTestId('child-child-ava')).toBeVisible();
  await expect(page.getByTestId('alert-child-ava')).toContainText('Tree-nut allergy');
  await expect(page.getByTestId('alert-child-ava')).toContainText('EpiPen at Kestrel Kids Ski School Desk');
  await expect(page.getByTestId('child-child-lily')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const control of await page.getByTestId('safety-workspace').locator('a, button, input').all()) {
    const bounds = await control.boundingBox();
    expect(bounds?.height).toBeGreaterThanOrEqual(48);
  }
  await page.getByTestId('report-child-ava').click();
  await expect(page.getByTestId('missing-form')).toBeVisible();
});

test('unassigned and unknown children have no report form', async ({ page }) => {
  for (const id of ['child-lily', 'unknown']) {
    await page.goto(`/instructor/report-missing/${id}`);
    await expect(page.getByTestId('child-not-found')).toBeVisible();
    await expect(page.getByTestId('missing-form')).toHaveCount(0);
  }
});

test('headcount confirmation schedules the next prompt and pauses at lunch', async ({ page }) => {
  await page.goto('/instructor');
  await page.getByTestId('all-here').click();
  await expect(page.getByTestId('headcount-confirmed')).toContainText('Next prompt at 10:30');
  await expect(page.getByTestId('all-here')).toBeDisabled();
  await page.getByTestId('lesson-time').fill('11:45');
  await expect(page.getByTestId('headcount-paused')).toBeVisible();
  await expect(page.getByTestId('headcount-panel')).toHaveCount(0);
  await page.getByTestId('lesson-time').fill('12:45');
  await page.getByTestId('someone-missing').click();
  await page.getByTestId('report-child-ava').click();
  await expect(page.getByTestId('missing-form')).toBeVisible();
});

test('a missing report appears in patrol while browsing and duplicates are blocked', async ({ page }) => {
  await page.goto('/instructor/report-missing/child-ava');
  await page.getByTestId('last-seen').fill('2026-12-12T15:30');
  await page.getByTestId('last-place').fill('Learning area');
  await page.getByTestId('reported-clothing').fill('Yellow jacket');
  await page.getByTestId('reported-helmet').fill('Black helmet');
  await page.getByTestId('equipment').fill('Skis');
  await page.getByTestId('report-notes').fill('Reported over the radio.');
  await page.getByTestId('submit-report').click();
  await expect(page.getByTestId('report-success')).toBeVisible();
  await page.getByTestId('patrol-nav').click();
  const incident = page.locator('article').filter({ hasText: 'Ava Chen' });
  await expect(incident).toContainText('Escalate by 16:00');
  await incident.getByRole('link').click();
  await expect(page.getByTestId('escalation')).toContainText('16:00');
  await page.getByTestId('instructor-nav').click();
  await page.getByTestId('report-child-ava').click();
  await expect(page.getByTestId('existing-incident')).toBeVisible();
});

test('patrol sees both clothing descriptions, contacts and a timed action history', async ({ page }) => {
  await page.goto('/patrol/incidents/incident-owen');
  await expect(page.getByTestId('clothing-comparison')).toContainText('Blue jacket · White helmet');
  await expect(page.getByTestId('clothing-comparison')).toContainText('Red jacket · Blue helmet');
  await expect(page.getByTestId('escalation')).toContainText('15:30');
  await expect(page.getByTestId('contact-604-555-0103')).toHaveAttribute('href', 'tel:604-555-0103');
  await page.getByTestId('action-type').selectOption('Family contacted');
  await page.getByTestId('action-note').fill('Called both contacts by radio procedure.');
  await page.getByTestId('add-action').click();
  await expect(page.getByTestId('incident-timeline')).toContainText('Family contacted');
  await page.getByTestId('action-type').selectOption('Shared with police or rescuers');
  await page.getByTestId('action-note').fill('Information shared by the patroller.');
  await page.getByTestId('add-action').click();
  await expect(page.getByTestId('notice-task')).toBeVisible();
  await page.getByTestId('located-place').fill('Pigeon Chair base');
  await page.getByTestId('status-located').click();
  await expect(page.getByTestId('incident-timeline')).toContainText('Status changed to Located');
  await page.getByTestId('status-closed').click();
  await expect(page.getByTestId('incident-timeline')).toContainText('Status changed to Closed');
  await page.getByTestId('patrol-nav').click();
  await expect(page.getByTestId('no-open-incidents')).toBeVisible();
  await expect(page.getByTestId('history-incident-owen')).toContainText('Closed');
});

test('radio search exposes minimal details and can open an incident', async ({ page }) => {
  await page.goto('/patrol');
  await page.getByTestId('child-search').fill('Lily');
  const results = page.getByTestId('search-results');
  await expect(results).toContainText('Lily Whitfield');
  await expect(results).not.toContainText('604-');
  await expect(results).not.toContainText('Purple jacket');
  await page.getByTestId('select-child-lily').click();
  await page.getByTestId('last-place').fill('Base lodge');
  await page.getByTestId('reported-clothing').fill('Unknown');
  await page.getByTestId('reported-helmet').fill('Unknown');
  await page.getByTestId('equipment').fill('Unknown');
  await page.getByTestId('submit-report').click();
  await expect(page.getByTestId('incident-timeline')).toContainText('Missing report opened');
  await expect(page.getByTestId('incident-timeline')).toContainText('Casey Brooks');
});

test('unknown incident and empty lesson day are clear', async ({ page }) => {
  await page.goto('/patrol/incidents/not-a-real-incident');
  await expect(page.getByTestId('incident-not-found')).toBeVisible();
  await page.getByTestId('instructor-nav').click();
  await page.getByTestId('lesson-day').fill('2026-12-13');
  await expect(page.getByTestId('empty-roster')).toBeVisible();
});


test('Group 14 shows Tyler and Owen asthma information', async ({ page }) => {
  await page.goto('/instructor');
  await expect(page.getByTestId('safety-workspace')).toContainText('Tyler Ng');
  await expect(page.getByTestId('safety-workspace')).toContainText('Group 14');
  await expect(page.getByTestId('alert-child-owen')).toContainText('Asthma');
  await expect(page.getByTestId('alert-child-owen')).toContainText('Inhaler');
});

test('preview rejects another lesson day and prevents skipping Located', async ({ page }) => {
  await page.goto('/instructor/report-missing/child-ava');
  await page.getByTestId('last-seen').fill('2026-12-13T14:30');
  await page.getByTestId('last-place').fill('Pigeon Chair');
  await page.getByTestId('reported-clothing').fill('Unknown');
  await page.getByTestId('reported-helmet').fill('Unknown');
  await page.getByTestId('equipment').fill('Unknown');
  await page.getByTestId('submit-report').click();
  await expect(page.getByTestId('report-error')).toContainText('lesson day');
  await expect(page.getByTestId('report-success')).toHaveCount(0);
  await page.goto('/patrol/incidents/incident-owen');
  await expect(page.getByTestId('status-closed')).toBeDisabled();
  await page.getByTestId('located-place').fill('Pigeon Chair base');
  await page.getByTestId('status-located').click();
  await expect(page.getByTestId('status-open')).toBeDisabled();
  await page.getByTestId('status-closed').click();
  await expect(page.getByTestId('add-action')).toBeDisabled();
});
