// piezas-scenario: S-028 v=6360850597c4
// S-028: The demo uses only fictional data
//   Given the live app's demo data
//   When a reviewer browses each role's screens
//   Then every person, number and address comes from the case's fake data or was invented, and no photos appear
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { expect, test } from '../scenario-test';
import { CHILD_IDS, DEMO_LESSON_DATE } from '../../lib/fixtures';
import { signIn } from '../sign-in';

const screens: [string, string[]][] = [
  ['priya.shah@example.test', ['/', '/parent', `/parent/children/${CHILD_IDS.ava}`]],
  ['jordan.lee@example.test', ['/', `/instructor?day=${DEMO_LESSON_DATE}`]],
  ['casey.morgan@example.test', ['/', `/desk?day=${DEMO_LESSON_DATE}`, `/desk/children/${CHILD_IDS.lily}?day=${DEMO_LESSON_DATE}`]],
  ['rob.fournier@example.test', ['/', `/patrol?day=${DEMO_LESSON_DATE}&q=a`]],
  ['hana.sato@example.test', ['/', `/admin?day=${DEMO_LESSON_DATE}`, '/admin/audit']],
];

test('S-028: every role screen shows only fictional emails, phone numbers and no photos', async ({ page }) => {
  for (const [email, paths] of screens) {
    await signIn(page, email);
    for (const path of paths) {
      await page.goto(path);
      await expect(page.getByTestId('current-user')).toBeVisible();
      const shown = await page.locator('body').evaluate((body: HTMLElement) => [
        body.innerText,
        ...[...body.querySelectorAll('input, textarea')].map((el) => (el as HTMLInputElement).value),
        ...[...body.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]')].map((a) => a.getAttribute('href') ?? ''),
      ].join('\n'));
      for (const address of shown.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g) ?? []) expect(address, `${email} ${path}`).toMatch(/@example\.test$/);
      for (const phone of shown.match(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}\b/g) ?? []) expect(phone, `${email} ${path}`).toMatch(/^604-555-01\d\d$/);
      // Pass QR codes are generated images, not photos; nothing else on the page may be an image.
      // (Queried in the document itself, so the dev-only Next.js overlay in its shadow root is not counted.)
      const images = await page.evaluate(() => [...document.querySelectorAll('img')].filter((img) => !(img.classList.contains('pass-qr') && img.src.startsWith('data:image/'))).map((img) => img.src));
      expect(images, `${email} ${path}`).toEqual([]);
    }
  }
});
