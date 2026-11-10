// piezas-scenario: S-051
// S-051: Nordic screens stay readable on phones and desktops
//   Given a signed-in parent, instructor, desk worker, patroller or admin
//   When they open their dashboard at phone and desktop widths and use the workspace navigation
//   Then content fits the viewport, text meets AA contrast, the locally hosted Geist font loads, and keyboard focus is visible
//
import { test, expect } from '../scenario-test';
import { signIn } from '../sign-in';

// Read-only checks against the same Piezas TEST copy as the existing suite.
// No state reset is needed: this scenario never changes business records.
for (const width of [375, 1280]) {
  test(`S-051: Nordic dashboards are readable at ${width}px`, async ({ page }) => {
    test.setTimeout(180_000);
    for (const [role, email] of [
      ['parent', 'priya.shah@example.test'], ['instructor', 'jordan.lee@example.test'],
      ['desk', 'casey.morgan@example.test'], ['patrol', 'rob.fournier@example.test'],
      ['admin', 'hana.sato@example.test'],
    ]) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await signIn(page, email);
      await page.setViewportSize({ width, height: 900 });
      await page.getByRole('link', { name: `${role === 'parent' ? 'Parent' : role[0].toUpperCase() + role.slice(1)} workspace` }).click();
      await expect(page).toHaveURL(new RegExp(`/${role}(?:\\?|$)`));
      await expect(page.locator('main')).toBeVisible();
      const result = await page.evaluate(async () => {
        await document.fonts.ready;
        const rgb = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number);
        const luminance = (c: number[]) => c.slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0);
        const failures: string[] = [];
        for (const el of document.querySelectorAll('main *, .app-header *')) {
          if (!(el instanceof HTMLElement) || !el.getClientRects().length) continue;
          const text = [...el.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join('').trim();
          if (!text) continue;
          const style = getComputedStyle(el);
          let bg = [255, 255, 255];
          const ancestors: Element[] = [];
          for (let node: Element | null = el; node; node = node.parentElement) ancestors.unshift(node);
          for (const ancestor of ancestors) {
            const color = rgb(getComputedStyle(ancestor).backgroundColor);
            const alpha = color[3] ?? 1;
            bg = bg.map((v, i) => (color[i] ?? 0) * alpha + v * (1 - alpha));
          }
          const fg = rgb(style.color);
          const alpha = fg[3] ?? 1;
          const actual = bg.map((v, i) => fg[i] * alpha + v * (1 - alpha));
          const a = luminance(actual), b = luminance(bg);
          const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
          const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && parseInt(style.fontWeight) >= 700);
          if (ratio < (large ? 3 : 4.5)) failures.push(`${text.slice(0, 65)}: ${ratio.toFixed(2)}:1`);
        }
        return { failures, fits: document.documentElement.scrollWidth <= innerWidth, font: getComputedStyle(document.body).fontFamily, loaded: [...document.fonts].some(font => font.status === 'loaded' && /geist/i.test(font.family)) };
      });
      expect(result.fits, `${role} horizontal overflow`).toBe(true);
      expect(result.failures, `${role} contrast`).toEqual([]);
      expect(result.font).toMatch(/geist/i);
      expect(result.loaded, 'Geist loaded locally').toBe(true);
      const workspaceLink = page.getByRole('navigation').getByRole('link', {
        name: `${role === 'parent' ? 'Parent' : role[0].toUpperCase() + role.slice(1)} workspace`,
        exact: true,
      });
      await page.keyboard.press('Tab');
      await workspaceLink.focus();
      expect(await workspaceLink.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
      await page.screenshot({ path: `.piezas/test-results/nordic/${role}-${width}.png`, fullPage: true });
    }
  });
}
