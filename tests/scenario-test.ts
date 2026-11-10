// Scenario tests import `test` from here. Against the Piezas TEST copy, each
// scenario starts from the demo fixtures: Piezas runs the scenarios one after
// another and retries a failure without resetting, so leftover state (a child
// already checked in, an open incident) would otherwise leak between them.
// Never resets the live app: the seed script uses PIEZAS_TEST_API_KEY only.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';
export type { Page } from '@playwright/test';

if (existsSync('.env')) for (const key of ['DEMO_ACCOUNT_SECRET', 'PIEZAS_TEST_API_KEY', 'PIEZAS_API_URL']) {
  if (!process.env[key]) process.loadEnvFile('.env');
}

const resetsTestCopy = process.env.KESTREL_DATA !== 'mock' && Boolean(process.env.PIEZAS_TEST_API_KEY) && process.env.SEED_TARGET !== 'live';

export const test = base.extend<{ freshTestData: void }>({
  freshTestData: [
    async ({ request }, use, testInfo) => {
      if (process.env.KESTREL_DATA === 'mock') {
        const needsCommunications = /S-045-|S-046-|S-047-|S-048-|S-050-/.test(testInfo.file);
        const response = await request.post('/api/test/reset', { data: { communications: needsCommunications } });
        if (!response.ok()) throw new Error(`Mock data reset failed (${response.status()}).`);
      } else if (resetsTestCopy) {
        execFileSync(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'scripts/seed.ts'], { stdio: 'pipe', env: { ...process.env, SEED_TARGET: '' } });
      }
      await use();
    },
    { auto: true },
  ],
});
