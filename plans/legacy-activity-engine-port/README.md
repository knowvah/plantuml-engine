# legacy-activity-engine-port (laep)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #123. Planned unattended on 2026-11-06 at `feature/parity-queue` `2313f74e0`.

## Objective

Port upstream's legacy activity engine (`net/sourceforge/plantuml/activitydiagram/`, the `(*) -->` syntax) file for
file onto our `CucaDiagram` base, render it through a svek pipeline built from the shared `src/core/svek/` modules,
and register it at `PSystemBuilder.java:137`, between class and description (D1 to D4). Take the **124 legacy rows**
to conformant or a named end (D8), author probes past them (D6), and pin everything in a new `svg-activity-legacy`
ratchet plus a DOT-parity gate. Lose no conformant row in any engine, and regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-06 on `2313f74e0`

No engine accepts the legacy syntax: `src/registered-plugins.ts:110-121` says so, and every legacy source gets an
error page or a misroute. A legacy row is one whose cached oracle has `data-diagram-type="ACTIVITY"` **and** a
`svek-N.dot`: activitydiagram3 never reaches graphviz. `measurements/legacy-rows.mjs` finds them
(`measurements/planning-rows.json`):

| Bucket | Rows | Verdicts today | Why they are in that bucket |
|---|---|---|---|
| `activity` | 118 | 0 / 0 / 118 diverged | 113 from #109's ledger (`unknown-ledger/ogc-T4a.json`, cohort `ogc-legacy-activity`), plus `nadata-32`, `radute-87`, `sacedo-05`, `mugupa-02` (#121's comment) and `bizese-04` |
| `unknown` | 4 | 4 diverged | `bitabu-34` uses `(*)`; `coruvi-63`, `nezaxe-99`, `tiseze-53` are a lone `note right:` (#119's comment on #123) |
| `network` | 2 | 2 diverged | `janezo-95`, `rozemi-46`: the corpus classifier's keyword match (`scripts/classify-corpus.ts:110`) |

Plus one authored row: `activity__probe-legacy` in `oracle/goldens/diagram-style-scope.json`, 21 diffs, which must fall.

**Feature census of the 124** (sources matching): `if`/`endif` 46, arrow direction 43, `else` 41, arrow label 33,
`skinparam` 26, creole 23, sync bar 19, note 18, colour 17, long activity 14, partition 12, stereotype 9, URL 6,
title and chrome 6, `{{ }}` 6, `<style>` 3, `hide` 2. One row has two svek passes (an autarkic group, T2d).

**28 planning probes** in [probes/](probes/), rendered with `scripts/oracle-render.sh` on 2026-11-06: 27 draw a
legacy `ACTIVITY` diagram (a `start_entity` group and svek geometry), and `lap-url` is a jar error page. The lone
`note right: alone` (`lap-lone-note`) draws a legacy diagram with a `start_entity`, confirming #119's reading.

**What the Java does, read in planning** (every task still opens the Java and finds the line):

| Behaviour | Java | Task |
|---|---|---|
| Factory order: `FootboxIgnored`, common commands 1, `RankDir`, `Partition`, `EndPartition`, `LinkLongActivity`, note activity (single, multi), note on link (single, multi), `If`, `Else`, `Endif`, `LinkActivity`, `HideShow2`. `CommandInnerConcurrent` is commented out | `ActivityDiagramFactory.java:75-100` | T1a |
| `ActivityDiagram` sets no namespace separator; `start`/`end`/`end$<id>` quarks; branches are `#`-sequenced `BRANCH` leaves; `updateLasts` skips notes | `ActivityDiagram.java:67-118` | T1a |
| `createInnerActivity` opens an `INNER_ACTIVITY` group, reached from `CommandLinkActivity.java:317` in `getEntity` (`OPENBRACKET2`) | `ActivityDiagram.java:143-170` | T1b, T2d |
| Link regex: `FIRST` (STAR, CODE, BAR, QUOTED), stereotype, colour, URL, arrow body/style/direction, `[label]`, `FIRST2` (STAR2 with `top` or a digit, `{`, CODE2, BAR2, QUOTED2, QUOTED_INVISIBLE2), `in <partition>` | `CommandLinkActivity.java:79-118` | T1b |
| Long activity: an unterminated quote opens a multi-line description | `CommandLinkLongActivity.java:85-113` | T1c |
| `partition NAME [#color] [<<stereo>>] [{]` opens a `PACKAGE` group | `UBrexCommandPartition.java:66-127` | T1c |
| DOT: `nodesep` 20 and `ranksep` 40 for `ACTIVITY` (oracle `0.277778`, `0.555556`) | `DotStringFactory.java:243-258` | T2b |
| Autarkic groups render as a nested svek image, overriding the group to `ACTIVITY` | `CucaDiagramSimplifierActivity.java`, `GroupMakerActivity.java` | T2d |
| Leaf images: `NOTE`, `ACTIVITY`, `CIRCLE_START`, `CIRCLE_END`, `BRANCH`, `SYNCHRO_BAR` | `GeneralImageBuilder.java:118-189` | T2a |
| Arrow font defaults to 11 on `ACTIVITY` | `FontParam.java:158-160` | T2c |
| Oracle: start and end sit in `start_entity`/`end_entity` groups, a branch in `entity`, while an activity's `rect`/`text` are drawn with no group | `test-results/dot-cache/activity/bokuba-91-poda774/in.svg` | T2c |

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits
this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees** (D10). Do not create
another branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission
base sha named in the execution prompt, and tags `legacy-activity-engine-port/pre-squash`. Never push: the user
reviews, signs and pushes.

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`npm test`, never `vitest run tests/unit`. New exports need `npm run catalog` (drift-gated). A `vitest run <paths>`
that collects nothing exits 0: read the count. Baseline counts on `2313f74e0` are in
[decisions.md](decisions.md#baseline).

## Measurement commands

Run with `node` or `npx jiti`. Type commands literally: the allowlist has no `bash plans/...`, `date`, or
shell-variable prefixes. Producers run **alone** (`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd`
below the repo root.

- `node plans/legacy-activity-engine-port/measurements/legacy-rows.mjs <survey-dir> [--json <out>]`: the 124 rows
  with their verdicts and first diffs from that survey directory, and a count per bucket.
- Survey one bucket, always with `--out`: `npm run svg:survey -- activity --out /tmp/laep-<task>/parity-activity.json`
  (and `unknown`, `network`). A positional type with no `--out` clobbers `parity.json`.
- `node plans/board-engine-port/measurements/board-moves.mjs <base.json> <now.json>`: moved rows of one bucket, by
  slug; it is bucket-agnostic despite its name. Exit 1 on a loss.
- `npx jiti plans/board-engine-port/measurements/probe.mts <in.puml> <oracle.svg> [limit]`: one source against its
  oracle, through the survey's render options.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every
  engine, at batch close from batch 3 on. Exit 1 on a loss.
- `scripts/oracle-render.sh <out-dir> <puml...>` for an oracle, never a hand-typed `java -jar`. It writes the
  `svek-N.dot` files beside the SVGs; render one source per directory when you need its DOT.
- `npx tsx scripts/dot-sync-report.ts <type>` classifies DOT parity (read its header for the arguments).
- T2c writes `measurements/row-diffs.mts` (D9), a copy of `plans/board-engine-port/measurements/row-diffs.mts`
  reading the rows from `legacy-rows.mjs --json` instead of one bucket's cache.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary. `activity__probe-legacy` and the 124 rows'
   routing and refusal pins are expected to **move toward the jar**; a move away is this stop.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D11: amend `decisions.md` with the date, then halt. This includes any `dist/*.d.ts`
   change beyond an added plugin type.
5. `@knowvah/dot-engine` needs a change. File it (`docs/graphviz-issues/` and `TRACKER.md`) and carry on with other
   rows; halt only if nothing else can move.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else
finishes. `oracle/accepted-divergences.json` is never edited here (the user signs). A file outside a task's
write-set is not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that share a mechanism, or splitting one that runs past about 15 minutes. T3b is
  expected to split into one task per diff family.
- A residual diff a fix uncovers: `compareSvg` short-circuits, so expect some. Read the Java and fix it in the task
  that owns it, or add a task.
- More authored `.puml` fixtures and oracles where a command branch has no row.
- Reusing an existing `src/core/` port in place of a new one, or porting a missing shared helper into `src/core/`
  at its upstream package (D2). Journal which.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks (D11).
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes, with its Java quote. A gain in another bucket counts for that bucket's
  issue: T5 comments there, or leaves the text in `.agent-notes/` if the comment is denied.
- A mechanism that is genuinely large and separable: file a `queue:ready` issue, add a "Blocked by" line to #136,
  and journal the measurement that proves it (D8).

## Blast radius

**Data model:** none. **API:** no public change; `dist/*.d.ts` checked at T5. **Dependencies:** none new; the
engine reaches `@knowvah/dot-engine` through `src/core/graph-layout.ts#layoutGraph`, as state and description do.
**Routing** changes on purpose: a new factory at upstream's slot 5 claims sources no engine accepted (D3).
**SVG output** changes only for sources the jar draws as legacy activity.

| File | Action | Task |
|---|---|---|
| `src/diagrams/activity-legacy/{ActivityDiagram,ConditionalContext,ActivityDiagramFactory,index}.ts` | Create | T1a |
| `src/diagrams/activity-legacy/command/CommandLinkActivity.ts` | Create | T1b |
| `src/diagrams/activity-legacy/command/{CommandLinkLongActivity,UBrexCommandIf,UBrexCommandElse,UBrexCommandEndif,UBrexCommandPartition,UBrexCommandEndPartition}.ts` | Create | T1c |
| note commands (`CommandFactoryNoteActivity`, `CommandFactoryNoteOnLink`), in core or the engine (D2) | Create | T1d |
| `src/core/svek/image/{CircleStart,CircleEnd,EntityImageCircleStart,EntityImageCircleEnd,EntityImageBranch,EntityImageSynchroBar,EntityImageActivity}.ts` | Create | T2a |
| `src/diagrams/activity-legacy/{layout,activity-legacy-dot}.ts` | Create | T2b |
| `src/diagrams/activity-legacy/renderer*.ts`, `src/core/assemble-svg.ts` | Create, Modify | T2c |
| `src/diagrams/activity-legacy/{CucaDiagramSimplifierActivity,GroupMakerActivity}.ts` | Create | T2d |
| `tests/unit/activity-legacy/**` | Create | T1a to T2d |
| `src/registered-plugins.ts`, `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, their count tests, `oracle/goldens/diagram-style-scope.json` | Modify | T3a |
| `tests/fixtures/activity-legacy/**` | Create | T3c |
| `oracle/goldens/svg-activity-legacy/**`, `oracle/goldens/activity-legacy/**`, `tests/oracle/svg-conformance/activity-legacy.{golden,diff-baseline}.ratchet.test.ts`, `render-fixture-activity-legacy.ts`, `tests/oracle/activity-legacy-dot-parity.test.ts`, `scripts/parity-dashboard-goldens.ts` | Create, Modify | T4 |
| `tests/oracle/svg-conformance/parity-*.json`, `census-*.json`, `docs/parity-report.md`, `DIVERGENCES.md`, `planning/next-missions.md`, `docs/catalog.md` | Modify | T3a to T5 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — diagram and commands](batch-1/overview.md) | T1a, T1b, T1c, T1d | [x] |
| [2 — svek images, DOT, render](batch-2/overview.md) | T2a, T2b, T2c, T2d | [x] |
| [3 — turn on, drive rows, probes](batch-3/overview.md) | T3a, T3b, T3c | [x] |
| [4 — ratchet](batch-4/overview.md) | T4 | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [ ] |

## Done when (issue #123)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its mechanism.
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D11, operational readiness, baseline.
- [task-contract.md](task-contract.md): what every task does and how it closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/): the 28 planning probe sources. [measurements/](measurements/): `legacy-rows.mjs` and its
  planning output.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief and is
byte-identical to the live `.claude/settings.json`; it was deliberately not regenerated (the SessionStart hook
compares them).

## Summary (2026-11-09)

Finished in place by the orchestrating session after the user stopped the driver (journal 23); T6 squashes.

- **Tasks:** T0, T1a-T1d, T2a-T2d, T3a, T3b-1 to T3b-4, T3c, T3c-2, T4, T5 done; T1a-T1d and T3b split as planned.
- **Verdicts:** all 124 legacy rows diverged -> conformant: activity 118, unknown 4, network 2. Bucket totals
  activity 755/4/119 -> 873/4/1, unknown 860/4/184 -> 864/4/180, network 1/0/2 -> 3/0/0 (conformant /
  structural-match / diverged). All buckets 5,231 -> 5,355 of 5,927 conformant. 0 lost in any engine.
- **Authored:** 102 fixtures in `tests/fixtures/activity-legacy/`: 90 at zero, 8 jar error pages we also refuse, 4 open
  rows with named ends (`partition-link` #157, `pragma-elk` and `pragma-elk-if` #158, `pragma-smetana` the
  library-forced Smetana delta).
- **Pins:** `svg-activity-legacy` ratchet 124 rows + 102 authored; DOT-parity gate 214 fixtures (124 rows, 90 authored)
  structurally equal with exact node sizes, size backlog empty; routing/refusal +124 golden twins.
- **Gates:** final run at `7bf933463` (journal 26): all pass except `oracle-freshness`, failing only because native
  graphviz moved to 16.1.1 on this machine at 11:10 (skipped in CI). `dist/*.d.ts` byte-identical to the base.
- **Decisions to audit:** D1-D11; journal 20 (issue 43 retracted, dot-engine equals native); journal 24 (note on link
  sized from the drawn block, a defect T4's DOT pinning exposed); journal 25 (`printedDiagramType` moved off the
  public `RenderFragment`, stop 4 avoided by bringing the code back to D4's internal key).
- **Rows left:** none of the 124. Authored: the 4 open rows above.
- **Follow-ons:** `planning/next-missions.md` "legacy-activity-engine-port (laep)".
- **CI risk:** the two new ratchets and the DOT gate run in about 9 s locally at load 5; the routing and refusal parts
  gain 124 rows spread over 4 parts each.

