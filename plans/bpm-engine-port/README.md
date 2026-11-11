# bpm-engine-port (bpe)

**Read first, every start and after every compaction:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

Source: GitHub issue #130. Planned unattended on 2026-11-11 at `feature/parity-queue` `0046f6a8c`.

## Objective

Port `net/sourceforge/plantuml/bpm/` (36 Java files, 3,312 lines, D1) file for file into `src/diagrams/bpm/`. Register
it at `PSystemBuilder.java:141`, and port the three activity Ftiles it draws through (D2). Then:
- Take the **7 `@startbpm` rows** to conformant or a named end (D12).
- Author probes past them (D6).
- Pin everything in a new `svg-bpm` ratchet (D7).
- Lose no conformant row in any engine, and regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-11 on `0046f6a8c`

No plugin registers `BPM`, so every `@startbpm` source gets the "unknown diagram type" sentinel. All 7 rows sit in the
**`unknown`** cache tree (`test-results/dot-cache/unknown/`, `parity-unknown.json`), and the jar draws all 7. No cached
source embeds `{{bpm`, and upstream has no such embedded keyword. `measurements/bpm-rows.mjs` finds the 7
(`measurements/planning-rows.json`): all diverged, and every first diff is `svg/@background`. Overall: 5,701
conformant, 120 structural-match, 103 diverged and 3 oracle-error, of 5,927.

**Feature census of the 7:**

| Feature | Rows |
|---|---|
| Docked events (`:label;`) | all 7 |
| `new branch`/`else`/`end branch` | 3 |
| Nesting | 1 (`loxeke-95`) |
| Merges (`id:<+>`) | 3 |
| `resume` | 2 |
| `goto` | 1 (`jomege-63`, 23 lines, the longest) |

None has creole, a blank line, an option, or an error.

**Upstream tests:** none beyond `DiagramTypeTest.java`. **55 planning probes** are in [probes/](probes/), rendered with
`scripts/oracle-render.sh` on 2026-11-11 into `/tmp/bpe-plan/oracle`: 34 draw `BPM`, `cov-embedded` draws a
`SEQUENCE`, and 20 are jar error or Welcome pages (D5). T3b copies them, except `cov-duplicate-merge-id` (D4).

How to read the table below:
- **Status** says what planning established. **Read** means planning read the Java. **Probe** means a jar render on
  2026-11-11 showed it.
- Every task still opens the Java itself and finds the line.

| What the jar does | Java | Status | Task |
|---|---|---|---|
| Events replay into a grid of `Line`×`Col` chains: a docked event or merge gets a new column, `resume`/`goto` a new line under the target | `BpmDiagram#createGrid`, `#addInGrid`; `ChainImpl` | Read + Probe (all rows) | T1c, T2b |
| `new branch` adds `$branchA<uid>`. The second arm adds `$branchB<uid>` and resumes A, later arms `goto` B, `end branch` `goto`s B | `BpmDiagram#newBranch/elseBranch/endBranch`, `BpmBranch` | Read + Probe (`bogebu-46`, `cov-branch-*`) | T2a, T2b |
| Connections: the first destination starts horizontally, later ones vertically, filling crossed cells with blue puzzles | `Grid#addConnections`, `drawStartHorizontal/Vertical`, `addPuzzle` | Read + Probe | T1c |
| Three cleaners loop until none changes the grid; `CleanerMoveBlock` never does, but pads the column chain | `BpmDiagram#cleanGrid`, `Cleaner*` | Read | T1c |
| A start circle (style `circle`), a diamond (legacy `#FEFECE`/`#A80036`), a rounded box (style `activity`) | `BpmElement#toTextBlockInternal`; `FtileCircleStart`, `FtileDiamond`, `FtileBox` | Read + Probe | T1a, T1b, T2a |
| Black grid lines with no closing edge; cells centred in `+30` margins, drawn line by line | `GridArray#drawU`, `drawInternalGrid` | Read + Probe (`cov-merge-only`) | T2a |
| A fresh `SkinParam`: no skinparam/style/title/scale command exists; `!option debug` and `handwritten` reach | `BpmDiagram#getTextBlock`, `BpmDiagramFactory#initCommandsList` | Read + Probe (`cov-skinparam`, `cov-option-*`) | T1a, T3a |
| A blank line is `Syntax Error?`; a non-command first line is the Welcome page | `PSystemCommandFactory` (no `CommonCommands`) | Probe (`cov-blank-lines`, `cov-title`) | T2b |
| `getById` on duplicate ids is nondeterministic in the jar (`HashMap` of identity hashes) | `Grid#getById`, `Coord#hashCode` | Read + Probe (6 renders, 2 outputs) | T1c (D4) |
| Crashes: NPE (unknown id, missing exit), `IllegalStateException`, `ClassCastException`, `NoSuchElementException` | `Grid#getCell`, `Grid#addPuzzle`, `ArrayDeque#getLast` | Read + Probe | T1c, T2b (D5) |

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.
- T0 commits this brief.
- One unsigned commit per task, in the **main checkout, serially, no worktrees** (D10).
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission to **one commit** on the mission base sha named in the execution prompt, and
  tags `bpm-engine-port/pre-squash`.
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
- The baseline on `0046f6a8c` is in [decisions.md](decisions.md#baseline).
- Stay on graphviz 16.1.0 (`dot -V`). BPM never calls `dot`, but other engines' gates do.

## Measurement commands

The tools are under `plans/bpm-engine-port/measurements/`, adapted from nwp's and wrp's, plus `verdict-diff.mjs` from
`plans/description-divergence-drive/measurements/`. Rules for running them:
- Run with `node` or `npx jiti`, and type commands literally: the allowlist has no `bash plans/...`, `date`, or
  shell-variable prefixes.
- Producers run **alone** (`.claude/memory/parallel-surveys-fake-timeouts.md`).
- Never `cd` below the repo root.

The commands:
- **Survey**, always with `--out`: `npm run svg:survey -- unknown --out /tmp/bpe-<task>/parity-unknown.json`. A
  positional type with no `--out` clobbers `parity.json`.
- **Losses and moves:** `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> /tmp/bpe-<task>`
  exits 1 on a row that left conformant. `node plans/bpm-engine-port/measurements/survey-moves.mjs /tmp/bpe-b0/parity-unknown.json /tmp/bpe-<task>/parity-unknown.json`
  lists every moved row.
- **The 7 rows:** `node plans/bpm-engine-port/measurements/bpm-rows.mjs /tmp/bpe-<task> --json /tmp/bpe-<task>/rows.json`
  prints each with its oracle kind, verdict and first diff, and a count.
- **Every diff:** `npx jiti plans/bpm-engine-port/measurements/row-diffs.mts plans/bpm-engine-port/measurements/planning-rows.json /tmp/bpe-<task>/diffs.json [slug ...]`
  writes every diff, with our SVG beside the JSON.
- **Fixtures:** `npx jiti plans/bpm-engine-port/measurements/fixtures.mts [slug ...]` checks every
  `tests/fixtures/bpm/<slug>.puml` against its `<slug>.svg`, one line each.
- **Pins, from T4 on:** `npx jiti plans/bpm-engine-port/measurements/pin-bpm.mts [--write]` lists pin candidates.
- **Baselines, from T4 on:** `build-authored-baseline.mts <commit> [--write]`, `build-diff-baseline.mts <commit> [--write]`
  and `repin-routing-refusal.mts <commit> [--write]`.
- **Every engine, at batch close from batch 3:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. Exit 1 on a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.

`fixtures.mts`, `pin-bpm.mts` and the two baseline builders import `render-fixture-bpm.ts`, which T4 creates. T3a may
create it early; until then, use `renderSync` directly. `row-diffs.mts` needs only `renderSync`.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D12: amend `decisions.md` with the date, then halt.

These are **not** stops:
- A row that needs a ruling. It goes on a `needs-ruling` issue naming the row, and everything else finishes.
- A file outside a task's write-set. Change it and journal why.

`oracle/accepted-divergences.json` gains or changes no acceptance here.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that turn out to share a mechanism, or splitting one that runs past about 15 minutes.
- A residual diff on these rows or fixtures: read the Java and fix it in the task that owns it, or add a task.
- More authored `.puml` fixtures and oracles where a branch has no row.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks (D11).
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes in a shared klimt module, with its Java quote. A gain in another bucket
  counts for that bucket's issue: T5 comments there, or leaves the text in `.agent-notes/` if denied.

## Blast radius

- **Data model:** none.
- **API:** no public change expected; `dist/*.d.ts` is checked at T5. `block-extractor.ts#DiagramType` gains `'bpm'`.
  It is internal, and `plantuml-ts` has no consumers.
- **Dependencies:** none. BPM never reaches graphviz or dot-engine.
- **SVG output** changes on purpose, for `@startbpm` only.
- **Shared seams:**
  - `SkinParamFresh` gains an optional options argument and default members, and creole and help call it unchanged
    (T1a).
  - `AbstractFtile` may gain members (T1b).
  - `core/assemble-svg.ts` gains `BPM` on the titled path.
  - `core/block-extractor.ts` and `registered-plugins.ts` gain a row each.
  - The layering `ALLOWLIST` gains `bpm → activity/ftile` (D2).

| File | Action | Task |
|---|---|---|
| `src/core/skin/SkinParamFresh.ts` (+ a `SkinParamUtils`/`Rose` colour slice if absent) | Modify | T1a |
| `src/diagrams/activity/ftile/{Hexagon,AbstractFtile}.ts`, `ftile/vertical/{FtileCircleStart,FtileDiamondWIP,FtileDiamond,FtileBox}.ts` | Create, Modify | T1b |
| `src/diagrams/bpm/{Line,Col,Coord,Cell,Placeable,ConnectorPuzzle,AbstractConnectorPuzzle,ConnectorPuzzleEmpty,Chain,ChainImpl,Navigator,Navigators,Grid,GridCleaner,CleanerEmptyLine,CleanerInterleavingLines,CleanerMoveBlock}.ts` | Create | T1c |
| `src/diagrams/bpm/{BpmElementType,BpmElement,BpmBranch,BpmEvent,BpmEventAdd,BpmEventGoto,BpmEventResume,GridArray}.ts` | Create | T2a |
| `src/diagrams/bpm/{BpmDiagram,BpmDiagramFactory,Command*}.ts` | Create | T2b |
| `src/diagrams/bpm/index.ts`, `src/registered-plugins.ts`, `src/core/{block-extractor,assemble-svg}.ts`, `tests/architecture/layering.test.ts` | Create, Modify | T3a |
| `tests/unit/bpm/**`, `tests/unit/activity/ftile/**`, `tests/unit/core/skin/**` | Create | T1a to T3a |
| `tests/fixtures/bpm/**` | Create | T3b |
| `src/diagrams/bpm/**`, the T1 modules | Modify | T3c |
| `oracle/goldens/svg-bpm/**`, `tests/oracle/svg-conformance/{bpm.golden.ratchet.test.ts,bpm.diff-baseline.ratchet.test.ts,render-fixture-bpm.ts}` | Create | T4 |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, their count tests, `scripts/parity-dashboard-goldens.ts` | Modify | T4 |
| `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `planning/{next-missions,mission-guide,roadmap}.md`, `docs/catalog.md` | Modify | T3a to T5 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — skin, activity Ftiles, grid core](batch-1/overview.md) | T1a, T1b, T1c | [x] |
| [2 — elements, grid array, diagram, commands](batch-2/overview.md) | T2a, T2b | [x] |
| [3 — turn on, probes, residuals](batch-3/overview.md) | T3a, T3b, T3c | [x] |
| [4 — ratchet](batch-4/overview.md) | T4 | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #130)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its
  mechanism.
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D12, operational readiness, baseline.
- [task-contract.md](task-contract.md): what every task does and how it closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/): the 55 planning probe sources.
- [measurements/](measurements/): the tools above and `planning-rows.json`.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx jiti`,
`npm`, `scripts/oracle-render.sh`, `gh issue`). It was deliberately not regenerated: the SessionStart hook compares it
with the live `.claude/settings.json`.

## Summary (2026-11-11)

**Tasks:** T0, T1a, T1b, T1c, T2a, T2b, T3a, T3b, T3c, T4, T5 done (11/11), then T6 squash. Reorders, each journaled:
`BpmElement`/`BpmElementType` moved from T2a into T1c (the grid's casts need them), and the layering ALLOWLIST entry from
T3a to batch 1's close. T3c needed no code: every row and drawn fixture was zero-diff at turn-on.

**Verdicts:** the 7 `@startbpm` rows went diverged to conformant, zero diffs each (`unknown` 962/14/72 to 969/14/65);
overall 5,701 to 5,708 conformant of 5,927. Final full survey against `0046f6a8c`: 0 lost, 0 timeout/errored in every
engine. Census `unknown`: no row rose; the 7 fell 11 to 0.

**Authored:** 77 fixtures in `tests/fixtures/bpm/` (54 planning probes + 23 authored): 57 zero-diff, 20 jar error pages
where we also error (2026-10-10 ruling). `cov-duplicate-merge-id` is left out by D4.

**Ratchet:** `svg-bpm` pins all 7 rows and tracks the 77 authored rows; routing and refusal re-pinned the 7 rows as BPM
plus 7 golden twins each (no pin rose). No `diff-baseline.json`.

**Gates (T5 close tree):** recorded in the journal's last rows. Earlier closes: B1 (fix: layering), B2, B3, B4 (fix:
dashboard-goldens test), each with `npm test`, typecheck, lint, build and format:check at exit 0.

**Rows left open:** none. No `needs-ruling` issue; `oracle/accepted-divergences.json` and `DIVERGENCES.md` unchanged;
`dist/*.d.ts` identical to the base build.

**Decisions:** 18 journal rows; none flagged for review. Follow-ons are in `planning/next-missions.md` (bpe).

**CI risk:** the latest PR run's job timings could not be read (GitHub's jobs API returned 502 on runs 43056792224 and
42672148091). The mission adds 169 `svg-bpm` ratchet tests (small grids, sub-second each locally) and 7 rows to each of
the routing and refusal baselines; the routing/refusal part files are the existing slowest shards, so their per-test
budgets in `tests/helpers/ci-test-budgets.ts` are the thing to watch on the first PR run.

**Not done:** the #130/#136 comments were denied (`gh issue comment`); their text is in `.agent-notes/bpe-T5.md`.
