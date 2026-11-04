# T6 — grow the activity baselines

Commit: `chore(oracle): add the new activity rows to their baselines`.

## Context
`activity.text-baseline.test.ts:121-127` and `activity.swimlane-baseline.test.ts:157-164` assert the baseline
lists exactly the committed fixtures, so 429 new rows turn both red. Nothing here may rise. See
[D6](../decisions.md). `scripts/repin-activity-baselines.ts` promotes `error` rows to `baseline`, but does not
add a slug, so add4 T0b seeded first with a scratch runner.

## Task

1. Write `plans/oracle-gap-capture/measurements/seed-activity.mts`: for each new activity fixture, append to
   `oracle/goldens/svg-activity/{diff,style,text}-baseline.json`, and to `swimlane-baseline.json` if the source
   passes `hasSwimlaneLine`. A jar error row gets `status: "jar-error"` (the trial has none in this bucket, since
   D2 sends them to `unknown`). Every other row gets `status: "error"`, with `reason` and `diffCount: null` in the
   existing key order, a `measuredAt` and `measuredAgainstCommit`, as `romuru-66-samu329`. The seed reason names
   the row's ledger reason, or `seeded by ogc-T6; promotion pass measures it`.
2. `npx tsx scripts/repin-activity-baselines.ts` (dry), then `--write`. Never pass `--accept-rises`. It prints
   promotions. Expect about 301 of 429 promoted, and 128 stay `error` (the T4 rows).
3. `git diff --numstat oracle/goldens/svg-activity/`: confirm no pre-existing row changed. A row changing is stop
   condition 3. Compare a parse of the old rows against `git show HEAD:`.
4. Re-derive the counts in `activity.diff-baseline.ratchet.test.ts`, `activity.style-baseline.test.ts`,
   `activity.text-baseline.test.ts` and `activity.swimlane-baseline.test.ts` with derivation comments in the existing
   style: 449 becomes 878, and each partition is what step 2 printed.
5. `npx vitest run tests/oracle/svg-conformance/activity.` and read the collected count.

## Write-set
The four baselines, the four tests, the seed script. `diff-census.json` stays as it is: the tool's own header says it
is a manual close-out narrative, and no gate reads it.

## Read-set
[D6](../decisions.md), `scripts/repin-activity-baselines.ts:1-64`, `scripts/repin-activity-promote-run.ts`, commit
`a8d6b3b70`, `plans/activity-divergence-drive-4/decision-journal.md` row 5.

## Interface contracts
Input: T5's installed cache and T4's ledger.

## Acceptance
- Given the seed and promotion, when the four activity suites run, then all are green and every row of the old 449 is
  byte-identical to `git show HEAD:`.
- Given a promoted row, then its `weightedScore` is a measured number and no pre-existing `weightedScore` rose.
- Given a row left `error`, then its `reason` is present and non-empty (`activity.diff-baseline.ratchet.test.ts:473`).

Observability: N/A — no new observable operations. Rollback: Reversible.
