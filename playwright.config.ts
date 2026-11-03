import { defineConfig, devices } from '@playwright/test';

import { DOCS_SITE_PORT } from './tests/helpers/docs-site.js';

const DEMO_APP_PORT = 5173;

export default defineConfig({
  testDir: 'tests/e2e',
  // Playwright empties outputDir before every run. The default is
  // `test-results/`, which holds the committed dot-cache and gitignored
  // oracle baselines that cannot be regenerated -- never point it there.
  outputDir: 'playwright-results',
  use: {
    browserName: 'chromium',
    // Playwright derives baseURL from `port` only for a single webServer entry,
    // and this config has two; specs navigating to '/' need the demo app.
    baseURL: `http://localhost:${DEMO_APP_PORT}`,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      port: DEMO_APP_PORT,
      reuseExistingServer: !process.env['CI'],
    },
    {
      command: `npm run docs:dev -- --port ${DOCS_SITE_PORT} --strictPort`,
      port: DOCS_SITE_PORT,
      reuseExistingServer: !process.env['CI'],
    },
  ],
});
