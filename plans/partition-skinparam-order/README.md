# partition-skinparam-order (pso)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #138 (from ruling #110 item 3, dss follow-on 7). Planned unattended on 2026-11-12 at
`feature/parity-queue` `71d02f38f`.

## Objective

An activity frame (`partition`, `group`, `package`, `rectangle`, `card` with a `{ }` body) takes its fill, line and
title colour from ONE merged style. That style is `FtileGroup.getStyleSignature(symbol)` (`FtileGroup.java:89-92`:
`root, element, activityDiagram, <symbol>, composite`), merged with the builder current at the command
(`CommandPartition3.java:160-161`). The constructor reads all three colours off it (`FtileGroup.java:99-102`).

`skinparam Partition*` converts onto `composite` (`FromSkinparamToStyle.java:131-133`). A symbol's own key converts
onto the symbol:
- `rectangle*` and `card*` through `addMagic` (`:212,223`, body `:251-266`);
- `package*` onto both `package_` (`:129`) and `group` (`:127-128`).

The two selectors are equally specific, so the value with the higher priority wins, and every skinparam takes the
next counter value (`ValueImpl.java:51-55`, `DarkString.java:54-57`). In other words, the **last declaration before
the frame wins**.

With no `<style>` and no `skin` line, our renderer instead walks a fixed chain of flat tiers:
`graph.partition*` → `elements.<symbol>` → skin default (`activity-renderer-composite.ts:202-224`). So `Partition*`
always wins, the chain ignores position (both theme tiers hold the document's final values), and `transparent` loses
to an earlier colour.

**The fix (D1):** read the three colours off the frame's merged style, which the activity pipeline already builds per
frame (`activity-box-style.ts:206-222`, carried as `node.compositeStyle`). That resolver is currently a hidden symbol
key on `Theme`. It becomes the declared field `graph.activity.compositeStyleOf`, following the `boxStyleOf`
precedent (`theme-graph-colors-b.ts:405`), as the maintainer leaned in #110.

## Starting state, measured 2026-11-12 on `71d02f38f`

There are **43 planning rows** in [probes/](probes/), named `<engine>__frameorder-<case>`. Their oracles were rendered
twice with `scripts/oracle-render.sh` into `/tmp/pso-plan/r{1,2}/`; all 43 are byte-stable. They were measured
through the dss row harness:
`npx jiti plans/style-mode-cascades/measurements/rows.mts /tmp/pso-plan/fx`. **29 are at 0 and 14 are open, 18 diffs
in all.**

| Rows | Today | Why |
|---|---|---|
| `activity__frameorder-{rectangle,card,package}-{background,border,font}-partition-then-own` (9), `group-{background,border}-partition-then-own` (2) | 1 diff each (2 for border: the rect and the tab path) | `Partition*` wins whatever the order |
| `activity__frameorder-rectangle-background-frame-then-own` | ours `#AAA`, jar `none` | a key declared after the frame reaches it |
| `activity__frameorder-rectangle-background-own-then-frame-then-partition` | ours `#BBB`, jar `#AAA` | same mechanism |
| `activity__frameorder-rectangle-background-partition-then-own-transparent` | ours `#BBB`, jar `none` | the `transparent` value is lost |
| every `*-own-then-partition`, every `partition-*`, `group-font-*` | 0 | the flat chain's order happens to agree |
| `*-styled` (2): the same keys with an unrelated `<style>` | 0 | the D3 gate writes `composite.<symbol>` from the builder |
| `component__frameorder-*` (5), `class__frameorder-*` (1) | 0 | `ClusterHeader.java:159-164` (cuca titles) is already right; kept as guard rows |
| `activity__frameorder-partition-style-linethickness` | 0 | the comment on #138 (`partition { LineThickness 3 }`) is already fixed; pinned as a guard |

**Evidence for D1** (planning, `npx jiti plans/partition-skinparam-order/measurements/resolver-check.mts <probe.puml...>`): on all 14 open rows, the existing hidden
resolver's `BackGroundColor`/`LineColor`/`FontColor`, taken at the frame's line, equals the jar's value. That covers
both position rows and the transparent row (`#00000000`).

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.
- T0 commits this brief.
- One unsigned commit per task, in the **main checkout, serially, with no worktrees** (D6).
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `partition-skinparam-order/pre-squash`.
- Never push. The user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`.
- New exports need `npm run catalog`, which is drift-gated.
- A `vitest run <paths>` that collects nothing exits 0, so read the count.
- Stay on graphviz 16.1.0 (`dot -V`).
- Never write under `src/`, `tests/` or `docs/` while a gate is running (ftp journal row 2).

## Baseline

Measured at planning on `71d02f38f`: see journal row 0.

## Measurement commands

Run each with `node` or `npx jiti`, and type every command literally. The allowlist has no `bash plans/...`, no
`date` and no env prefixes. Run producers **alone**, and never `cd` below the repo root.

- **Rows:** `npx jiti plans/style-mode-cascades/measurements/rows.mts <root> [--diffs N] [--json <out>] [prefix...]`.
  `<root>` is `/tmp/pso-plan/fx` until T1 lands, then `tests/fixtures/diagram-style-scope`. Use the prefix
  `activity__frameorder-` for the mission's activity rows.
- **Pin:** `node plans/partition-skinparam-order/measurements/pin-rows.mjs <rows.json> [--partial]`. It adds
  `__frameorder-` rows, lowers the others, and exits 1 on any rise.
- **Every engine, at batch close from batch 2 on:** run `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. Exit 1 means a loss.
  `verdict-diff` takes a **git ref**.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned `diagram-style-scope` row, leaves conformant, and you cannot state its
   mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D6. Amend `decisions.md` with the date, then halt. This includes the D1 premise: if
   reading the merged style cannot reproduce a row the jar draws, file a `needs-ruling` issue with the evidence, as
   #138 directs, and halt rather than reopen dss D3.
5. A `dist/*.d.ts` change beyond D4's one field, its resolver type and its JSDoc.
6. A planning row's jar output is not byte-stable across renders.

**These are not stops:**
- A file outside a task's write-set. Change it and journal why.
- A residual diff that a fix uncovers, provided its mechanism is the frame's merged style. Fix it in T2.

`oracle/accepted-divergences.json` and `DIVERGENCES.md` are never edited here: no divergence is needed.

## Push-forward (decide, journal, continue)

- More authored rows where a branch has none, each with a jar oracle and a pin. Examples: a stereotype
  `skinparam rectangleBackgroundColor<<foo>>`, `skinparam partition { ... }` nested blocks, `skinparam mode dark`.
- Helper splits forced by the complexity hooks, by upstream method, never by fitting.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.
- A styled row that would move only if the merged style read came before the gated bucket tiers: journal it as a
  follow-on (D2) rather than reorder.

## Blast radius

- **Data model:** none.
- **API:** `Theme.colors.graph.activity` gains the optional `compositeStyleOf` (D4). That is additive, and #138 calls
  it expected. No other public type changes.
- **Dependencies:** nothing new. No layout engine is involved: frames are drawn after the dot-engine layout.
- **Behaviour:** only activity frames drawn from a source with a converting skinparam (`Partition*`, `rectangle*`,
  `card*`, `package*`). Sources with none read skin defaults through the merged style that equal today's
  (`plantuml.skin:364-368`). The survey proves it.

| File | Action | Task |
|---|---|---|
| `tests/fixtures/diagram-style-scope/{activity,component,class}__frameorder-*.{puml,svg}` (43 pairs) | Create | T1 |
| `oracle/goldens/diagram-style-scope.json` | Modify | T1, T2 |
| `src/core/activity-box-style.ts` (resolver loses its hidden key), `src/core/theme-graph-colors-b.ts` (field) | Modify | T2 |
| `src/diagrams/activity/activity-composite-theme.ts` (read the field) | Modify | T2 |
| `src/diagrams/activity/activity-renderer-composite.ts` (fill, line, title colour off the style) | Modify | T2 |
| `src/diagrams/activity/activity-renderer-composite-symbols.ts`, `layout/compress/shapes-of-frame.ts`, `layout/canvas-origin-frame-tab.ts` (only if they read a frame colour) | Modify | T2 |
| `tests/unit/activity/pso-T2-frame-style-colors.test.ts` (new, beside `dss-T3d-scoped-fills.test.ts` and `dss-T4a-scoped-lines.test.ts`) | Create | T2 |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md`, `planning/next-missions.md` | Modify | T3 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: the 43 rows](batch-1/overview.md) | T1 | [x] |
| [2: the field and the reader](batch-2/overview.md) | T2 | [x] |
| [exit](batch-exit/overview.md) | T3 | [x] |
| [squash](batch-squash/overview.md) | T4 | [x] |

## Done when (issue #138)

- [x] Both orders of each key match the jar on `rectangle` and `partition`, plus `card`, `package` and `group` (D3),
  in the authored rows pinned in `oracle/goldens/diagram-style-scope.json`. All 43 rows are at 0.
- [x] 0 conformant losses in every engine, comparing the baseline survey with the final survey.
- [x] `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D6, operational readiness, and the auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md) and [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/): the 43 planning rows. [measurements/pin-rows.mjs](measurements/pin-rows.mjs): the pin tool.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief: `node`, `npx jiti`,
`npm`, `scripts/oracle-render.sh` and `gh issue`. It was deliberately not regenerated, because the SessionStart hook
compares it with the live `.claude/settings.json`.

## Summary (2026-11-13)

**Status:** T0 to T4 done; squashed onto `d5d89176b` as one unsigned commit, tag `partition-skinparam-order/pre-squash`. All 4 planned tasks plus 2 fix-level changes (the
`ROW_COUNT` test, the pin tool's `stockError` skip), both journalled.

| Gate | T0 (base) | Batch 1 | Batch 2 | Exit |
|---|---|---|---|---|
| `npm test -- --maxWorkers=4` | 48185 passed | 48228 passed (after fix 1 of 2) | 48297 passed | 48297 passed |
| typecheck, lint, build, format:check | 0, 0, 0, 0 | 0, 0, 0, 0 | 0, 0, 0, 0 | 0, 0, 0, 0 |

**Rows:** 43 planned `__frameorder-` rows: 14 open (18 diffs) before, 0 after; 29 guards at 0 throughout. 5 authored at
T2 (partition block both orders, stereotype key, mode dark x2): 1 open before (same mechanism), all 0 after. Pin
1172 -> 1220 rows, 14 + 32 stale `activity__spot-*` lowers, no rise.

**Verdicts, per engine:** unchanged in all 29 survey files (only `generatedAt` moved); `verdict-diff d5d89176b`:
lost 0, timeout or errored 0. `oracle/accepted-divergences.json` and `DIVERGENCES.md`: no diff.

**d.ts** (against `/tmp/pso-base-dts/`): `declare type ActivityCompositeStyleResolver` with its JSDoc, and
`compositeStyleOf?: ActivityCompositeStyleResolver;` in `graph.activity`. Nothing else.

**Decisions flagged for review:** journal row 8 (`isDark = false`, no Theme dark flag exists), row 9 (pin tool skips
`stockError` pins; spot pins were stale).

**CI risk:** PR #181's run (`43462968864`): slowest shard 3 at 10m03s. This mission adds one test file (64 tests,
2-93 ms each locally) and 5 ratchet rows: low.

**Follow-ons:** `planning/next-missions.md`, pso section (merged-style-first order for positional `<style>`; no
dark flag on Theme; `rows.mts` and `stockError`). Issue comments posted on #138 and #136.
