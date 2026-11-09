import { defineConfig, devices } from '@playwright/test';
import { randomBytes } from 'node:crypto';

if (!process.env.PIEZAS_TEST_API_KEY || !process.env.SAFETY_PRACTICE_APP_ID) {
  throw new Error('Practice checks require a test key and an explicitly verified SAFETY_PRACTICE_APP_ID.');
}
const namespace = process.env.SAFETY_PRACTICE_NAMESPACE || `check_${randomBytes(12).toString('hex')}`;
process.env.SAFETY_PRACTICE_NAMESPACE = namespace;

export default defineConfig({
  testDir: './tests/scenarios',
  testMatch: /S-04[23]-.*\.spec\.ts/,
  workers: 1,
  fullyParallel: false,
  timeout: 90000,
  expect: { timeout: 15000 },
  reporter: 'list',
  outputDir: '.piezas/test-results/practice',
  use: { baseURL: 'http://localhost:3102', screenshot: 'only-on-failure' },
  projects: [{ name: 'practice-chromium', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: {
    command: 'node node_modules/next/dist/bin/next start --port 3102',
    port: 3102,
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      PIEZAS_API_KEY: process.env.PIEZAS_TEST_API_KEY,
      PIEZAS_TEST_API_KEY: process.env.PIEZAS_TEST_API_KEY,
      SAFETY_PRACTICE_ENABLED: 'true',
      SAFETY_PRACTICE_APP_ID: process.env.SAFETY_PRACTICE_APP_ID,
      SAFETY_PRACTICE_NAMESPACE: namespace,
    },
  },
});
