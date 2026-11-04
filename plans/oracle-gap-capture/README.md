# oracle-gap-capture (ogc)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then
[decisions.md](decisions.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #109. Planned unattended on 2026-11-03 at `feature/parity-queue` `3aa0593e6`.

## Objective

Give every fixture in `tests/visual/data/*.json` a jar oracle or a recorded reason, with a test
that fails on a fixture with neither. Capture the 1,016 that have neither, count the new
non-conformant rows per bucket, and record them on the issue that owns each bucket. **Nothing
under `src/` moves: these rows are measured here and fixed by later issues.**

## Why they were never captured (D1)

No fixture was ever excluded on purpose. Each capture pass selected its fixtures another way, and
these 1,016 fell between the passes. The jar renders them: 1,015 of 1,016 wrote one usable SVG in a
trial, and the last wrote two pages. Full artifact: [D1](decisions.md).

## Starting state, measured 2026-11-03 on `3aa0593e6`

| Finding | Evidence | Task |
|---|---|---|
| 5,855 manifest rows: 4,629 cached in their own bucket, 210 in another, **1,016 in none** | [D1](decisions.md) | T1, T3 |
| The manifest bucket is wrong for most of them: of 373 `sequence` rows, 63 are SEQUENCE by the jar | jar's `data-diagram-type` in the trial | D2 |
| Trial verdicts: 554 conformant (74 of them error pages), 75 structural, 360 diverged, 26 draw where the jar errors | `measurements/trial-rows.json` | T8 |
| The pin tool refuses 193 rows until each has a cited excuse | `pin-corpus-tree --dry` per bucket | T4 |
| 23 tests in 7 files go red on contact | vitest over the merged tree | T5–T8 |
| `hcl/array-values` and `hcl/function-call` are two different sources under one slug | `tests/fixtures/hcl/` against the manifest | T7 |

**Not in the issue:** activity reads 449/0/0 today and will read about 594/37/247. The survey, not
the engine, changed. The issue's table counts by manifest bucket, and rows land by jar type (D2).

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the
driver. T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no
worktrees** (D9). Do not create another branch or merge main into this one. The squash batch
collapses the mission to **one commit** on the mission base sha named in the execution prompt, and
tags `ogc/pre-squash`. Never push: the user reviews, signs and opens the PR for the whole branch.

## Quality gates (all four at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
```

`npm test`, never `vitest run tests/unit`. New exports may need `npm run catalog` (drift-gated).
A `vitest run <paths>` that collects nothing exits 0: read the count. Batch 2 is red between its
tasks on purpose; it must be green at its close.

## Measurement commands

All under `plans/oracle-gap-capture/measurements/`, run with `node`, each states its usage. Type
commands literally: the allowlist has no entry for `bash plans/...`, `date`, or shell-variable
prefixes. Producers run **alone**, `uptime` below ~10.

- `measure-buckets.mjs survey|census [out-dir]`: the 10 buckets that gain rows.
- `new-rows.mjs <base> [survey-dir] [out-json]`: the cohort table for T9. Tested on trial data.
- `verdict-diff.mjs <base>`: exit 1 on a lost conformant row or a timeout/errored verdict.
- `pins-vs-census.mjs`: exit 1 on a ratchet pin that reads nonzero.
- `check-route.mjs <report>`: the capture against the trial.
- `run-stock-verify.mjs [draws-out]`: `scripts/stock-jar-verify.sh` through node, with the cached jar.
- A positional survey type with no `--out` overwrites `parity.json`: always pass `--out`.

## Stop conditions (halt, journal, report)

1. Any change under `src/` looks necessary. That is an engine change, out of scope.
2. A conformant row leaves conformant (`verdict-diff.mjs` reports a loss), or a `timeout`/`errored`
   verdict survives one rerun alone at load below 8.
3. A pre-existing pin row would change, an activity `weightedScore` would rise, or a ratchet pin
   reads nonzero and you cannot state the mechanism with `file:line`. Never re-pin an old row to
   make it agree, and never pass `--accept-rises`.
4. `oracle/dist/stock/plantuml-stock-<sha>.jar` is absent. Building it is not this mission's work.
5. The same gate fails on 2 consecutive fix attempts, or a finding contradicts D1–D9 (amend
   `decisions.md` with the date, then halt).

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the rows, and
everything else finishes. `oracle/accepted-divergences.json` is never edited here (the user signs).
A file outside a task's write-set is not a stop either: change it and journal why.

## Push-forward (decide, journal, continue)

- A capture result that differs from the trial with no lost row: record the row and its mechanism.
- A jar that fails on a fixture: a row in `oracle/no-oracle-reasons.json` with what the jar did.
- Helper splits forced by the 500-line, CCN or NLOC hooks.
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Rewording a dashboard note the numbers disprove, or a test comment's derivation.
- The pin tool's `$comment` suffix naming `unknown-bucket-routing-repair`: leave it, its text is
  hard-coded and add4 lived with it.
- Filing observations in `.agent-notes/`, including ones that belong to later issues.

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief](batch-0/overview.md) | T0 | [x] |
| [1 — the gate and the tool](batch-1/overview.md) | T1, T2 | [x] |
| [2 — capture and pin](batch-2/overview.md) | T3, T4a–c, T5, T6, T7 | [x] |
| [3 — measure and record](batch-3/overview.md) | T8, T9 | [x] |
| [exit](batch-exit/overview.md) | T10 | [x] |
| [squash](batch-squash/overview.md) | T11 | [x] |

## Done when (issue #109)

- [x] Every manifest fixture has an oracle or a recorded reason, and a test fails on a fixture with
      neither. (journal rows 14, 20: `oracle-coverage.test.ts` 4/4, 5855 of 5855 oracled; a renamed-away row fails it by name)
- [x] New non-conformant rows are counted per bucket and recorded on that bucket's issue, without
      being fixed in this mission. (journal rows 20, 21: `measurements/new-rows.md`, 7 comments, issues #139-#143; `src/` diff empty)
- [x] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` pass. (journal rows 5, 19, 22, 23)

## Documents

- [decisions.md](decisions.md) — D1–D9, operational readiness.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief and
is byte-identical to the live `.claude/settings.json`. It was deliberately not regenerated, because
editing it would break that identity (SessionStart hook compares them).

## Summary (T10, 2026-11-04)

- **Tasks:** 12 of 12 planned (T0-T11), plus two fix commits the gates required (`fix(T2)`: the stage
  path must be absolute; `fix(T4b)`: the pin tool measured ELK sources without the gates' backend) and
  one batch-2 fix (`fix(ogc-b2)`: three unit suites that walk the cache). Decisions: 23 journal rows; D7
  amended (activity's zero-diff rows must be frozen, the gate forbids a 0-diff `baseline` row).
- **Gates:** batch 1 38245 tests; batch 2 40126; batch 3 40128 (1926 files, branches 93.21 / functions
  98.07 / lines 98.26); typecheck, lint, build green at every close. verdict-diff: lost 0; pins-vs-census: 0
  nonzero; `src/` and `oracle/accepted-divergences.json` diffs against the base: empty.
- **Measured against the trial:** capture 1016 of 1016, 0 rows differ in placement (activity 429, unknown
  223, class 151, sequence 94, dot 57, state 26, timing 19, hcl 12, yaml 4, object 1). Survey cohorts
  identical to the trial table except sequence conformant 84 -> 85 (`xobebi-29-jilu859`, the two-page row the
  trial could not measure) and total 1015 -> 1016. Pins: routing 9187 / 546 / 162 of 9895, refusal 9449
  rendering / 446 erroring / 352 known-gap; activity baselines 878 (578 pinned, 157 baseline, 129 error,
  14 jar-error); json-family positional 94, structural clean 191; stock record 214.
- **Routing and refusal wall clock:** 82 s and 80 s for routing + refusal + coverage together (1044 tests)
  after the capture; batch 1's per-file timing was not captured by the default reporter (the whole suite ran
  in 380 s at batch 2 and 3 against the trial's 277 s CI reference).
- **CI risk, unmeasured here (no push):** routing and refusal walk 9895 rows, 13% more than 8735, and the
  activity suites add 429 per-fixture tests (878 fixtures). The 600 s budget and the 12-minute step cap in
  `routing-conformance.test.ts:457-462` are first exercised by the PR's own run.
- **Known follow-ups:** #139 sequence, #140 class, #141 dot, #142 hcl+yaml (`queue:ready`, chained on
  #136), #143 needs-ruling (26 draws-where-jar-errors rows, release jar exit 200 on each); the 128 activity
  rows that stay `error` belong to #123 (114) and #121 (14); `.agent-notes/ogc-T9.md`.
