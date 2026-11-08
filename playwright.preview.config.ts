import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// Frontend-only checks; does not claim server authorization or Piezas coverage.
// PW_BROWSER_CHANNEL=chrome can use an installed browser on constrained machines.
export default defineConfig({
  ...base,
  testMatch: ['**/frontend.spec.ts', '**/instructor-patrol.preview.spec.ts'],
  projects: [{ name: 'preview-chromium', use: { browserName: 'chromium', channel: process.env.PW_BROWSER_CHANNEL } }],
});
