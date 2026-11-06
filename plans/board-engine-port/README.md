# board-engine-port (bep)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #118. Planned unattended on 2026-11-05 at `feature/parity-queue` `3d5d09396`.

## Objective

Replace `src/diagrams/board/` with a file-for-file port of `net/sourceforge/plantuml/board/` on the klimt layer, the way packet was ported (D1, D2). Take the **4 `board` rows** to conformant, author probes past them (D4), and pin everything in a new `svg-board` ratchet. Lose no conformant row in any engine, and regenerate `docs/parity-report.md`. A row that cannot reach the jar ends by D7, never unnamed.

## Starting state, measured 2026-11-05 on `3d5d09396`

`npm run svg:survey -- board --out /tmp/bdp-plan/parity-board.json` gives 4 rows, **0 conformant, 0 structural-match, 4 diverged**, first diff `svg/g[1]/rect[1]/@fill` on all four: identical verdicts and first diffs to the committed `parity-board.json`, so the issue's numbers hold. `row-diffs`: `gasaxu-65-cipo396` 79, `jifeju-37-zeza533` 55, `nuropa-85-vili653` 67, `rebire-77-depi269` 88. No ratchet exists. The routing gate pins all 4 as `known-misroute`, `ourType: NONE` (`routing-baseline.json:35167-35206`), stale since the plugin stamps `BOARD`.

Other gates already hold board rows, all expected to fall: `document-background.json` `board-black` 18 and `board-gradient` 20; `svg-lengthadjust/authored-baseline.json` `board-default` 22, `board-glyphs` 22, `board-none` 18, `board-onechar` 20; `diagram-style-scope.json` `board__selector-activitydiagram` 15 (dss follow-on 21, `planning/next-missions.md:104`).

`src/diagrams/board/` is 344 lines of parse, layout and string templates. Upstream's 8 files are about 700 lines. There is no `vega/board`; upstream's only board test is `DiagramTypeTest.java:116-118`.

Twenty planning probes are in [probes/](probes/), rendered with `scripts/oracle-render.sh` on 2026-11-05: 18 draw `BOARD`, 2 are jar error pages (`cov-grid-plus-first`, `cov-grid-empty`). Today's engine is at **0 of 18** drawn probes at zero (14 to 211 diffs). T3b re-renders them into `tests/fixtures/board/`.

"Status" says what planning established. **Read** means the Java and the oracle agree. **Probe** means a jar render on 2026-11-05 showed it. Every task still opens the Java itself.

| What the jar does | Java | Status | Task |
|---|---|---|---|
| `BoardDiagram extends TitledDiagram`; the body is one `TextBlock` whose dimension is `getMinMax(this, sb, true).getDimension().delta(10, 10)` | `BoardDiagram.java` `getTextBlock` | Read | T1b |
| Card fill is `HColors.LIGHT_GRAY` = `#C0C0C0`, stroke `HColors.BLACK`; ours fills `#D3D3D3`. Every row's first diff | `CardBox.java` `drawU`, `HColors.java:94` | Read + Probe | T1b |
| Card is a fixed 150×70 `URectangle` with `setDeltaShadow(1)`: the jar's shadow `<filter>`, seeded id | `CardBox.java` `calculateDimension`, `drawU` | Read + Probe | T1b |
| Label: `Display.create(name)` drawn with `FontConfiguration.blackBlueTrue(sansSerif(14))`, `LEFT`, at `(3, 3)`: a creole sheet, so `textLength`, baseline `y`, no `dominant-baseline` | `CardBox.java` `drawU`; `FontConfiguration.java:63-65` | Read + Probe | T1b |
| CardBox ignores every skinparam and style: `skin rose`, `monochrome`, `<style>` leave the card `#C0C0C0` | `CardBox.java` (no style read) | Probe (`cov-skin-rose`, `cov-mono-true`) | T1b, T3b |
| Each activity draws `getBox()` (the root card) and then **every** `BArray` cell, root included: the root card is drawn twice | `Activity.java` `drawMe`, `BNode#initBarray` | Read + Probe | T1b |
| `BArray` is a `HashMap<String, BNode>` keyed `"x;y"`; cells draw in **HashMap iteration order**, not tree order. `gasaxu` draws `America` (860,100) between `Barcelone` and `Pamplune` | `BArray.java` `iterator`, `getKey` | Read + Probe | T1a |
| `x` is a pre-order count: the first child shares its parent's `x`, each later sibling bumps the counter | `BNode.java` `computeX` | Read | T1a |
| `addRelease` climbs from the cursor to the first ancestor with a smaller stage; stages may skip (`+++++++B` is stage 7 under stage 0) | `Activity.java` `addRelease` | Read + Probe (`cov-grid-deep-stage`) | T1a |
| Activities sit side by side, each `(maxX + 1) × 170` wide; stage rows are 90 high (`PostIt.getWidth/getHeight`) | `Activity.java` `getFullWidth`, `PostIt.java` | Read | T1a |
| Dashed separators on the **untranslated** `ug`: `ULine.hline(fullWidth)` at `dy = (i + 1) × 90 − 10` for `i < maxStage`, `UStroke(5, 5, 0.5)`, black | `BoardDiagram.java` `drawMe` | Read + Probe | T1b |
| Style name falls through to `activityDiagram`: `activityDiagram { document { BackgroundColor } }` colours a board | `DiagramType.java:295` (`return SName.activityDiagram`) | Read + Probe (style-scope oracle `#AAAAAA`) | T1b, T3a |
| `CommandBoardPlus`: `^([+]*)\s*([^%s].*)$`; an empty `PLUS` starts an activity. A lone `+` is an activity labelled `+` | `CommandBoardPlus.java` `getRegexConcat` | Read + Probe (`cov-grid-plus-alone`) | T2 |
| A `+` line before any activity: `getLastActivity()` on an empty list throws; the jar errors | `BoardDiagram.java` `addLine`, `getLastActivity` | Read + Probe (`cov-grid-plus-first`) | T2 |
| An empty `@startboard`: the jar draws its Welcome page | factory empty-diagram path | Probe (`cov-grid-empty`) | T2 |
| Title, caption, legend, header, footer, mainframe, `scale`, `dpi`, `!option handwritten`, `reversecolor`, document `Margin` all apply through `TitledDiagram` | `TitledDiagram.java`, `TextBlockExporter.java:159-209` | Probe | T3a, T3b |

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**. Do not create another branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha named in the execution prompt, and tags `board-engine-port/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`npm test`, never `vitest run tests/unit`. New exports need `npm run catalog` (drift-gated). A `vitest run <paths>` that collects nothing exits 0: read the count. The baseline counts on `3d5d09396` are in [decisions.md](decisions.md#baseline).

## Measurement commands

Tools are under `plans/board-engine-port/measurements/`, adapted from packet's, plus `verdict-diff.mjs` from `plans/description-divergence-drive/measurements/`. Run with `node` or `npx jiti`. Type commands literally: the allowlist has no `bash plans/...`, `date`, or shell-variable prefixes. Producers run **alone** (`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- Survey, always with `--out`: `npm run svg:survey -- board --out /tmp/bep-<task>/parity-board.json`. A positional type with no `--out` clobbers `parity.json`.
- `node plans/board-engine-port/measurements/board-moves.mjs /tmp/bep-b0/parity-board.json /tmp/bep-<task>/parity-board.json`: moved rows; exit 1 on a loss.
- `npx jiti plans/board-engine-port/measurements/row-diffs.mts /tmp/bep-<task>/parity-board.json /tmp/bep-<task>/diffs.json [slug ...]`: every diff, and our SVG beside the JSON.
- `npx jiti plans/board-engine-port/measurements/probe.mts <in.puml> <oracle.svg> [limit]`: one source against its oracle.
- `npx jiti plans/board-engine-port/measurements/probe-dir.mts tests/fixtures/board`: every `<slug>.puml` beside its `<slug>.svg`, one line each.
- `npx jiti plans/board-engine-port/measurements/pin-board.mts [--write]`: pin candidates.
- `npx jiti plans/board-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`: the authored baseline, from T4 on.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every engine, at batch close. Exit 1 on a loss.
- `scripts/oracle-render.sh <out-dir> <puml...>` for an oracle, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary. The board rows of `document-background.json`, `svg-lengthadjust/authored-baseline.json` and `diagram-style-scope.json` are expected to **fall**; a rise there is this stop.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D10: amend `decisions.md` with the date, then halt.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else finishes. `oracle/accepted-divergences.json` is never edited here (the user signs). A file outside a task's write-set is not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that turn out to share a mechanism, or splitting one that runs past about 15 minutes.
- A residual diff on these rows or fixtures: read the Java and fix it in the task that owns it, or add a task.
- More authored `.puml` fixtures and oracles where a branch has no row.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks (D8).
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes, with its Java quote. A gain in another bucket counts for that bucket's issue: T5 comments there, or leaves the text in `.agent-notes/` if the comment is denied.

## Blast radius

**Data model:** none. **API:** no public change; `dist/*.d.ts` checked at T5. `BoardDiagramAST` and `BoardGeometry` are internal, and `plantuml-ts` has no consumers. **Dependencies:** none; board never reaches graphviz or dot-engine. **SVG output** changes on purpose. **Shared seams:** `core/assemble-svg.ts` moves `BOARD` to the titled path (D2); `{{board}}` through `core/EmbeddedDiagram.ts:287`; `src/core/java-hash-set.ts` is reused, not changed (D3).

| File | Action | Task |
|---|---|---|
| `src/diagrams/board/{BNode,BArray,PostIt}.ts`, `Activity.ts` (tree half) | Create | T1a |
| `src/diagrams/board/{CardBox,BoardDiagram,board-skin-param}.ts`; `Activity.ts#drawMe` | Create, Modify | T1b |
| `src/diagrams/board/command/CommandBoardPlus.ts`, `BoardDiagramFactory.ts` | Create | T2 |
| `src/diagrams/board/index.ts` | Rewrite | T3a |
| `src/diagrams/board/{ast,parser,layout,renderer}.ts` | **Delete** | T3a |
| `tests/unit/board/**` | Rewrite and delete | T1a to T3a |
| `src/core/assemble-svg.ts`, `tests/unit/core/assemble-svg-lad-t1a.test.ts`, others that name the old files | Modify | T3a |
| `oracle/goldens/document-background.json`, `svg-lengthadjust/authored-baseline.json`, `diagram-style-scope.json` | Modify (shrink) | T3a |
| `tests/fixtures/board/**` | Create | T3b |
| `oracle/goldens/svg-board/**`, `tests/oracle/svg-conformance/board.golden.ratchet.test.ts`, `board.diff-baseline.ratchet.test.ts`, `render-fixture-board.ts` | Create | T4 |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, their count tests | Modify | T4 |
| `scripts/parity-dashboard-goldens.ts`, `scripts/parity-dashboard-notes.ts`, `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `census-board.json`, `planning/next-missions.md`, `docs/catalog.md` | Modify | T3a to T5 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — tree and drawing](batch-1/overview.md) | T1a, T1b | [x] |
| [2 — command and factory](batch-2/overview.md) | T2 | [x] |
| [3 — turn on, probes](batch-3/overview.md) | T3a, T3b | [x] |
| [4 — ratchet](batch-4/overview.md) | T4 | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #118)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its mechanism. (4/4 conformant; journal rows 13, 19, 25)
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue. (no new divergence, no row needed a ruling)
- [x] 0 conformant losses in every engine, baseline survey against final survey. (`verdict-diff 3d5d09396`: lost 0; rows 19, 25)
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated. (`svg-board`, `pin-board.mts` prints `pins 0`; rows 22-23, 26)
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass. (rows 25, 26)

## Documents

- [decisions.md](decisions.md) — D1 to D10, operational readiness, baseline.
- [task-contract.md](task-contract.md) — what every task does and how it closes.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/) — the 20 planning probe sources.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief and is byte-identical to the live `.claude/settings.json`; it was deliberately not regenerated (the SessionStart hook compares them).

## Summary (2026-11-05)

**Tasks:** T0, T1a+T1b (merged, journal row 4), T2, T3a, T3b, T4, T5 done; T6 squash follows. 7 of 7 planned work tasks.

**Verdicts:** `board` 0/0/4 → **4/0/0** (gasaxu 79, jifeju 55, nuropa 67, rebire 88 diffs → 0). All 4 pinned in `oracle/goldens/svg-board`. 0 lost in every engine; no other bucket moved (`verdict-diff 3d5d09396`, batch 3 and 4 closes).

**Authored:** 67 fixtures in `tests/fixtures/board` (20 planning probes + 47 for D4): 62 at 0 diffs, 5 jar error pages where we also error (D7 error-page ruling). Tracked by `authored-baseline.json`.

**Shrinks:** document-background `board-black` 18→0, `board-gradient` 20→0; style-scope `board__selector-activitydiagram` 15→0; lengthAdjust `board-*` 22/22/18/20→0. Routing: 4 rows `known-misroute` → `agree` + 4 golden twins (agree 9801, misroute 491, rows 10454); refusal rendering 10012.

**Gates (final, batch 4 close tree + T5 docs):** npm test 2007 files, 42163 passed, 4 expected fail, exit 0; coverage 97.33/93.2/97.96; every board file ≥ 90/90/90; typecheck, lint, build, format:check exit 0. `dist/*.d.ts` byte-identical to a base build. `oracle/accepted-divergences.json` unchanged.

**Decisions to audit (journal):** row 9 (the brief said the command matches the trimmed line; the Java's `doTrim = false` and the oracle say otherwise), row 6 (`HColors.LIGHT_GRAY` added in core), row 17 (board draws scaled chrome deferred; the same double rounding remains on packet, mindmap, wbs and likely chart, salt, gantt), row 24 (`Object.is` as `String#equals`).

**Rows left:** none. Follow-ons are in `planning/next-missions.md`, bep section: scaled-chrome double rounding on six engines, `javaStringHashCode` consolidation, error-page line numbers.

**CI risk:** the latest PR run (#153, run 42059932548) had a slowest shard of 564 s (shard 4). cep, pep and now bep add ratchet rows since (bep: 4 golden + 67 authored renders; both board ratchet files run in 2.75 s wall locally at load 9, tests 13% of it), unmeasured in CI until the next PR's first run. Its `static gates` job failed on that run; `e2a4a7290` addressed it and has not run in CI.
