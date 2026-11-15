## Observation: pinning rows into a ratchet drifts docs/parity-report.md
- **Context**: dogr batch-1 close, after pinning 55 `@startdot` rows with no `src/` change.
- **Finding**: The D9 drift gate (`tests/unit/scripts/parity-dashboard.test.ts`) failed: the report's per-type row shows the ratchet's pinned count and last-pin date (`scripts/parity-dashboard-goldens.ts:157`), so any change to a `ratchet.json` needs `npm run parity:dashboard`, not just a survey.
- **Impact**: Mission briefs that defer the dashboard to "batches with a survey" will hit a red gate on a pure pinning batch. Regenerate the report in the pinning task itself.
- **Confidence**: High

## Observation: an error-page pin pattern for a golden-based ratchet
- **Context**: dogr T1b, pinning 8 jar error-page rows into `svg-dot/ratchet.json`.
- **Finding**: Board/chart/bpm/wbs hold error pages in authored or diff baselines. A zero-diff ratchet can hold them in the same manifest instead: `jarError` + `weightedScore` + `diffCount` on the entry, AC1 and passthrough checks filtered to entries without `jarError`, plus a never-rises score, shape/message check and error parity via `setErrorPageObserver` (`tests/oracle/svg-conformance/dot.golden.ratchet.test.ts`). The pin tool's `--jar-error` path (`plans/dot-oracle-gap-rows/tools/pin-goldens.mts`) measures and copies the record.
- **Impact**: Other zero-diff ratchets with survey-conformant jar error pages can reuse this rather than leave those rows unpinned.
- **Confidence**: High
