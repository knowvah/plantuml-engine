# unknown-bucket-triage (ubt)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #119. Planned unattended on 2026-11-05 at `feature/parity-queue` `dbb996060`.

## Objective

Every non-conformant `unknown` row that the jar types as an engine we already draw, and that no other issue owns,
ends conformant or named with its mechanism. That is **18 rows**: 12 activity, 1 state and 1 sequence go to
conformant; 2 HCL rows and 2 sudoku rows are named in `DIVERGENCES.md` under rulings that already exist. Five
rows the issue counted belong to other issues and get a comment there (D1). Then pin every conformant `unknown`
row the activity, sequence and state ratchets can reach, lose no conformant row in any engine, and regenerate
`docs/parity-report.md`.

## Starting state, measured 2026-11-05 on `dbb996060`

A fresh `npm run svg:survey -- unknown --out /tmp/u119/parity-unknown.json` equals the committed file: 845
conformant, 5 structural-match, 198 diverged, and `ubt-moves.mjs` prints `lost 0` with no row moved.
`scope.mjs` places all 203 open rows: 18 here, 5 moved, the rest owned by #113/#147, #121, #123, #124, #127, #129,
#130, #131, #132, #135 or signed in the ledger.

| Rows | Diff, by mechanism | Evidence (read 2026-11-05) | Task |
|---|---|---|---|
| `cubixe-14`, `lacifo-03`, `mazuxi-71` | Diamond `fill` `#F1F1F1` against `<<#green>>`, `<<#red>>`, `<<#blue>>` | `CommandIf2.java:136-151`, `CommandElseIf2.java:147-151`, `CommandEndif3.java:93-96`, `CommandRepeat3.java:118-126` read `Stereogroup#getInnerColors`. Ours reads it only for an action body (`dispatch-multiline-body.ts:71`) | T1a |
| `gucipa-88`, `ticini-08`, `xebuce-87`, `xevumo-18` | `<<color>>` on a box: `stroke-width` 0.5 against `LineThickness 2`, `font-size` 12 against 11, no `font-family` | `FtileBox.java:146-171` merges one `Style` via `withTOBECHANGED(stereotype)` and reads stroke, font, padding from it. Ours reads back, line and font colour one property at a time (`activity-scoped-colors.ts:78-105`). Probe `b1`: `:x; <<color>>` alone shows it, no `repeat` needed | T1b |
| `bezogu-47`, `jutesi-96`, `legoda-27`, `rurufo-83`, `tivado-46` | `rectangle <$react{scale=N}>`: group rect 20×54 against the sprite's size; sprite `circle` stroke 1 against 1.5 | `CommandPartition3.java:150-160` makes the sprite the partition name (and the bracket warning, which we already draw). `SvgNanoParser.java:186-195` sets a stroke only when the element has `stroke-width`, so the circle inherits the group's 1.5 | T2a |
| `lofabo-38` | Creole table rules in a composite state's description: 1 against 0.5 | `Cluster.java:450-502` (`drawUState`) draws the description on the ambient `ug`. Ours: `renderer-box-runs.ts:185-187`, `TABLE_RULE_WIDTH = 1` unless the caller passes one | T2b |
| `teoz-ng-001-17` | Every element but a top-level `note left` sits 3 px left of the jar's | Not yet diagnosed: the note placement differs | T2c |
| `jubete-32`, `vocago-35` | HCL, structural-match | Same source and oracle as `hcl/jubete-32` and `hcl/vocago-35` (`cmp`), already named in `DIVERGENCES.md:98-99` as the Smetana delta | T3a |
| `gazale-13`, `lazama-75` | `sudoku <seed>`: we draw the syntax-error page, the GPL jar draws a puzzle | User ruling 2026-10-13 (ufp D13): mirror the MIT edition, which removes the factory (`PSystemBuilder.java:161-164`). `README.md:79-89` says so; `DIVERGENCES.md` names no row | T3a |

**Moved out (D1):** `bitabu-34` uses `(*)` syntax (#123). `coruvi-63`, `nezaxe-99` and `tiseze-53` are a lone
`note right:`, which the legacy `ActivityDiagramFactory` (`PSystemBuilder.java:137`) accepts before
`ActivityDiagramFactory3` (`:140`): the jar SVG has `class="entity"` groups and a `start_entity`, svek output (#123).
`dijapi-54` is item 15 of #121.

**Pins today:** no `unknown` row in the activity, sequence or state ratchets (each test's doc says "NO `unknown`
tree"). Conformant `unknown` rows those engines draw: activity 37, sequence 51, state 4, some already pinned from a
byte-identical copy in their own bucket (T3c sorts them).

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits
this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**. Do not create another
branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base
sha named in the execution prompt, and tags `unknown-bucket-triage/pre-squash`. Never push: the user reviews, signs
and opens the PR for the whole branch.

## Quality gates (all four at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`npm test`, never `vitest run tests/unit`. New exports may need `npm run catalog` (drift-gated). A `vitest run
<paths>` that collects nothing exits 0: read the count.

## Measurement commands

Tools are under `plans/unknown-bucket-triage/measurements/`, plus three reused from
`plans/description-divergence-drive/measurements/`. Run with `node` or `npx jiti`. Type commands literally: the
allowlist has no `bash plans/...`, `date`, or shell-variable prefixes. Producers run **alone**
(`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- Survey a bucket, always with `--out`: `npm run svg:survey -- unknown --out /tmp/ubt-<task>/parity-unknown.json`
  (about a minute). A positional type with no `--out` clobbers `parity.json`.
- `node plans/unknown-bucket-triage/measurements/ubt-moves.mjs /tmp/ubt-b0/parity-unknown.json /tmp/ubt-<task>/parity-unknown.json`:
  moved rows; exit 1 on a loss. Works for any bucket's pair of files.
- `npx jiti plans/unknown-bucket-triage/measurements/row-diffs.mts /tmp/ubt-<task>/parity-unknown.json /tmp/ubt-<task>/diffs.json [slug ...]`:
  every diff of the rows, and our SVG beside the JSON.
- `node plans/unknown-bucket-triage/measurements/scope.mjs /tmp/ubt-<task>/parity-unknown.json --ubt`: the rows this
  mission owns, and the owner count of every open row.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every
  engine, at batch close. Exit 1 on a loss.
- `npx jiti plans/description-divergence-drive/measurements/measure-diff-baseline.mts`.
- `scripts/oracle-render.sh <out-dir> <puml>` for an authored oracle, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D7: amend `decisions.md` with the date, then halt.
5. `@knowvah/dot-engine` needs a change. File it (`docs/graphviz-issues/` and `TRACKER.md`) and carry on with other
   rows; halt only if nothing else can move.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else
finishes. `oracle/accepted-divergences.json` is never edited here (the user signs). A file outside a task's
write-set is not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, or merging two whose rows turn out to share a mechanism.
- A residual diff a fix uncovers on these rows: `compareSvg` short-circuits, so expect some. Read the Java and fix
  it in the task that owns it, or add a task.
- Authored `.puml` fixtures and oracles where a branch has no corpus row.
- A correct fix that raises another row's diff count (`compareSvg` is not monotonic): journal the row with its
  mechanism.
- Helper splits forced by the 500-line, CCN or NLOC hooks.
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes, with its Java quote. A gain in another bucket counts for that bucket's
  issue: T4 comments there.
- T2c finding a mechanism that is genuinely large and separable: file a `queue:ready` issue with a "Blocked by"
  line added to #136 (D7), and journal the measurement that proves it.

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — activity stereogroups: colour and style](batch-1/overview.md) | T1a, T1b | [x] |
| [2 — sprite partition, state table, sequence note](batch-2/overview.md) | T2a-T2c | [x] |
| [3 — names, probes, pins](batch-3/overview.md) | T3a-T3c | [x] |
| [exit](batch-exit/overview.md) | T4 | [x] |
| [squash](batch-squash/overview.md) | T5 | [x] |

## Done when (issue #119)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its mechanism.
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md) — D1 to D7, operational readiness.
- [task-contract.md](task-contract.md) — what every task does and how it closes.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief and is
byte-identical to the live `.claude/settings.json`. It was deliberately not regenerated: editing it would break that
identity (the SessionStart hook compares them).

## Summary (2026-11-06)

**Tasks:** 9 of 9 planned (T0, T1a, T1b, T2a, T2b, T2c, T3a, T3b, T3c) plus T4; T5 squashes. T2a was restarted
from the Java after the first session's background agent was killed (journal rows 17, 21).

**Rows (D1's 18):** conformant 14 — cubixe-14, lacifo-03, mazuxi-71 (T1a); gucipa-88, ticini-08, xebuce-87,
xevumo-18 (T1b); bezogu-47, jutesi-96, legoda-27, rurufo-83, tivado-46 (T2a); lofabo-38 (T2b); teoz-ng-001-17
(T2c). Named in `DIVERGENCES.md` 4 — jubete-32, vocago-35 (Smetana delta, byte-identical to the `hcl/` rows);
gazale-13, lazama-75 (MIT edition, ruling ufp D13). Moved with comments: bitabu-34, coruvi-63, nezaxe-99,
tiseze-53 (#123), dijapi-54 (#121). `scope.mjs --ubt` lists only the four named rows, no `??`.

**Verdicts, base `dbb996060` → final:** unknown 845/5/198 → 859/4/185; activity 595/37/246 → 605/37/236;
sequence 1228/5/4 → 1229/4/4; state 298/0/1 unchanged. `verdict-diff`: lost 0, timeout/errored 0 in every engine.
Shared fixes also moved activity +10 and sequence jovijo-34 (commented on #121, #139).

**Pins added:** activity 11 (T1a 5, T1b 6, own bucket) + 49 unknown-tree; sequence 52 unknown-tree; state 5
unknown-tree. Every conformant `unknown` row those engines draw is pinned (106).

**Gates:** batch 1 close 2008 files; batch 2 close 2011 files / 42253 tests after one fix (the parity-report
drift gate, report regenerated after the survey); batch 3 close 2013 files / 42377 tests; typecheck, lint, build,
`format:check` green at every close. Final gate run: see the journal's close-out row.

**Decisions:** 28 journal rows; D4's citation corrected (T2b). Flagged for review: row 20 (`skinparam
stateBorderThickness` falls back after `<style>`, where upstream's later declaration wins), row 28 (the dashboard's
`unknown` ratchet cell stays 366 because engine families count their own `unknown`-tree pins), the public
`dist/plantuml-ts.d.ts` growth from T1b (next-missions follow-on 6).

**CI risk:** the queue's pins since #146 and these 117 are unmeasured on the runner until the first PR run; the
slowest shard was 506 s of 600 s on #146. Locally the three ratchets moved 3.63→3.80 s, 14.89→15.99 s,
2.53→2.55 s.

**Follow-ons:** `planning/next-missions.md`, "unknown-bucket-triage (ubt)".
