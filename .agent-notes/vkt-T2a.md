# vkt T2a — authored version-family rows (2026-11-21)

## Observation: "our error page" detectors matched any run equal to fullDescription()
- **Context**: measuring `cov-testdot` after T1a; the authored ratchet's error-parity test reads `isOurErrorPage`.
- **Finding**: seven copies of the detector (`render-fixture-utility.ts` x2, `render-fixture-factories.ts` x2, `refusal-coverage-gate.ts#weErroredIn`, `scripts/pin-corpus-tree-measure.ts`, `scripts/repin-sequence-baselines.ts`) tested `svg.includes('>' + fullDescription() + '</text>')`. The `testdot` page prints `fullDescription()` as its first line, black on white (upstream `PSystemVersion.java:236` does the same), so the row measured `weErrored: true` while the jar draws a page. The error banner is always bold italic in `MY_GREEN` (`src/core/error/error-page-exact.ts:73-78`). All seven now call `tests/helpers/our-error-banner.ts#hasOurErrorBanner`, which also requires `fill="#33FF02"` on the same `<text>`.
- **Impact**: any new page that prints `fullDescription()` stays a page to the gates. A new detector copy should import the helper (vitest-free, so `scripts/` can).
- **Confidence**: High (measured before/after; `tests/helpers/our-error-banner.test.ts` renders `straße` and `testdot`)

## Observation: build-authored-baseline.mts SPECS lag the committed manifest
- **Context**: `--write` for the ten new rows.
- **Finding**: a full regeneration rewrites 21 existing rows: the tool's reasons still say `plantuml-ts` (the rename `c32fc10b5` edited only the JSON), `cov-refuse-listsprite` still carries the pre-port `parityGap` (`5780add90` edited only the JSON), and `cov-refuse-about`, `cov-charlie-leading-tab` and `cov-noise-not-noise` measure 5 where the manifest pins 7, 6 and 7 — the same at the base `e490366c6` (measured in a temporary checkout), so the drift predates vkt. The ratchet allows a score below its pin, so nothing fails.
- **Impact**: do not `--write` blind. vkt inserted only its new rows and kept every existing row byte-identical; a cleanup should bring SPECS up to the JSON and re-pin the three rows (the "+2 class vs sequence" part of their reason is gone).
- **Confidence**: High

## Observation: a jar error-page oracle captured at minute 13 drew the banner decoration
- **Context**: rendering `cov-keyimport-refuse-dash` one file per run.
- **Finding**: 532x410 with 5 images at 17:13; re-rendered at 17:16, 532x284 with 1 image, as `cov-strasse`. This is the known `PSystemError.java:218-228` minute decoration (`cdd5-T0e-error-page-time-decoration.md`), not a vkt finding; noted because `oracle-render.sh` still has no guard.
- **Impact**: check every error-page oracle for extra `<image>`s before committing it.
- **Confidence**: High
