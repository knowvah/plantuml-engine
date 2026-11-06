# ubt-T2c / batch-2 close

## Observation: ogc-captured sequence rows have no diff-baseline row
- **Context**: pinning jovijo-34-zaro482 (sequence, newly conformant).
- **Finding**: `oracle/goldens/svg-sequence/diff-baseline.json` holds 1143 rows, all pinned; the ~94 rows ogc captured later have none, so `plans/sequence-divergence-drive/tools/pin-goldens.mts` refuses them ("no diff-baseline.json row").
- **Impact**: a sequence row that becomes conformant cannot be pinned with the existing tool until the diff-baseline gains its row.
- **Confidence**: High

## Observation: regenerate docs/parity-report.md AFTER the batch-close survey
- **Context**: the D9 drift gate failed at batch-2 close.
- **Finding**: `npm run svg:survey` rewrites the committed `tests/oracle/svg-conformance/parity-*.json`; a report generated before it drifts.
- **Impact**: close order is survey, then `npm run parity:dashboard`, then the test.
- **Confidence**: High
