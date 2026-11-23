# T1: e2e spec, stdlib includes draw in the playground (red)

**Writes:** `tests/e2e/playground-stdlib.spec.ts`.
**Reads:** `tests/e2e/playground-export.spec.ts:1-45` (`openWith`, timeouts, `DOCS_SITE_URL`),
`playwright.config.ts`, decisions.md D1.

## Task

Write the spec before any playground change. Reuse `openWith`'s shape: navigate, wait for the first SVG, fill
`.pu-input`, then wait for the SVG to change. If the helper is needed by both specs, move it to
`tests/helpers/playground.ts` and import it from both.

Cases:

1. **Eager (C4).** A `C4_Container` diagram (`!include <C4/C4_Container>`, one `Person` and one `System` with a distinctive
   label). Assert that `.pu-svg svg` contains the label text, and that the page does not contain
   `not supported in renderSync`.
2. **Remote (awslib14).** The awslib14 counterpart of the issue's repro:
   `!include <awslib14/AWSCommon>`, `!include <awslib14/Storage/SimpleStorageService>`, then
   `SimpleStorageService(site, "www.insecurity.co", "")` (verify that the macro signature is at
   `assets/stdlib/awslib14/Storage/SimpleStorageService.puml:16`). Assert that `www.insecurity.co` is drawn.
3. **Chunk failure.** Use `page.route` to abort the request for the C4 chunk (match on the URL containing `c4`, after
   reading the dev-server URL in a passing run). Assert that `.pu-error` contains `Failed to load the 'C4' stdlib bundle`
   (or the case the registry reports; see `StdlibChunkLoadError`'s message at `StdlibRegistry.ts:68-72`).
4. **Issue repro, `aws` v1.** The issue's exact source, as `test.fixme`, with a comment citing D1 and the `needs-ruling`
   issue number. T5 fills the number in.

Render each fixture with `scripts/oracle-render.sh /tmp/ps-oracle <puml>` and confirm that every string asserted on is
in the oracle SVG. Journal the check.

## Acceptance
- Given the base playground, when `npx playwright test tests/e2e/playground-stdlib.spec.ts` runs, then cases 1-3 fail
  (record the failure lines in the journal), and case 4 is reported as fixme.
- Given each fixture, when rendered by the oracle, then the asserted text is present in its SVG.

Commit red: `test(docs): add a failing playground stdlib-include spec`, with `Refs: #172`.
Observability is N/A. Rollback is Reversible.
