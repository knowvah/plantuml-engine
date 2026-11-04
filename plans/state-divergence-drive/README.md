# state-divergence-drive (stdd)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #112. Planned unattended on 2026-11-03 at `feature/parity-queue` `4258f6c97`.

## Objective

Take the **174 open state rows** (159 diverged, 15 structural-match, of 299) to conformant against the jar, or name each one
that cannot get there with its mechanism and owner. Lose no conformant row in any engine. Pin every conformant row in the
state ratchet and regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-03 on `4258f6c97`

A fresh `npm run svg:survey -- state` moved 0 verdicts against the committed `parity-state.json`. 125 conformant (4 of them
error pages, so the census reads 121 at zero); 110 pinned, 11 more ready to pin. Every row and its leads: [rows.md](rows.md).

| Finding, each read in the diff and the Java | Rows | Task |
|---|---:|---|
| `__zaent_` is our own layout id leaking into a path `id` (`state-composite-classify.ts:258`). The jar has `Entity#getName` (`Link.java:106-114`) and `uniq` (`SvekEdge.java:944,1093-1106`). The issue's attribution to `Link.java` was half right: `zaent` appears nowhere under `net/` | 70 | T1a |
| Every border-point row diverges. `EntityImageStateBorder#drawU` (`:79-104`) opens no `entity` group and draws the label before the symbol | 30 | T1b |
| `SvekResult#drawU` (`:72-100`) draws all clusters, then all nodes, then all lines. We draw depth-first | 35 | T1c |
| `state A.X` makes `A` lazily (`CucaDiagram.java:333`, `GroupType.PACKAGE`), so its uid comes later and its title is bold | 46 leads, 6 sure | T1d |
| `-[#blue,dashed]->` and `<<style>>` on a link are stored and never drawn | 12 | T2a |
| `b <- a` and `a -l-> b` point the arrowhead at the wrong state. A real visual defect, not only a number | 21 | T2b |
| State colour specs (`##[dashed]blue`, `#line.dashed`, `line:red`) are kept as raw strings, unread | 9 | T3a |
| A composite's description is measured for width and not drawn (`kacifo-58`; `Cluster.java:486-503`) | 57 leads | T3c |
| `scale` and `skinparam dpi` are ignored: `state-commands.ts:136` drops the line, `statePlugin` passes no `scaleSpec` | 11 | T4a |
| `dotEqual` false on 7 rows, `layoutEqual` false on 21: layout inputs | 28 | T6 |

A family is a lead, and a `[childCount]` diff hides everything under it (`compareSvg` short-circuits). **Expect each batch to
reveal diffs nobody has seen yet.** Re-read the row after each fix.

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits this brief.
One unsigned commit per task, in the **main checkout, serially, no worktrees** (D3). Do not create another branch or merge main
into this one. The squash batch collapses the mission to **one commit** on the mission base sha named in the execution prompt,
and tags `stdd/pre-squash`. Never push: the user reviews, signs and opens the PR for the whole branch.

## Quality gates (all four at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
```

`npm test`, never `vitest run tests/unit`. New exports may need `npm run catalog` (drift-gated). A `vitest run <paths>` that
collects nothing exits 0: read the count.

## Measurement commands

Tools are under `plans/state-divergence-drive/measurements/`, run with `node` or `npx jiti`, each states its usage. Type
commands literally: the allowlist has no `bash plans/...`, `date`, or shell-variable prefixes. Producers run **alone**.

- `npm run svg:survey -- state --out /tmp/stdd-<task>.json`: one engine, about a minute. Always pass `--out`.
- `node .../state-moves.mjs /tmp/stdd-b0.json /tmp/stdd-<task>.json`: moved rows; exit 1 on a loss.
- `npx jiti .../row-diffs.mts <survey.json> /tmp/stdd-<task>-diffs.json [slug ...]`: every diff of the open rows.
- `node .../classify.mjs /tmp/stdd-<task>-diffs.json [out.md]`: rows into families.
- `npm run svg:survey`, then `node .../verdict-diff.mjs <base>`: every engine, at batch close. Exit 1 on a loss.
- `npx tsx scripts/svg-conformance-census.ts state --json tests/oracle/svg-conformance/census-state.json`, then
  `node .../pins-vs-census.mjs` (exit 1 on a nonzero pin) and `node .../pin-state.mjs <yyyy-mm-dd> [--dry]`.
- `scripts/oracle-render.sh <out-dir> <puml>` for an authored oracle, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D10: amend `decisions.md` with the date, then halt.
5. `@knowvah/dot-engine` needs a change. File it (`docs/graphviz-issues/` and `TRACKER.md`) and carry on with other rows; halt
   only if nothing else can move.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the rows, and everything else finishes.
`oracle/accepted-divergences.json` is never edited here (the user signs). A file outside a task's write-set is not a stop: change
it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, or merging two whose rows turn out to share a mechanism. Splitting one that grows past about 15 minutes.
- A family row that a task's fix does not move: read it again and hand it to the task that owns its real mechanism.
- Authored `.puml` fixtures and oracles where a branch has no corpus row.
- A correct fix that raises another row's diff count (`compareSvg` is not monotonic): journal the row with its mechanism.
- Helper splits forced by the 500-line, CCN or NLOC hooks. State's 16,820 lines already run close.
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent state defect the corpus exposes, with its Java quote.

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and pins](batch-0/overview.md) | T0, T0b | [x] |
| [1 — identity and draw order](batch-1/overview.md) | T1a, T1b, T1c, T1d | [x] |
| [2 — links](batch-2/overview.md) | T2a, T2b, T2c | [x] |
| [3 — state boxes and composites](batch-3/overview.md) | T3a, T3b, T3c, T3d | [x] |
| [4 — export and text](batch-4/overview.md) | T4a, T4b | [x] |
| [5 — parser and leaves](batch-5/overview.md) | T5a, T5b, T5c | [x] |
| [6 — layout inputs and the residue](batch-6/overview.md) | T6a, T6b, T6c, T6d | [x] |
| [exit](batch-exit/overview.md) | T7 | [x] |
| [squash](batch-squash/overview.md) | T8 | [x] |

## Status — DONE 2026-11-04

Batches 0-6 and the exit closed; the squash batch collapses the branch to one commit on `4258f6c97`
(`stdd/pre-squash` keeps the per-task history). Issue #112 stays open until the branch merges.

## Done when (issue #112)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its mechanism. 297 of 299 conformant; `viroxo-69` in `DIVERGENCES.md` "State diagrams" (graphviz issue 39), `xetase-70` on #144 (journal rows 38, 42-44; `measurements/final-rows.md`).
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue. The one new divergence is forced by `@knowvah/dot-engine`; no row needed a ruling (`oracle/accepted-divergences.json` untouched, journal row 46).
- [x] 0 conformant losses in every engine, baseline survey against final survey. `verdict-diff.mjs 4258f6c97` at every close and at exit: lost 0 (journal rows 12, 24, 34, 39, 45, 46).
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated. 293 pins (`state.golden.ratchet.test.ts` collects 295), report regenerated at every close (journal row 45).
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass. Exit run on the final tree (journal row 46).

## Summary

| | start (`4258f6c97`, 2026-11-03) | end (2026-11-04) |
|---|---:|---:|
| conformant / structural-match / diverged | 125 / 15 / 159 | 297 / 0 / 2 |
| state ratchet pins | 110 | 293 |
| routing gate (agree / rows) | 9187 / 9895 | 9370 / 10078 |
| refusal gate (rendering) | 9449 | 9632 |
| conformant rows lost, any engine | — | 0 |

Tasks: T0, T0b; T1a-T1d; T2a-T2c; T3a-T3d; T4a-T4b; T5a-T5c; T6a-T6d; T7; T8 -- one commit each, every
batch closed by the four gates, the full survey and the pin chain (journal rows 12, 24, 34, 39, 45).

Rows left and their ends: `xetase-70-zaza808` (embedded `{{ }}` edge label; issue #144, `queue:ready`, blocked by #136) and
`viroxo-69-fito663` (dot-engine placement on a border-point cluster; `docs/graphviz-issues/39-*.md`, `DIVERGENCES.md`).
Side findings filed: #144; graphviz issue 39; `planning/next-missions.md` "state-divergence-drive (stdd)" follow-ons 1-6.
Issues #120 and #122 carry a comment naming the rows this mission closed; #119's `lofabo-38` did not move.

**CI risk:** the state ratchet grew from 110 to 293 pinned goldens and the routing/refusal gates by 183 rows, all
measured on the dev box only; the first PR run on the runner is the first measurement there (see
`.claude/memory/catalog-ci-budget-correction.md`).

## Documents

- [decisions.md](decisions.md) — D1 to D10, operational readiness.
- [task-contract.md](task-contract.md) — what every task does and how it closes.
- [rows.md](rows.md) — the 174 rows and their families, as planned.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief and is byte-identical to the live
`.claude/settings.json`. It was deliberately not regenerated: editing it would break that identity (SessionStart hook compares them).
