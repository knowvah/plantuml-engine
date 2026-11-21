import type { Page } from '@playwright/test';

import { DOCS_SITE_URL } from './docs-site.js';

/** The docs playground page (`docs-site/playground.md`). */
export const PLAYGROUND_URL = `${DOCS_SITE_URL}/playground`;
// The docs dev server compiles the whole library, unbundled, on first load, and
// that wait counts against the test's own timeout.
export const FIRST_LOAD_TIMEOUT_MS = 60_000;
export const TEST_TIMEOUT_MS = 90_000;

/** Opens the playground, waits for its default diagram, then types `source`
 *  and waits until the preview pane changes (a new SVG, or the error pane). */
export async function openWith(page: Page, source: string): Promise<void> {
  await page.goto(PLAYGROUND_URL);
  await page.waitForSelector('.pu-svg svg', { timeout: FIRST_LOAD_TIMEOUT_MS });
  const before = await page.$eval('.pu-svg', (host) => host.innerHTML);
  await page.fill('.pu-input', source);
  await page.waitForFunction((previous) => document.querySelector('.pu-svg')?.innerHTML !== previous, before);
}
