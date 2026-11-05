# T4b — Every row to zero

**Do:** `npx jiti plans/chart-engine-port/measurements/row-diffs.mts /tmp/cep-T4a/parity-chart.json /tmp/cep-T4a/diffs.json`, group the remaining diffs by mechanism, read the Java for each, and fix at the origin. One commit per mechanism if there is more than one.

Planning found no row with a mechanism outside the port, so a residual is a transcription error or a shared-klimt defect until proven otherwise. A klimt defect is fixed with its Java quote, and `verdict-diff` at batch close names what else it moved.

**Watch:** `compareSvg` cannot see a root's `width` or `height` (`.claude/memory/c4dd-status.md`), so check `silazi-01`'s and `fugupe-37`'s canvas against `in.svg` by hand.

## Acceptance
- Given the survey, then `chart` is 29 conformant, or each exception has a journal line and an end by D8.
- Given each conformant row, then `row-diffs` lists no diffs, and root `width` and `height` equal `in.svg`'s on the two rows above.

Observability N/A. Rollback Reversible.
