# flow-engine-port (flp)

**Read first, every start and after every compaction:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

Source: GitHub issue #132. Planned unattended on 2026-11-11 at `feature/parity-queue` `14ccdcbba`.

## Objective

Port `net/sourceforge/plantuml/flowdiagram/` (5 files, 577 lines) into `src/diagrams/flow/`, and the reachable part of
`net/sourceforge/plantuml/golem/` into `src/core/golem/` (D1, D2). Register it at `PSystemBuilder.java:185`. Then:
- Take the **1 `@startflow` row** to conformant or a named end (D11).
- Author probes past it (D6).
- Pin everything in a new `svg-flow` ratchet with a multiset tier (D7).
- File the D4 `needs-ruling` issue.
- Lose no conformant row in any engine, and regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-11 on `14ccdcbba`

No plugin registers `FLOW`, and `block-extractor.ts` has no `flow` tag, so `@startflow` gets the "unknown diagram
type" sentinel. The one row, `bemixo-79-xulu250` (9 boxes, 9 paths), sits in the `unknown` cache tree. It is
`diverged`, and its first diff is `svg/@background`. `unknown` stands at 969/16/63 of 1,048.

**The finding that shapes this brief (D4):** the jar draws boxes in `HashMap<Tile, …>` identity-hash order, so its SVG
changes on every run. `bemixo` rendered 6 times gave 6 different SVGs and 1 multiset. After a `moveAllToEast` shift,
the layout can differ as well. The port uses insertion order, which the jar can always produce, so a multi-box row can
only be checked as a multiset. How such rows count is a ruling, filed by T3c.

**Upstream tests:** only `DiagramTypeTest.java`. **41 planning probes** are in [probes/](probes/), rendered with
`scripts/oracle-render.sh` on 2026-11-11 into `/tmp/flp-plan/oracle`: 27 draw `FLOW`, `cov-embedded` draws `CLASS`, and
13 are error or Welcome pages (D5).

How to read the table below:
- **Status** says what planning established. **Read** means planning read the Java. **Probe** means a jar render on
  2026-11-11 showed it.
- Every task still opens the Java itself and finds the line.

| What the jar does | Java | Status | Task |
|---|---|---|---|
| The first line is the root at (0,0)-(1,1). Each later line adds a tile 2 units from `lastTile` in its direction (default `s`), shifting east until it is free | `FlowDiagram#lineSimple`, `TilesField#createTile/getFreePosition/moveAllToEast` | Read + Probe | T1a, T2a |
| A bare id links `lastTile` to that id's tile. It must adjoin, or be a same-row WEST→EAST pair, else `IllegalArgumentException` | `FlowDiagram#linkSimple/getTileById`, `TilesField#addPath/buildPath/isAdjoining` | Read + Probe | T1a, T2a |
| Boxes: serif 14, black, in a 25-rounded `#FEFECE`/`#A80036` rectangle with a 1.5 stroke and a 10 inset, centred in a 200×70 cell | `ActivityBox`, `FlowDiagram#drawU` | Read + Probe | T1b, T2b |
| Paths: an `#A80036` line between box edges, and a 7×7 filled ellipse at the destination, shifted by -3 | `FlowDiagram#drawU/getCenter/movePoint` | Read + Probe | T2b |
| The canvas is `MinMaxGolem` width×100 by height×35, with 0 margins | `FlowDiagram#calculateDimension/getDefaultMargins`, `MinMaxGolem` | Read + Probe (201×71) | T1a, T2b |
| Draw order, and after a shift the layout, follow identity hashes | `HashMap` in `FlowDiagram`, `TilesField` | Read + Probe (6 renders) | T1a, T2a, T2b (D4) |
| No `CommonCommands`: `title`, `skinparam`, `scale` and blank lines are errors | `FlowDiagramFactory#initCommandsList` | Read + Probe | T2a (D5) |

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.
- T0 commits this brief.
- One unsigned commit per task, in the **main checkout, serially, no worktrees** (D9).
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission to **one commit** on the mission base sha named in the execution prompt, and
  tags `flow-engine-port/pre-squash`.
- Never push: the user reviews, signs and pushes.

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`.
- New exports need `npm run catalog` (drift-gated).
- A `vitest run <paths>` that collects nothing exits 0, so read the count.
- The baseline on `14ccdcbba` is in [decisions.md](decisions.md#baseline).
- Stay on graphviz 16.1.0 (`dot -V`). Flow never calls `dot`, but other engines' gates do.

## Measurement commands

The tools are under `plans/flow-engine-port/measurements/`, adapted from bpe's by name substitution, plus two new ones
(`multiset.mjs`, `jar-variants.mjs`) and `verdict-diff.mjs` from `plans/description-divergence-drive/measurements/`.
Rules for running them:
- Run with `node` or `npx jiti`, and type commands literally: the allowlist has no `bash plans/...`, `date`, or
  shell-variable prefixes.
- Producers run **alone** (`.claude/memory/parallel-surveys-fake-timeouts.md`).
- Never `cd` below the repo root.

The commands:
- **Survey**, always with `--out`: `npm run svg:survey -- unknown --out /tmp/flp-<task>/parity-unknown.json`. A
  positional type with no `--out` clobbers `parity.json`.
- **Losses and moves:** `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> /tmp/flp-<task>`
  exits 1 on a row that left conformant. `node plans/flow-engine-port/measurements/survey-moves.mjs /tmp/flp-b0/parity-unknown.json /tmp/flp-<task>/parity-unknown.json`
  lists every moved row.
- **The row:** `node plans/flow-engine-port/measurements/flow-rows.mjs /tmp/flp-<task> --json /tmp/flp-<task>/rows.json`.
- **Every diff:** `npx jiti plans/flow-engine-port/measurements/row-diffs.mts plans/flow-engine-port/measurements/planning-rows.json /tmp/flp-<task>/diffs.json [slug ...]`
  writes every diff, with our SVG beside the JSON.
- **Multiset check (D4):** `node plans/flow-engine-port/measurements/multiset.mjs <ours.svg> <jar.svg> [<jar.v2.svg> ...]`
  exits 0 when ours equals any of them as a multiset.
- **Jar variance (D6):** `node plans/flow-engine-port/measurements/jar-variants.mjs /tmp/flp-<task>/variants 8 <puml...>`
  classifies each source as `stable`, `order-only`, `geometry` or `error`.
- **Fixtures:** `npx jiti plans/flow-engine-port/measurements/fixtures.mts [slug ...]` checks every
  `tests/fixtures/flow/<slug>.puml` against its `<slug>.svg`, one line each. It is positional, so multi-box fixtures
  report diffs: read them with `multiset.mjs`.
- **Pins, from T4 on:** `npx jiti plans/flow-engine-port/measurements/pin-flow.mts [--write]`.
- **Baselines, from T4 on:** `build-authored-baseline.mts <commit> [--write]`, `build-diff-baseline.mts <commit> [--write]`
  and `repin-routing-refusal.mts <commit> [--write]`.
- **Every engine, at batch close from batch 3:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. Exit 1 on a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.

`fixtures.mts`, `pin-flow.mts` and the two baseline builders import `render-fixture-flow.ts`, which T4 creates. T3a may
create it early. `row-diffs.mts` needs only `renderSync`. All five were adapted by sed from bpm's: read each before
trusting its output, and journal any fix.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D11: amend `decisions.md` with the date, then halt.
5. A multi-box row is **not** multiset-equal to its oracle (or to any recorded variant), and the cause is not a port
   defect you can fix with a Java quote. That would mean the D4 premise is wrong.

These are **not** stops:
- A row that needs a ruling. It goes on the D4 `needs-ruling` issue, or a new one naming the row, and everything else
  finishes.
- A file outside a task's write-set. Change it and journal why.

`oracle/accepted-divergences.json` gains or changes no acceptance here, and `compare.ts` and the survey are not changed
(D4).

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that turn out to share a mechanism, or splitting one that runs past about 15 minutes.
- A residual diff on the row or fixtures beyond order: read the Java and fix it in the task that owns it, or add a task.
- More authored `.puml` fixtures and oracles where a branch has no row.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks (D10).
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes in a shared klimt module, with its Java quote. A gain in another bucket
  counts for that bucket's issue: T5 comments there, or leaves the text in `.agent-notes/` if denied.

## Blast radius

- **Data model:** none.
- **API:** no public change expected; `dist/*.d.ts` is checked at T5. `block-extractor.ts#DiagramType` gains `'flow'`.
  It is internal, and `plantuml-ts` has no consumers.
- **Dependencies:** none. Flow never reaches graphviz or dot-engine.
- **SVG output** changes on purpose, for `@startflow` only.
- **Shared seams:** `core/block-extractor.ts`, `core/assemble-svg.ts` and `registered-plugins.ts` gain a row each. No
  existing module changes behaviour.

| File | Action | Task |
|---|---|---|
| `src/core/golem/{TileGeometry,TileArea,Tile,Position,Path,MinMaxGolem,TilesField}.ts` | Create | T1a |
| `src/diagrams/flow/ActivityBox.ts` | Create | T1b |
| `src/diagrams/flow/{CommandLineSimple,CommandLink,FlowDiagramFactory,FlowDiagram}.ts` | Create | T2a |
| `src/diagrams/flow/{FlowDiagram,flow-export}.ts` | Create, Modify | T2b |
| `src/diagrams/flow/index.ts`, `src/registered-plugins.ts`, `src/core/{block-extractor,assemble-svg}.ts` | Create, Modify | T3a |
| `tests/unit/golem/**`, `tests/unit/flow/**` | Create | T1a to T3a |
| `tests/fixtures/flow/**` | Create | T3b |
| `src/diagrams/flow/**`, `src/core/golem/**` | Modify | T3c |
| `oracle/goldens/svg-flow/**`, `tests/oracle/svg-conformance/{flow.golden.ratchet.test.ts,flow.diff-baseline.ratchet.test.ts,flow.multiset.ratchet.test.ts,render-fixture-flow.ts,svg-multiset.ts}` | Create | T4 |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, their count tests, `scripts/parity-dashboard-goldens.ts` | Modify | T4 |
| `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `planning/{next-missions,mission-guide,roadmap}.md`, `docs/catalog.md` | Modify | T3a to T5 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — golem, activity box](batch-1/overview.md) | T1a, T1b | [x] |
| [2 — commands, diagram, export](batch-2/overview.md) | T2a, T2b | [x] |
| [3 — turn on, probes, residuals and ruling](batch-3/overview.md) | T3a, T3b, T3c | [x] |
| [4 — ratchet](batch-4/overview.md) | T4 | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #132)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its
  mechanism. Multi-box rows are multiset-equal and named on the D4 `needs-ruling` issue (D11 #4). *(journal 13, 14, 18; #174)*
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue. *(none added; #174)*
- [x] 0 conformant losses in every engine, baseline survey against final survey. *(journal 21)*
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated. *(journal 18-19, 21)*
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass. *(journal 21)*

## Documents

- [decisions.md](decisions.md): D1 to D11, operational readiness, baseline.
- [task-contract.md](task-contract.md): what every task does and how it closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/): the 41 planning probe sources.
- [measurements/](measurements/): the tools above and `planning-rows.json`.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx jiti`,
`npm`, `scripts/oracle-render.sh`, `gh issue`). It was deliberately not regenerated: the SessionStart hook compares it
with the live `.claude/settings.json`.

## Summary (T5, 2026-11-12)

**Status: DONE.** 10 of 10 tasks before the squash (T0, T1a, T1b, T2a, T2b, T3a, T3b, T3c, T4, T5; T6 squashes).

- **Port:** `flowdiagram/` (5 files) → `src/diagrams/flow/`; `golem/{TileGeometry,TileArea,Tile,Position,Path,MinMaxGolem,TilesField}`
  → `src/core/golem/` (D1's unreachable members not ported); registered at `PSystemBuilder.java:185`. `HColors` gained
  `MY_YELLOW`/`MY_RED`.
- **Verdicts:** overall 5,708 / 122 / 94 / 3 (conformant / structural / diverged / oracle-error) of 5,927, before and
  after; `unknown` 969 / 16 / 63 before and after. `bemixo-79-xulu250` left the unknown-type sentinel
  (`svg/@background`) and is multiset-equal to its oracle, 605×421, but stays `diverged` on box order (D4).
- **Authored (69):** 18 equal (17 one-box + `cov-embedded`), 13 error pairs (also errors on release 1.2026.8), 38
  multi-box multiset-equal (10 positionally equal by chance; 3 geometry fixtures with 2/4/4 jar layouts).
- **Ratchet:** `svg-flow` — empty `ratchet.json` (no conformant row yet), `multiset.json` (bemixo),
  `authored-baseline.json` (69 rows), multiset tier; routing `agree` 11011 → 11013, known-misroute 23 → 22; refusal
  rendering 11035 → 11036.
- **Gates:** every batch close green; final run in journal row 21.
- **Decisions:** D1-D11 held; no stop condition fired. Journal rows 3, 4, 7, 15 (a corrected vacuous measurement), 17
  and 18 record judgement calls.
- **Open:** ruling **#174** (bemixo + 38 multi-box fixtures). The #136 "Blocked by #174" comment and the #132/#136
  close-out comments were denied; texts in `.agent-notes/flp-T3c.md` and `flp-T5.md`.
- **CI risk:** low. Latest PR run's slowest shard 10m21s; routing/refusal part-2 files 152 s / 146 s; flow adds 1 row
  to each walker and ~190 small ratchet tests (`.agent-notes/flp-T5.md`).

