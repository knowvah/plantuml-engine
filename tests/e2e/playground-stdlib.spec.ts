// `!include <bundle/…>` in the docs playground (issue #172). Every asserted
// string was checked against the oracle jar's SVG for the same source
// (scripts/oracle-render.sh; plans/playground-stdlib/decision-journal.md, T1).
import { test, expect, type Page } from '@playwright/test';

import { FIRST_LOAD_TIMEOUT_MS, openWith, PLAYGROUND_URL, TEST_TIMEOUT_MS } from '../helpers/playground.js';

const RENDER_SYNC_GUARD = 'not supported in renderSync';
// Playground.vue's toolbar indicator (role="status").
const PENDING_TEXT = 'Loading stdlib…';

/** A `<text>` whose whole content is `label`. The error page echoes the source
 *  line (`Person(visitor, "Wanderer")`), so a substring match passes on it. */
function drawnLabel(page: Page, label: string) {
  const exact = new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
  return page.locator('.pu-svg svg text', { hasText: exact });
}

// Eager bundle, from @knowvah/plantuml-stdlib (decisions.md D1).
const C4_DIAGRAM = `@startuml
!include <C4/C4_Container>
Person(visitor, "Wanderer")
System(engine, "Lighthouse")
Rel(visitor, engine, "Uses")
@enduml`;

// Remote bundle, served from /stdlib/awslib14/ (D2). The awslib14 counterpart
// of the issue's repro: SimpleStorageService(e_alias, e_label, e_techn) is
// declared at assets/stdlib/awslib14/Storage/SimpleStorageService.puml:16.
const AWSLIB14_DIAGRAM = `@startuml
!include <awslib14/AWSCommon>
!include <awslib14/Storage/SimpleStorageService>
SimpleStorageService(site, "www.insecurity.co", "")
@enduml`;

// The issue's exact repro. Legacy `aws` v1 is in no workspace package (si5b D2,
// plans/si5b-stdlib/decisions.md:22-26), so the playground cannot serve it.
// archimate is registered (D1), but the include prefetch walk fails on the
// relative include in Archimate.puml's dead `!if ($ARCH_LOCAL)` branch, so the
// library draws its include error page (knowvah/plantuml-engine#228).
const ARCHIMATE_DIAGRAM = `@startuml
!include <archimate/Archimate>
archimate #LightGreen "Competency" as SMC <<strategy-resource>>
@enduml`;

const AWS_V1_DIAGRAM = `@startuml
!include <aws/common>
!include <aws/Storage/AmazonS3/AmazonS3>
!include <aws/Storage/AmazonS3/bucket/bucket>

AMAZONS3(s3) {
    BUCKET(site,www.insecurity.co)
    BUCKET(logs,logs.insecurity.co)
}

site .r.> logs : events
@enduml`;

// The C4 chunk: `c4.js` on the dev server (packages/stdlib/generated/c4.js),
// `c4.<hash>.js` in a built site.
const C4_CHUNK = /\/c4(\.[\w-]+)?\.js(\?|$)/;

test.describe('playground stdlib includes', () => {
  test.describe.configure({ timeout: TEST_TIMEOUT_MS });

  test('draws an eager bundle (C4)', async ({ page }) => {
    await openWith(page, C4_DIAGRAM);
    await expect(drawnLabel(page, 'Wanderer')).toHaveCount(1);
    await expect(drawnLabel(page, 'Lighthouse')).toHaveCount(1);
    await expect(page.locator('.pu-output')).not.toContainText(RENDER_SYNC_GUARD);
  });

  test('draws a remote bundle (awslib14)', async ({ page }) => {
    await openWith(page, AWSLIB14_DIAGRAM);
    await expect(drawnLabel(page, 'www.insecurity.co')).toHaveCount(1);
    await expect(page.locator('.pu-output')).not.toContainText(RENDER_SYNC_GUARD);
  });

  test('shows a pending state while a chunk loads', async ({ page }) => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route(C4_CHUNK, async (route) => {
      await held;
      await route.continue();
    });
    await page.goto(PLAYGROUND_URL);
    await page.waitForSelector('.pu-svg svg', { timeout: FIRST_LOAD_TIMEOUT_MS });
    await page.fill('.pu-input', C4_DIAGRAM);
    await expect(page.getByRole('status')).toHaveText(PENDING_TEXT);
    // The previous drawing stays up while the chunk loads.
    await expect(page.locator('.pu-svg svg')).toHaveCount(1);
    release();
    await expect(drawnLabel(page, 'Wanderer')).toHaveCount(1);
    await expect(page.getByRole('status')).toHaveCount(0);
  });

  test('reports a chunk that fails to load in the error pane', async ({ page }) => {
    await page.route(C4_CHUNK, (route) => route.abort());
    await openWith(page, C4_DIAGRAM);
    // The walk asks the registry for the lowercased name
    // (src/core/stdlib-content.ts, `bundlesFor`), and StdlibChunkLoadError
    // names the bundle exactly as requested.
    await expect(page.locator('.pu-error')).toContainText("Failed to load the 'c4' stdlib bundle");
  });

  // Needs a maintainer ruling on packaging or serving legacy `aws` v1
  // (plans/playground-stdlib decisions.md D1; knowvah/plantuml-engine#226).
  test.fixme('draws the issue repro (legacy aws v1)', async ({ page }) => {
    await openWith(page, AWS_V1_DIAGRAM);
    await expect(drawnLabel(page, 'www.insecurity.co')).toHaveCount(1);
    await expect(drawnLabel(page, 'logs.insecurity.co')).toHaveCount(1);
  });

  // Needs a ruling on the include prefetch walk (knowvah/plantuml-engine#228).
  test.fixme('draws an archimate bundle diagram', async ({ page }) => {
    await openWith(page, ARCHIMATE_DIAGRAM);
    await expect(drawnLabel(page, 'Competency')).toHaveCount(1);
  });
});
