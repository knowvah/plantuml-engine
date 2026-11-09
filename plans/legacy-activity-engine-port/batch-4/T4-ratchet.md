# T4 — ratchets and the DOT-parity gate

**Writes:** `tests/oracle/svg-conformance/render-fixture-activity-legacy.ts`,
`activity-legacy.golden.ratchet.test.ts`, `activity-legacy.diff-baseline.ratchet.test.ts`,
`oracle/goldens/svg-activity-legacy/**` (D7); `tests/oracle/activity-legacy-dot-parity.test.ts`,
`oracle/goldens/activity-legacy/<slug>/{input.puml,svek-N.dot}` (D5); `scripts/parity-dashboard-goldens.ts`
(`RATCHET_FAMILY`: `svg-activity-legacy` on `activity`, `unknown`, and a new `network` entry; `DIFF_BASELINE_FAMILY`
if a diff baseline exists); routing and refusal `goldens` twins; `plans/legacy-activity-engine-port/measurements/pin-legacy.mts`.
**Reads:** `board.golden.ratchet.test.ts`, `board.diff-baseline.ratchet.test.ts`, `render-fixture-board.ts`,
`plans/board-engine-port/measurements/pin-board.mts`, `tests/oracle/state-dot-parity.test.ts`,
`dot-parity-backlogs.ts`, `scripts/dot-sync-report.ts` (`--equal-list`).

## Steps

1. Copy board's ratchet trio with the legacy plugin substituted. Pins carry `type`; the render helper defaults to the
   survey's asset store.
2. `pin-legacy.mts --write`: every conformant row and authored fixture becomes a golden; a nonzero fixture goes in
   `diff-baseline.json` at its count (never-rises).
3. DOT parity: pin every row and fixture whose DOT `dot-sync-report` classes structurally EQUAL; the rest go in a
   size or structure backlog that can only shrink, as state's does.
4. Time both ratchets and the DOT gate locally at `uptime` below ~10 and journal the wall time (CI risk).

## Acceptance
- Given `npm test`, then the three new suites pass and collect the expected counts (read them).
- Given `npx tsx scripts/parity-dashboard.ts` (read its header for the exact command), then `activity`, `unknown` and
  `network` show the new pins and `unmappedGoldenFamilies` is empty.

Observability: N/A — no new observable operations. Rollback: Reversible.
