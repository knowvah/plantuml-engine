# chart-engine-port (cep)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #116. Planned unattended on 2026-11-05 at `feature/parity-queue` `e2a4a7290`.

## Objective

Replace `src/diagrams/chart/` with a file-for-file port of `net/sourceforge/plantuml/chart/` on the klimt layer, the way wbs was ported (D1, D2). Take the **29 `chart` rows** to conformant, pin them in a new `svg-chart` ratchet, and probe past them with authored fixtures. Lose no conformant row in any engine, and regenerate `docs/parity-report.md`. A row that cannot reach the jar ends by D8, never unnamed.

## Starting state, measured 2026-11-05 on `e2a4a7290`

A fresh `npm run svg:survey -- chart --out /tmp/...` gives 29 rows, **0 conformant, 0 structural-match, 29 diverged**, the same verdicts as the committed file. No ratchet or diff-baseline exists. `src/diagrams/chart/` is 2900 lines of a parse, layout and string-render pipeline that was never faithful: its comment says "Drawing order mirrors ChartRenderer.java exactly" and then lists an order upstream does not have.

"Status" says what planning established. **Read** means the Java and the oracle agree. **Probe** means a jar render on 2026-11-05 showed it. Every task still opens the Java itself.

| What the jar does | Java | Status | Task |
|---|---|---|---|
| Canvas 604x431 on `babadu-29`: 20+40+400+20 plus the legend, 20+30+300+40+20, then margin 10 per side and `+1` | `ChartRenderer.java:135-153`, `getPlotWidth:925-927`, `getPlotHeight:929-931`, `TitledDiagram#getDefaultMargins` | Read | T3a |
| Every axis line and tick `#181818` at `0.5`, not 1: the merged axis style | `:244-256`, `getAxisStyleSignature:1061-1064`; no `chartDiagram` block in the skin, so `element` answers | Read | T3a |
| Tick and legend text is a creole `Display` at size 14 through the merged style. `dominant-baseline` and `text-anchor` never appear | `:308-314`, `:1093-1094` | Read | T3a, T3c |
| Bar with no colour is `#F1F1F1`, not the palette: `element`'s `BackGroundColor` answers, and `getDefaultColor` is dead on these paths | `:793-801`, `:941-949` | Read | T3b |
| **A scatter's explicit colour is lost.** `#9b59b6` on `fosoma-37` draws `#000`: `MarkerColor` is unset, `Style#value` gives `ValueNull`, `asColor` gives `HColors.BLACK`, which is not null, so it wins | `ScatterRenderer#draw`, `ValueNull.java:86-89`, `ChartRenderer.java:1205-1215` | Read + Probe | T3b |
| `<<triangle>>` before the name is a stereotype, not a marker: only the trailing `MARKER` group sets the shape. Draws a black circle | `CommandChartScatter#getRegexConcat`, `#executeArg` | Probe | T2b |
| `xAxis` is never null (`new ChartAxis()`), so `drawYAxis`'s grid arm is dead and `drawGridLines` always runs, at `range / 10` unless `spacing` is set | `ChartDiagram.java:74`, `ChartRenderer.java:296`, `:708-773` | Read | T3a |
| Draw order: axes, grid, bars, then line and scatter in series order, then areas, then annotations, then legend | `drawU:203-238`, `drawSeries:775-923` | Read | T3a, T3b |
| Horizontal charts pass `yAxisLabels`, `yAxis.getTitle()`, then `xAxis` as both axes, and draw at sans-serif 10 with the outer stroke `1.0` | `ChartDiagram.java:106-111`, `ChartRenderer.java:164`, `:207-210`, `:632-702` | Read | T1b, T3a |
| v-axis title rotates `-90` at `x=27`, v2-axis `+90` at `x=513` | `drawVerticalText:407-432`, `rupive-64` | Read | T3a |
| Stacked bars never clamp `zeroY`, single and grouped do; horizontal bars ignore zero | `BarRenderer.java:147`, `:259`, `:329`, `:211` | Read | T3b |
| `CommandChartGrid` exists and is **not registered**: `grid v-axis` is a syntax error | `ChartDiagramFactory.java#initCommandsList` | Probe | T2c |
| `bar [1,2] v2` is a syntax error: `CommandChartBar` has no `V2` group. Ours parses it | `CommandChartBar#getRegexConcat` | Probe | T2b |
| `h-axis [A,B,]` and `bar [1,2,]` render: Java's `split` drops trailing empties | `CommandChartHAxis#parseLabels`, `CommandChartBar#parseValues` | Probe | T2a |
| `%.2e` prints `1.00e-03`. `v-axis 5 --> 5` draws ticks at labels `5` | `formatValue:933-939`, probe `fmt`, `same-range` | Probe | T1a |
| `rotate`, `page 2x2`, `scale 2` are accepted; `scale 2` gives 1002x862. Ours refuses the first two and never scales | `CommonCommands#addCommonCommands1`, salt's and gantt's precedent | Probe | T2c |
| `chartDiagram { axis { LineColor red; LineThickness 2 } }` reaches the axis | merged style, probe `style-axis` | Probe | T3a |

Probe sources and oracles are in `/tmp/chart-plan/` only for planning; T4c to T4e author their own under `tests/fixtures/chart/`.

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**. Do not create another branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha named in the execution prompt, and tags `chart-engine-port/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all four at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`npm test`, never `vitest run tests/unit`. New exports need `npm run catalog` (drift-gated). A `vitest run <paths>` that collects nothing exits 0: read the count. The baseline counts on `e2a4a7290` are in [decisions.md](decisions.md#baseline).

## Measurement commands

Tools are under `plans/chart-engine-port/measurements/`, plus `verdict-diff.mjs` from `plans/description-divergence-drive/measurements/`. Run with `node` or `npx jiti`. Type commands literally: the allowlist has no `bash plans/...`, `date`, or shell-variable prefixes. Producers run **alone** (`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- Survey, always with `--out`: `npm run svg:survey -- chart --out /tmp/cep-<task>/parity-chart.json`. A positional type with no `--out` clobbers `parity.json`.
- `node plans/chart-engine-port/measurements/chart-moves.mjs /tmp/cep-b0/parity-chart.json /tmp/cep-<task>/parity-chart.json`: moved rows; exit 1 on a loss.
- `npx jiti plans/chart-engine-port/measurements/row-diffs.mts /tmp/cep-<task>/parity-chart.json /tmp/cep-<task>/diffs.json [slug ...]`: every diff, and our SVG beside the JSON.
- `npx jiti plans/chart-engine-port/measurements/probe.mts <in.puml> <oracle.svg> [limit]`: one authored source against its oracle.
- `npx jiti plans/chart-engine-port/measurements/pin-chart.mts [--write]`: pin candidates.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every engine, at batch close. Exit 1 on a loss.
- `scripts/oracle-render.sh <out-dir> <puml>` for an authored oracle, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D9: amend `decisions.md` with the date, then halt.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else finishes. `oracle/accepted-divergences.json` is never edited here (the user signs). A file outside a task's write-set is not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that turn out to share a mechanism, or splitting one that runs past about 15 minutes.
- A residual diff on these rows: read the Java and fix it in the task that owns it, or add a task.
- Authored `.puml` fixtures and oracles where a branch has no corpus row.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks (D5).
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes, with its Java quote. A gain in another bucket counts for that bucket's issue: T6 comments there.

## Blast radius

**Data model:** none. **API:** no public change; `dist/*.d.ts` checked at T6. `ChartDiagramAST` and the geometry types are internal, and `plantuml-ts` has no consumers. **Dependencies:** none, and this engine never reaches graphviz or dot-engine. **SVG output** changes on purpose. **Shared seams:** `src/index.ts#annotationsOf` loses chart's `chrome` branch (D3); `svg-format.ts` exports `javaFixedN`. Comments in `core/dispatcher-types.ts`, `core/assemble-svg.ts`, `src/index.ts`, `diagrams/class/ast.ts` naming chart's old error path get rewritten.

| File | Action | Task |
|---|---|---|
| `src/core/java-number-format.ts`, `src/core/svg-format.ts` | Create, Modify | T1a |
| `src/diagrams/chart/ChartAxis.ts`, `ChartSeries.ts`, `ChartAnnotation.ts` | Create | T1a |
| `src/diagrams/chart/chart-skin-param.ts` | Create | T1b |
| `src/diagrams/chart/command/CommandChart*.ts` | Create | T2a, T2b |
| `src/diagrams/chart/ChartDiagramFactory.ts` | Create | T2c |
| `src/diagrams/chart/ChartDiagram.ts` | Create | T1b, T3a |
| `src/diagrams/chart/ChartRenderer*.ts` | Create | T3a, T3b, T3c |
| `src/diagrams/chart/BarRenderer.ts`, `LineRenderer.ts`, `AreaRenderer.ts`, `ScatterRenderer.ts` | Create | T3b |
| `src/diagrams/chart/index.ts` | Rewrite | T4a |
| `src/diagrams/chart/{ast,chart-layout-*,chart-renderer-axes,layout*,line-handlers,parse-helpers,parser,renderer}.ts`, `renderers/` | **Delete** | T4a |
| `tests/unit/chart/**` | Rewrite and delete | T1 to T4a |
| `tests/unit/sprite-parsers.test.ts`, `tests/unit/utility-registration.test.ts`, `src/index.ts` | Modify | T4a |
| `oracle/goldens/document-background.json`, `oracle/goldens/svg-lengthadjust/authored-baseline.json` | Modify (shrink) | T4a |
| `tests/fixtures/chart/**`, `oracle/goldens/svg-chart/**` | Create | T4c-T4e, T5 |
| `tests/oracle/svg-conformance/chart.golden.ratchet.test.ts`, `chart.diff-baseline.ratchet.test.ts`, `render-fixture-chart.ts` | Create | T5 |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, their two count tests | Modify | T5 |
| `scripts/parity-dashboard-goldens.ts`, `scripts/parity-dashboard-notes.ts:109`, `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `census-chart.json`, `planning/next-missions.md`, `docs/catalog.md` | Modify | T5, T6 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — model, number text, diagram](batch-1/overview.md) | T1a, T1b | [x] |
| [2 — commands and factory](batch-2/overview.md) | T2a-T2c | [x] |
| [3 — renderers](batch-3/overview.md) | T3a-T3c | [x] |
| [4 — turn on, residuals, probes](batch-4/overview.md) | T4a-T4e | [x] |
| [5 — ratchet](batch-5/overview.md) | T5 | [x] |
| [exit](batch-exit/overview.md) | T6 | [x] |
| [squash](batch-squash/overview.md) | T7 | [ ] |

## Done when (issue #116)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its mechanism.
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md) — D1 to D9, operational readiness, baseline.
- [task-contract.md](task-contract.md) — what every task does and how it closes.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief and is byte-identical to the live `.claude/settings.json`. It was deliberately not regenerated: editing it would break that identity (the SessionStart hook compares them).

## Summary

**Tasks:** T0 to T6 complete, T7 squashes. T2a-c, T3a-c and T4c-e each landed as one commit by the push-forward rule, journaled; T4b needed no change.

**Verdicts, `chart`:** 0 conformant / 0 structural / 29 diverged before, **29 / 0 / 0 after**. All 29 pinned in `oracle/goldens/svg-chart`, so no `diff-baseline.json` (D7). Rows left: none. Every engine, base against final: lost 0, timeout or errored 0, and no verdict outside chart moved.

**Authored:** 164 fixtures, 129 at 0 diffs. The other 35 are a jar error page where we also error, conformant by the 2026-10-10 ruling; all 35 also error on the stock jar with no flags. No fixture has the jar erroring while we draw, or the reverse.

**Divergences:** none new, `oracle/accepted-divergences.json` unchanged, no needs-ruling issue. Public types: `dist/*.d.ts` differ from the base only in two doc comments this mission rewrote.

**Findings against the brief:** T3b's zero-height rect is a jar crash (`URectangle.java:140-144`). `assemble-svg.ts` needed `CHART` on the titled path, beyond T4a's list. Chart's dashboard note is deleted, not rewritten: a conformant row has no entry. All in the journal.

**Shared changes:** `UGraphicSvg#draw` throws on a NaN point (`AbstractUGraphic.java:133`, `MinMaxMutable.java:80-85`), and `UmlSource.styleSource` carries `options`. Neither moved a verdict outside chart, so #120, #122, #145 and #136 get no comment.

**CI risk:** #153's latest run at `bd984a3bf`: slowest shard 564 s (shard 4), against 506 s on #146. Its `static gates` job failed there, and `e2a4a7290` was committed to clear those failures after that run, so it has no result of its own yet. This mission adds 164 + 29 ratchet rows and 29 rows to each of the routing and refusal gates, so expect a small rise. The per-test budget is 600 s and the shard job's cap 15 min.

**Follow-ons:** `planning/next-missions.md`, the cep section.
