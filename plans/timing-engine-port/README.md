# timing-engine-port (tep)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #127 (`size:L`, "likely to split at planning"). Planned unattended on 2026-11-10 at
`feature/parity-queue` `fea72e951`. Not split: gantt (20,082 Java lines) ran as one mission (gep), and timing's three
packages only become measurable together at T4a; the batches below are the split.

## Objective

Port `net/sourceforge/plantuml/timingdiagram/` (68 files, 8,011 Java lines: top level, `command/`, `graphic/`) file for
file into `src/diagrams/timing/` (D1) and register it at `PSystemBuilder.java:187` (D10). Take the **152 rows the jar
draws as `TIMING`** to conformant or a named end (D8), keep the **6 jar-error rows** error pairs, author probes past
them (D11), and pin everything in a new `svg-timing` ratchet (D12). Lose no conformant row in any engine, and
regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-10 on `fea72e951`

No plugin registers `TIMING`, so every timing source gets the "unknown diagram type" page. Upstream has no
`@starttiming`: timing is one of `@startuml`'s candidates (`DiagramType.java:197-200`). `measurements/timing-rows.mjs`
finds the rows (`measurements/planning-rows.json`):

| Rows | Bucket | Oracle | Verdict today | First diff |
|---|---|---|---|---|
| 135 | `timing` | jar draws `TIMING` | diverged | `svg/@background` |
| 4 | `timing` | jar draws `TIMING` (`bupubi-65`, `keseno-49`, `zipuri-87`, `zupuse-88`) | diverged | `svg/g[1]/text[1]/@fill` |
| 13 | `unknown` | jar draws `TIMING` (`bicusa-63-cosu196`, `Timing-short-alias-5`, …) | diverged | `svg/@background` |
| 6 | `timing` | jar error page (D8) | conformant (error pair) | — |

Overall at eep/rep close: 5,514 conformant, 110 structural-match, 300 diverged, 3 oracle-error, of 5,927.

**Feature census of the 152 drawn sources:** `concise` 97, `robust` 69, `binary` 31, `clock` 23 (`pulse` 4,
`offset` 1), `analog` 17, `rectangle` 5; `@<number>` 118, `+N` 22, `@:code`/`as :code` 10, `@player` blocks common;
messages `->` 47, constraints `<->` 25, `is {…}` 19, `has` 11, `is "…"` 14, stereotypes 6, `highlight` 6, notes 9;
`scale` 13, `hide time-axis` 4, `manual time-axis` 2, `mode compact`/`compact` 5, `ticks` 4, `use date format` 1
(`mekivo-95-xafe506`), `HH:MM:SS` ticks 3, `YYYY/MM/DD` ticks 3; `title` 15, `<style>` 15, `skinparam` 2,
`legend` 2, `caption` 2; no `header`, `footer`, `!theme`, `pixel height`, `newpage` or `{{`.

**Upstream tests:** `DeduceFormatTest.java`, `TimeSeriesTest.java` (D5) and three `vega/timing` fixtures. **46
planning probes** are in [probes/](probes/), rendered with `scripts/oracle-render.sh` on 2026-11-10 into
`/tmp/tdp-plan/oracle` (D11 lists their kinds). T4b copies them into `tests/fixtures/timing/`.

"Status" says what planning established. **Read** means planning read the Java; **Probe** means a jar render on
2026-11-10 showed it. Every task still opens the Java itself and finds the line.

| What the jar does | Java | Status | Task |
|---|---|---|---|
| Players stack top to bottom in declaration order; each has a frame title and a left/right panel pair; part 1 is the widest left panel; `withMargin(10, 10)` | `TimingDiagram.java:98-196, 290-339` | Read | T3a |
| One shared `TimingRuler` maps ticks to x; automatic or manual time axis; `scale N [unit] as P pixels` | `TimingRuler.java`, `CommandScalePixel.java` | Read + Probe (`cov-scale-unit`, `cov-manual-axis`, `cov-scale-hide-axis`) | T1c, T3c |
| Tick values are `BigDecimal`; `@1` and `@1.0` are one tick; labels keep scale | `TimeTick.java`, `TimingFormat.java:61-66` | Read | T1a |
| `HH:MM:SS` and `YYYY/MM/DD` ticks, lenient GMT dates, Julian before 1582 | `TimeTickBuilder.java`, `TimingFormat.java:68-101` | Read + Probe (`cov-hour-time`, `cov-date-time`, `cov-date-lenient`, `cov-date-julian` crash) | T1a, T1c |
| `use date format` formats in the JVM default zone | `TimingDiagram.java:407-422` | Probe (`cov-date-format`: `20-07-03` for `2020/07/04`) | T1a, T3c, T4a |
| Concise, rectangle and robust state panels; hexagon and pentagon transition shapes; `{hidden}`, `{...}`, `{-}`, `{?}`, `{A,B}` | `graphic/PanelsState.java`, `PanelsRobust.java`, `HexaShape.java`, `Penta*.java`, `CommandChangeState.java` | Probe (`cov-special-states`, `cov-define-states`, `cov-rectangle`) | T2c, T2d, T3b |
| Binary, clock (period, pulse, offset) and analog (range, ticks, height) panels | `graphic/PanelsBinary.java`, `PanelsClock.java`, `PanelsAnalog.java` | Probe (`cov-binary`, `cov-clock-pulse-offset`, `cov-analog`, `vega-*`) | T2e |
| Analog value labels through `DeduceFormat`'s `DecimalFormat` | `DeduceFormat.java:85-111`, `TimeSeries.java` | Read | T1b |
| Messages and constraints between players at ticks | `TimeMessage.java`, `TimeConstraint.java`, `graphic/TimeArrow.java` | Probe (`cov-messages`, `cov-message-dotted`, `cov-constraint`) | T2b, T3c |
| Highlights, notes (Opale), compact mode | `Highlight.java`, `TimingNote.java`, `CommandModeCompact.java` | Probe (`cov-highlight`, `cov-notes`, `cov-compact`, `cov-compact-player`) | T2a, T2b, T3c |
| Clock/analog/binary ignore the line's `compact` | `TimingDiagram.java:320, 330, 336` | Read | T3a (D7) |
| Errors: `Unknown "X"`, `Bad date format`, crash pages, Welcome | commands, `TimingDiagram.java:413` | Probe (`cov-unknown-player`, `cov-bad-date-format`, `cov-date-julian`, `cov-empty`) | T3b, T3c, T4a |
| `@starttiming` is unsupported | `DiagramType.java`, `PSystemBuilder.java:283-284` | Probe (`cov-starttiming-tag`) | T4a (D10) |
| Title, caption, legend, header, footer, `scale`, dark mode through `TitledDiagram`; style name `timingDiagram` | `TitledDiagram.java`, `DiagramType.java:274-275` | Probe (`cov-chrome-all`, `cov-scale-2`, `cov-mode-dark`, `cov-style`, `cov-stereotype`) | T4a, T4b |
| A timing diagram inside `{{ }}` | `EmbeddedDiagram` | Probe (`cov-embedded`, 276 × 223) | T4a, T4d |

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits
this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees** (D15). Do not create another
branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha
named in the execution prompt, and tags `timing-engine-port/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`npm test`, never `vitest run tests/unit`. New exports need `npm run catalog` (drift-gated). A `vitest run <paths>`
that collects nothing exits 0: read the count. The baseline on `fea72e951` is in [decisions.md](decisions.md#baseline).
Stay on graphviz 16.1.0 (`dot -V`); timing never calls `dot`, but other engines' gates do.

## Measurement commands

Tools are under `plans/timing-engine-port/measurements/`, adapted from rep's, plus `verdict-diff.mjs` from
`plans/description-divergence-drive/measurements/`. Run with `node` or `npx jiti`. Type commands literally: the
allowlist has no `bash plans/...`, `date`, or shell-variable prefixes. Producers run **alone**
(`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- Surveys, always with `--out`: `npm run svg:survey -- timing --out /tmp/tep-<task>/parity-timing.json`, and
  `npm run svg:survey -- unknown --out /tmp/tep-<task>/parity-unknown.json` (1,048 rows; slower). A positional type
  with no `--out` clobbers `parity.json`.
- `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> /tmp/tep-<task>`: exit 1 on a row that
  left conformant. `node plans/timing-engine-port/measurements/survey-moves.mjs /tmp/tep-b0/parity-timing.json /tmp/tep-<task>/parity-timing.json`
  (and the `unknown` pair): every moved row.
- `node plans/timing-engine-port/measurements/timing-rows.mjs /tmp/tep-<task> --json /tmp/tep-<task>/rows.json`: the
  158 rows with oracle kind, verdict and first diff, and a count per bucket.
- `npx jiti plans/timing-engine-port/measurements/row-diffs.mts plans/timing-engine-port/measurements/planning-rows.json /tmp/tep-<task>/diffs.json [slug ...]`:
  every diff, and our SVG beside the JSON.
- `npx jiti plans/timing-engine-port/measurements/fixtures.mts [slug ...]`: every `tests/fixtures/timing/<slug>.puml`
  against its `<slug>.svg`, one line each.
- `npx jiti plans/timing-engine-port/measurements/pin-timing.mts [--write]`: pin candidates, from T5 on.
- `npx jiti plans/timing-engine-port/measurements/build-authored-baseline.mts <commit> [--write]` and
  `build-diff-baseline.mts <commit> [--write]`: the authored and jar-error baselines, from T5 on.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every
  engine, at batch close from batch 4. Exit 1 on a loss.
- `scripts/oracle-render.sh <absolute-out-dir> <puml...>` for an oracle, never a hand-typed `java -jar`.

`row-diffs.mts` and `fixtures.mts` render with no clock: T4a gives both the capture-clock zone (D4), or `mekivo-95` and
`cov-date-format` read a day off. `pin-timing.mts` and the two baseline builders import `render-fixture-timing.ts`,
which T5 creates; T4a may create it early.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D16: amend `decisions.md` with the date, then halt.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else
finishes. `oracle/accepted-divergences.json` gains or changes nothing here. A file outside a task's write-set is not a
stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that turn out to share a mechanism, or splitting one that runs past about 15 minutes.
- A residual diff on these rows or fixtures: read the Java and fix it in the task that owns it, or add a task.
- More authored `.puml` fixtures and oracles where a branch has no row.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks (D16).
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes in a shared module (`Opale`, creole, klimt, `date-format.ts`), with its
  Java quote, keeping that module's other engines' ratchets green. A gain in another bucket counts for that bucket's
  issue: T6 comments there, or leaves the text in `.agent-notes/` if denied.

## Blast radius

**Data model:** none. **API:** no public change; `dist/*.d.ts` checked at T6. `block-extractor.ts` loses the
port-only `@starttiming` tag (D10); it is internal, and `plantuml-ts` has no consumers. **Dependencies:** none; timing
never reaches graphviz or dot-engine. **SVG output** changes on purpose for every `@startuml` source the jar draws as
`TIMING` and for `{{ }}` timing blocks. **Shared seams:** `src/core/decimal/` is new (D3);
`src/core/tim/builtin/date-format.ts` gains a pattern check and any letters timing needs (D4);
`src/core/command/CommandFootboxIgnored.ts` is new (D2); `tests/oracle/svg-conformance/capture-clock.ts` learns
`use date format` and `oracle/capture-clock.json` gains rows (D4); `core/assemble-svg.ts`, `core/document-back-color.ts`
and `registered-plugins.ts` gain a row each; `tests/architecture/layering.test.ts` may gain allowlist entries.

| File | Action | Task |
|---|---|---|
| `src/core/decimal/{BigDecimal.ts,README.md}`, `src/diagrams/timing/{TimeTick,TimingFormat,TimeProjected,TimeAxisStategy,TimingStyle,Clocks}.ts`, `src/core/tim/builtin/date-format.ts` | Create, Modify | T1a |
| `src/diagrams/timing/{DeduceFormat,TimeSeries}.ts` (+ `decimal-format.ts` if split) | Create | T1b |
| `src/diagrams/timing/{TimingRuler,TickInPlayer}.ts`, `src/diagrams/timing/command/TimeTickBuilder.ts` | Create | T1c |
| `src/diagrams/timing/{Player,AbstractStatePlayer,ChangeState,TimingNote}.ts`, `graphic/{PlayerFrame,IntricatedPoint}.ts` | Create | T2a |
| `src/diagrams/timing/{TimeConstraint,TimeMessage,Highlight}.ts`, `graphic/TimeArrow.ts` | Create | T2b |
| `graphic/{Panels,PanelsState,PanelsConcise,PanelsRectangle,PanelsNoLeft,HexaShape,PentaAShape,PentaBShape,PentaAShapeRectangle,PentaBShapeRectangle}.ts`, `{PlayerConcise,PlayerRectangle}.ts` | Create | T2c |
| `graphic/PanelsRobust.ts`, `PlayerRobust.ts` | Create | T2d |
| `graphic/{PanelsBinary,PanelsClock,PanelsAnalog}.ts`, `{PlayerBinary,PlayerClock,PlayerAnalog}.ts` | Create | T2e |
| `src/diagrams/timing/{TimingDiagram,timing-skin-param}.ts` | Create | T3a |
| `command/{CommandRobustConcise,CommandClock,CommandAnalog,CommandBinary,CommandDefineStateShort,CommandDefineStateLong,CommandChangeState,CommandChangeStateByPlayerCode,CommandChangeStateByTime,CommandAtTime,CommandAtPlayer}.ts` | Create | T3b |
| `command/{CommandTimeMessage,CommandNote,CommandNoteLong,CommandConstraint,CommandScalePixel,CommandHideTimeAxis,CommandHighlight,CommandModeCompact,CommandTicks,CommandPixelHeight,CommandUseDateFormat}.ts`, `{TimingDiagramFactory,timing-common-commands}.ts`, `src/core/command/CommandFootboxIgnored.ts` | Create | T3c |
| `src/diagrams/timing/index.ts`, `src/registered-plugins.ts`, `src/core/{block-extractor,document-back-color,assemble-svg}.ts`, `tests/oracle/svg-conformance/capture-clock.ts`, `oracle/capture-clock.json`, the measurement tools' render options | Create, Modify | T4a |
| `tests/unit/timing/**` | Create | T1a to T4a |
| `tests/fixtures/timing/**` | Create | T4b |
| `src/diagrams/timing/**`, a shared module a residual reaches | Modify | T4c, T4d |
| `oracle/goldens/svg-timing/**`, `tests/oracle/svg-conformance/{timing.golden.ratchet.test.ts,timing.diff-baseline.ratchet.test.ts,render-fixture-timing.ts}` | Create | T5 |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, their count tests, `scripts/parity-dashboard-goldens.ts` | Modify | T5 |
| `scripts/parity-dashboard-notes.ts`, `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `census-timing.json`, `DIVERGENCES.md`, `planning/{next-missions,mission-guide,timing-deepdive}.md`, `docs/catalog.md` | Modify | T4a to T6 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — ticks, formats, ruler](batch-1/overview.md) | T1a, T1b, T1c | [x] |
| [2 — players and panels](batch-2/overview.md) | T2a, T2b, T2c, T2d, T2e | [x] |
| [3 — diagram, commands, factory](batch-3/overview.md) | T3a, T3b, T3c | [x] |
| [4 — turn on, probes, residuals](batch-4/overview.md) | T4a, T4b, T4c, T4d | [x] |
| [5 — ratchet](batch-5/overview.md) | T5 | [x] |
| [exit](batch-exit/overview.md) | T6 | [x] |
| [squash](batch-squash/overview.md) | T7 | [x] |

## Done when (issue #127)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its
  mechanism.
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue
  and is not decided inside this mission.
- [x] 0 conformant losses in every engine, baseline survey against final survey (the six jar-error rows included, D8).
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md) — D1 to D16, operational readiness, baseline.
- [task-contract.md](task-contract.md) — what every task does and how it closes.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/) — the 46 planning probe sources.
- [measurements/](measurements/) — the tools above and `planning-rows.json`.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx jiti`,
`npm`, `scripts/oracle-render.sh`, `gh issue`); it was deliberately not regenerated (the SessionStart hook compares it
with the live `.claude/settings.json`).

## Summary (2026-11-10)

**Tasks:** T0 to T6 done as planned (T7, the squash, follows). T4c needed one mechanism (T4c1, the title trim), because
143 of 145 rows drew byte-identical at turn-on; no task was added otherwise.

**Verdicts:** `timing` 6 / 0 / 139 → **145 / 0 / 0**; `unknown` 932 → 945 conformant (the 13 drawn timing rows). Overall
5,514 / 110 / 300 / 3 → **5,666 / 110 / 148 / 3** of 5,927. `verdict-diff` against `fea72e951`: lost 0, timeout 0. No row
outside `timing` and `unknown` changed any field. 139 + 13 rows are pinned in `svg-timing`; the six jar-error rows are
pinned by score.

**Authored:** 141 fixtures in `tests/fixtures/timing/`: 131 at 0 diffs, 9 jar error or crash pages where we also error,
and `cov-embedded-state`, open and pinned by score.

**Rows left:** no corpus row. `cov-embedded-state` is a state-engine gap (a `{{ }}` in a state note draws as text, for any
embedded type), separable from timing; its D8 end is a `queue:ready` issue, not filed because `gh issue create` was
denied. The body is in `.agent-notes/tep-T4d.md`.

**Gates (final, journal 19):** `npm test -- --maxWorkers=4`, typecheck, lint, build, format:check all exit 0;
45,625 passed; coverage 97.20 / 92.91 / 97.92 / 98.18. `oracle/accepted-divergences.json` is unchanged.

**API:** `dist/plantuml-ts.d.ts` differs from a build of the base only by `FontParam.TIMING` (`FontParam.java:49`),
additive. `dist/image-providers.d.ts` is identical.

**Decisions to review:** the title-trim fix in `src/core/annotations/commands.ts` and the `WithLinkType` colour fix are
shared-module changes (journal 12, 14); `PanelsAnalog` folds three identical loops into one generator (journal 5); the
`layering` allowlist gains timing → `sequence-arrowhead.ts` (journal 6).

**Follow-ons:** `planning/next-missions.md` "timing-engine-port (tep)". The #127 and #136 comments were denied: the text
is in `.agent-notes/tep-T6.md`.

**CI risk:** the latest main run (42712716665) took 476 s on its slowest shard (shard 3); its `vitest-blob-*` artifacts
have expired, so the routing and refusal part times cannot be read. This mission adds 152 golden twins to each of the
routing and refusal gates (+1.4 % of 10,998 rows) and two ratchet files, 447 tests in 13.8 s locally at load 35-56.
