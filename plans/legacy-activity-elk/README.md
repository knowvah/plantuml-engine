# legacy-activity-elk (lae)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #158 (from #123, `legacy-activity-engine-port` T3c). Planned unattended on 2026-11-23 at
`feature/parity-queue` `7be0c7129`.

## Objective

With `!pragma layout elk`, the jar lays a legacy activity diagram out with `CucaDiagramFileMakerElk`
(`net/atmp/CucaDiagram.java:478-479`). Our legacy plugin records the pragma (`common-commands-1.ts:119`,
`diagram.setUseElk(true)`) but still lays out with dot-engine, so the geometry and the edges are dot's: we draw
`<g class="link">` splines, while the jar draws orthogonal `<line>` sections with no link group.

The ELK maker, `MyElkDrawing`, `MyElkCluster` and `MyElkEdge` are already ported (`src/core/elk/`), and the Chen
engine already drives them over the same abel model (`src/diagrams/cheneer/cheneer-elk-adapter.ts`,
`layout-elk.ts`), with all 8 of its ELK fixtures at 0 diffs. This mission gives the legacy engine the same thing:

1. holds the two issue fixtures and 19 planning probes in the authored ratchet, rendered with an ELK backend (batch 1);
2. adds `ActivityLegacyElkAdapter`, leaf and link half then cluster half (partitions, inner activities, empty
   partitions), unit-tested and not yet called (batch 2);
3. wires it in (the `requiresElk` hook, `layout-elk.ts`, the renderer branch), so a diagram that asks for ELK is laid
   out by ELK and never falls back to dot-engine, then drives every row to 0 or a named mechanism (batch 3);
4. re-measures every engine, regenerates the reports and comments on #158 (exit).

## Starting state, measured 2026-11-23 on `7be0c7129`

`npx tsx plans/legacy-activity-elk/measurements/measure.mts` prints **rows 19 zero 0 open 19 throw 0**, and with
`tests/fixtures/activity-legacy` as `dir` **rows 2 zero 0 open 2 throw 0**. Every jar oracle draws: none errors.

| Rows (diffs/score today) | What the jar does that we do not | Task |
|---|---|---|
| `pragma-elk` 15/74, `pragma-elk-if` 33/210 (issue fixtures) | ELK geometry and `<line>` edges | T3a |
| `elk-start-end` 11/40, `elk-two-leaves` 11/40, `elk-lap-stereotype` 15/74, `elk-chrome-title` 16/75, `elk-style-arrow` 15/88, `elk-lap-colors` 19/108, `elk-lap-dotted-style` 23/146, `elk-lap-sync-bar` 23/230, `elk-lap-if-nested` 51/342, `elk-lap-arrow-label` 19/136 | the same, no group | T3a |
| `elk-lap-ltr` 19/108 | ELK ignores `left to right direction`: root `Direction.DOWN` (`CucaDiagramFileMakerElk.java:482`); the jar is 251 high, we are 53 | T3a |
| `elk-lap-note-activity` 45/180, `elk-lap-lone-note` 19/26 | a note is a leaf; ELK places it | T3a, T3b |
| `elk-lap-note-on-link` 19/176, `elk-note-on-link-color` 19/176 | `getLabel` merges the link note (`CucaDiagramFileMakerElk.java:231-247`) | T2a, T3a, T3b |
| `elk-lap-partition` 21/248, `elk-partition-nested` 19/198 | a `PACKAGE` group is an ELK cluster (`CucaDiagramFileMakerElk.java:315-341`) | T2b, T3a |
| `elk-partition-empty` 35/94 | an empty `PACKAGE` mutes to `EMPTY_PACKAGE` and is a leaf (`:320-322`) | T2b, T3a |
| `elk-lap-inner-brace` 20/147 | no `CucaDiagramSimplifierActivity` on the ELK path: the `INNER_ACTIVITY` group is a cluster (jar 311 high, we 197) | T2b, T3a |

- **Probes:** `measurements/probes/elk-<fixture>.puml` is the authored fixture `<fixture>.puml` with
  `!pragma layout elk` as line 2, plus `elk-start-end` and `elk-two-leaves`. The jar svgs in `probes/jar/` come from
  `scripts/oracle-render.sh`. `elk-lap-url` was dropped: it is a parse error at line 3 under either layout.
- **The corpus has no legacy ELK row.** The four corpus rows with the pragma (`unknown/foraba-98-sagi735`,
  `simegi-12-fezi978`, `xilosu-00-taju695`, `xoviku-63-jici084`) are description diagrams, two with the pragma
  commented out.
- **Planning baseline on `7be0c7129`:** `npm test -- --maxWorkers=4` 2349 files passed (1 skipped), 50935 tests,
  coverage 97/92.59/97.48/98.03; `npm run lint` exit 0.
  `typecheck`, `build`, `format:check` first run at T0.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt, and
  tags `legacy-activity-elk/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Run `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/` or `docs/` while a gate is running.
- The complexity hook blocks a file over 500 lines or a function over 30 NLOC: split the adapter before it gets there.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Probes:** `npx tsx plans/legacy-activity-elk/measurements/measure.mts [dir] [out.json]`. From T1 on, run it with
  `tests/fixtures/activity-legacy` as `dir` (it reads only the rows carrying the pragma).
- **Legacy ratchet:** `npx vitest run tests/oracle/svg-conformance/activity-legacy` and read the collected count.
- **Legacy DOT gate:** `npx vitest run tests/oracle/activity-legacy-dot-parity`. ELK rows have no `svek-N.dot` and
  are never pinned there; the gate must not move.
- **Engines:** `npm run svg:survey -- activity --out tests/oracle/svg-conformance/parity-activity.json` (same for
  `unknown`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete any
  `svek-N.dot` it leaves in the out dir.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed (the `elk-*` rows T1 adds are not yet pinned goldens).
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D7, for example a row the jar lays out with svek, or a probe the stock jar errors on.
   Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change, a new dependency, or a write under `src/core/elk/` beyond a JSDoc line (D3, D7).
6. A fix needs a write to `@knowvah/dot-engine`, `@knowvah/elk-engine`, elkjs, `~/git/graphviz` or
   `~/git/knowvah/plantuml`. File the finding instead.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A residual with a separable mechanism (one that also shows without the pragma, or lives in a shared module another
  engine pins): measure it, file a `queue:ready` issue with the measurement and `file:line`, give the row that
  `reason`, continue.
- A residual only a maintainer can end (it would need a new `DIVERGENCES.md` entry, or it is backend arithmetic that
  elkjs and the jar's ELK compute differently): file a `needs-ruling` issue with the evidence, name it in the row's
  `reason`, continue.

## Push-forward (decide, journal, continue)

- Authoring extra probes for a branch you touch (a partition with a colour, a concurrent `===` bar inside a partition,
  a note on a partitioned activity, `skinparam packageStyle rectangle` on a partition), each with its oracle from
  `scripts/oracle-render.sh`; each joins the authored ratchet.
- Moving an `elk-*` probe that turns out to be a jar error into the ratchet as a `jarError` row, with its message.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none public. `ActivityLegacyGeometry` gains an optional `elk` field (internal). `dist/*.d.ts`
  must not move.
- **Dependencies:** nothing new. The adapter reads the existing `ElkDiagramAdapter` contract; the backend stays the
  default `loadElk()` one (D3).
- **Behaviour:** only legacy activity diagrams carrying `!pragma layout elk`. Every other legacy row keeps the svek
  path, guarded by the 124 pinned corpus rows, the 112 authored rows and the DOT gate. `renderSync` without
  `options.elk` now throws `ELK_RENDER_SYNC_UNSUPPORTED` for such a diagram, as class, description and Chen do.

| File | Action | Task |
|---|---|---|
| `tests/fixtures/activity-legacy/elk-*.{puml,svg}` (19 rows) | Create | T1 |
| `tests/oracle/svg-conformance/render-fixture-activity-legacy.ts` (`prepareElkOnce`) | Modify | T1 |
| `tests/oracle/svg-conformance/activity-legacy.diff-baseline.ratchet.test.ts` (`beforeAll`, `OPEN_ROWS`) | Modify | T1, T3a, T3b |
| `plans/legacy-activity-engine-port/measurements/build-authored-baseline.mts` (reasons, `elk` option) | Modify | T1, T3a, T3b |
| `oracle/goldens/svg-activity-legacy/authored-baseline.json` | Modify | T1, T3a, T3b |
| `src/diagrams/activity-legacy/activity-legacy-elk-adapter.ts` (+ unit test) | Create | T2a, T2b |
| `src/diagrams/activity-legacy/activity-legacy-elk-cluster.ts` (+ unit test), if the adapter would pass 500 lines | Create | T2b |
| `src/diagrams/activity-legacy/layout-elk.ts` (+ unit test) | Create | T3a |
| `src/diagrams/activity-legacy/{index,layout,layout-geometry,renderer}.ts` | Modify | T3a |
| `src/diagrams/activity-legacy/renderer-cluster.ts` (export style helpers) | Modify | T2b |
| `tests/unit/activity-legacy/*elk*.test.ts` | Create | T2a, T2b, T3a |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md` | Modify | batch closes, T4 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: gate](batch-1/overview.md) | T1 | [x] |
| [2: the adapter](batch-2/overview.md) | T2a, T2b | [x] |
| [3: wiring and residuals](batch-3/overview.md) | T3a, T3b | [x] |
| [exit](batch-exit/overview.md) | T4 | [x] |
| [squash](batch-squash/overview.md) | T5 | [x] |

## Done when (issue #158)

- [x] `pragma-elk` and `pragma-elk-if` are at 0 diffs, or each remaining diff is named with its mechanism and
      `file:line` in the row's `reason`.
- [x] Every `elk-*` row is at 0 diffs, or is named the same way; a separable or ruling-bound residual is on a filed
      issue the journal names.
- [x] A legacy diagram with the pragma is laid out by ELK: `activityLegacyPlugin.requiresElk` answers `isUseElk()`, and
      `layoutSync` without a backend throws `ELK_RENDER_SYNC_UNSUPPORTED` rather than falling back to dot-engine.
- [x] No legacy row without the pragma moves; the DOT gate is unchanged; 0 conformant losses in every engine, base
      survey against final survey. `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` pass.

## Documents

- [decisions.md](decisions.md): D1 to D7, operational readiness, auto-confirmed decisions, pre-flight.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `measure.mts` and `probes/` (19 `.puml` + `jar/*.svg` from `scripts/oracle-render.sh`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `scripts/oracle-render.sh`, `gh issue`). Deliberately not regenerated: the SessionStart hook compares it with
the live `.claude/settings.json`.

## Mission summary (2026-11-24)

- **Tasks:** T0 to T4 done as planned; T5 (squash) follows. T3b had no residual and took the push-forward instead:
  8 more authored probes.
- **Final measurement:** `measure.mts tests/fixtures/activity-legacy` prints **rows 29 zero 28 open 1 throw 0**.
  `pragma-elk`, `pragma-elk-if` and the 19 planning `elk-*` rows are at 0, and so are 7 of the 8 new probes. The
  nonzero row is `elk-inner-concurrent`, a jar error page at line 5 where we also error. Its reason in
  `authored-baseline.json` is the 2026-10-10 error-page ruling, and its message is "Syntax Error? (Assumed diagram
  type: activity)". `ActivityDiagram#concurrentActivity` has no caller upstream.
- **Gates:** the ratchet has 139 authored rows (409 tests) and the DOT gate is unchanged at 227. Every engine has 0
  conformant lost against `7be0c7129`. `dist/*.d.ts` is identical. `npm test`, `typecheck`, `lint`, `build` and
  `format:check` pass.
- **Decisions:** 15 journal rows. Three findings correct the brief: `getClusterBackColor` ignores the partition
  colour, `MyElkEdge#getStyle` signs the diagram's own style name, and `c?` is a quantifier. D1 and D3 are flagged
  for review in the #158 comment.
- **Issues:** none filed, and no ruling is needed. #158 has the close-out comment and stays open until merge.
- **Follow-ups** (`.agent-notes/lae-T2a.md`):
  - Chen's adapter still signs `classDiagram` for its edge style.
  - `CONCURRENT_ACTIVITY` is unreachable from source.
