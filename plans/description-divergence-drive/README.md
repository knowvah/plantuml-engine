# description-divergence-drive (ddd)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #113. Planned unattended on 2026-11-04 at `feature/parity-queue` `197015c3a`.

## Objective

Take the **208 open description rows** to conformant against the jar, or name each one that cannot get there with its mechanism and owner: `component` 51, `usecase` 24, and the 133 `unknown` rows the jar draws as
DESCRIPTION. Lose no conformant row in any engine. Pin every conformant row in the svg-description ratchet and regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-04 on `197015c3a`

Fresh surveys of `component`, `usecase` and `unknown` report the same verdict totals as the committed files. In scope: 508 conformant (215 + 70 + 223), 37 structural-match, 170 diverged, 1 oracle-error. **77 conformant `unknown` rows are unpinned, and the pin tool's dry run says all 77 are ready.** Every open row and its leads: [rows.md](rows.md). The issue's per-bucket counts match; its "about 154" predates #109's 54.

| Finding, each read in the diff and the Java unless marked | Rows | Task |
|---|---:|---|
| 19 rows refuse, or draw another engine. The ledger holds each deciding line (*lead*) | 19 | T1a-c |
| `renderer-entity.ts` hard-codes `diagonalCorner: 0` and reads `RoundCorner` with no labels. `EntityImageDescription.java:168-169` reads both from the merged style, and `USymbolRectangle.java:65-70` picks `rect` or `path` | 22 | T2a |
| No `LineStyle` or `BorderThickness` reader per stereotype or per symbol, and `Cluster.java:402-407`'s stroke is unread | 18 | T2b |
| `Entity.java:755-768`: an entity keeps the builder current at its line unless the diagram used `skinparam` | 4 | T2d |
| Raw `text:Red`, `#line.dashed:blue` and `#?black:white` reach the SVG (#145) | 13 | T2e |
| The middle decor is drawn by class and not by description (`SvekEdge.java:982-990`) | 9 | T3a |
| `SvekEdge.java:924-942` pulls each line end to the magnetic border. Fixed offsets on a package or folder end, with `dotEqual` true | 14 | T3b |
| Quantifier text reaches the DOT and is not drawn | 3 | T3c |
| `core/klimt/drawing/hand/` is ported and description does not reach it (`vakixe-15`: `ellipse` against `polygon`) | 5 | T5a |

A family is a lead, and a `[childCount]` diff hides everything under it (`compareSvg` short-circuits). **Expect each batch to reveal diffs nobody has seen yet.** Re-read the row after each fix.

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees** (D3). Do not create another branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha named in the execution prompt, and tags `description-divergence-drive/pre-squash`. Never push: the user reviews, signs and opens the PR for the whole branch.

## Quality gates (all four at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
```

`npm test`, never `vitest run tests/unit`. New exports may need `npm run catalog` (drift-gated). A `vitest run <paths>` that collects nothing exits 0: read the count.

## Measurement commands

Tools are under `plans/description-divergence-drive/measurements/`, run with `node` or `npx jiti`, each states its usage. Type commands literally: the allowlist has no `bash plans/...`, `date`, or shell-variable prefixes. Producers run **alone**. Never `cd` below the repo root (`.claude/memory/serena-cd-scaffolding.md`).

- Survey one task, about 3 minutes, always with `--out`:
  `npm run svg:survey -- component --out /tmp/ddd-<task>/parity-component.json`, the same for `usecase` and `unknown`.
- `node .../moves.mjs /tmp/ddd-b0 /tmp/ddd-<task>`: moved rows in scope; exit 1 on a loss.
- `npx jiti .../row-diffs.mts <survey-dir> /tmp/ddd-<task>-diffs.json [slug ...]`: every diff of the open rows.
- `node .../classify.mjs /tmp/ddd-<task>-diffs.json [out.md]`: rows into families.
- `npm run svg:survey`, then `node .../verdict-diff.mjs <base>`: every engine, at batch close. Exit 1 on a loss.
- `npx jiti .../pin-description.mts <survey-dir> <label> [--write]`, `npx jiti .../measure-diff-baseline.mts`, `node .../flip-gate-rows.mjs <yyyy-mm-dd> <slug> ...`.
- `scripts/oracle-render.sh <out-dir> <puml>` for an authored oracle, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D10: amend `decisions.md` with the date, then halt.
5. `@knowvah/dot-engine` needs a change. File it (`docs/graphviz-issues/` and `TRACKER.md`) and carry on with other rows; halt only if nothing else can move.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the rows, and everything else finishes. `oracle/accepted-divergences.json` is never edited here (the user signs). A file outside a task's write-set is not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, or merging two whose rows turn out to share a mechanism. Splitting one that grows past about 15 minutes.
- A family row that a task's fix does not move: read it again and hand it to the task that owns its real mechanism.
- Authored `.puml` fixtures and oracles where a branch has no corpus row.
- A correct fix that raises another row's diff count (`compareSvg` is not monotonic): journal the row with its mechanism.
- Helper splits forced by the 500-line, CCN or NLOC hooks. `link-edge-attrs.ts`, `layout-dot-tree.ts` and `parse-helpers.ts` are already at or past 500.
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent description defect the corpus exposes, with its Java quote. A gain in `c4`, `class` or `object` counts for those issues.

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and pins](batch-0/overview.md) | T0, T0b | [x] |
| [1 — lines we refuse or misroute](batch-1/overview.md) | T1a-T1c | [x] |
| [2 — entity style](batch-2/overview.md) | T2a-T2e | [x] |
| [3 — links](batch-3/overview.md) | T3a-T3e | [x] |
| [4 — leaves, containers, notes](batch-4/overview.md) | T4a-T4g | [x] |
| [5 — whole-document](batch-5/overview.md) | T5a-T5f | [x] |
| [exit](batch-exit/overview.md) | T6 | [x] |
| [squash](batch-squash/overview.md) | T7 | [x] |

## Done when (issue #113)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its mechanism. 201 of 208 conformant; the 7 others in [measurements/final-rows.md](measurements/final-rows.md).
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue. No new divergence; no row needed a ruling; `oracle/accepted-divergences.json` untouched.
- [x] 0 conformant losses in every engine, baseline survey against final survey. Journal row 35.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated. 282 pinned.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass. Journal row 35.

## Summary

**Verdicts, in scope:** 508 conformant, 37 structural-match, 170 diverged, 1 oracle-error, to 709, 1, 5, 1. `component` 266 of 266, `usecase` 93 of 94, jar-DESCRIPTION `unknown` 350 of 356. `c4` gained 5 (2 to 7, #114). No engine lost a row.

**Tasks:** T0 to T5e as planned; T4h, added from T1c, became T5f and ended on #147 (D7). Mission fixtures: 32 with jar oracles under `tests/fixtures/ddd-T4x/`, which found defects no corpus row shows (journal row 23).

**Where the plan was wrong, measured:** D8 named five LaTeX rows permanent; they are conformant (row 32). `perapa-23` and `banatu-09`, unexplained since codd, are a per-draw `manageEntryExitPoint` (row 31). `jecici-56` is `svgDimensionStyle`, not transparency; `xidaxi-41` is a cloud seed, not the `~` label; `sifobi-72` is a creole quantifier, not the skin.

**Public types:** `dist/plantuml-ts.d.ts` gains two optional `Theme` fields, `stereotypeAlignment` and `svgDimensionStyle`, which the operational-readiness table wanted identical (row 35). Additive, and `plantuml-ts` has no consumers.

**CI risk, named:** the ratchet grew by 282 fixtures, unmeasured on the runner until the first PR run, and the slowest shard was 506 s of 600 s on #146. Locally the suite stayed level: 343 s at b0, 329 s at b5.

## Documents

- [decisions.md](decisions.md) — D1 to D10, operational readiness.
- [task-contract.md](task-contract.md) — what every task does and how it closes.
- [rows.md](rows.md) — the 208 rows and their families, as planned.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief and is byte-identical to the live `.claude/settings.json`. It was deliberately not regenerated: editing it would break that identity (SessionStart hook compares them).
