# package-title-wrap (ptw)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #219 (found while porting upstream `927f7531ddf` / `f29aa9bd058` on the oracle re-pin).
Planned unattended on 2026-11-23 at `feature/parity-queue` `7f359ac55`.

## Objective

In a description diagram an empty `package` is a leaf. Its `getUSymbol()` is set, so
`GeneralImageBuilder.java:206-210` builds an `EntityImageDescription`, not an `EntityImageEmptyPackage`. Its image
is `USymbolFolder.asSmall(name, desc, stereo)` (`EntityImageDescription.java:206-210`), where:

- `name` is `BodyFactory.create2(…, codeDisplay, …, styleTitle)` (`:201-202`). That is a `BodyEnhanced1`
  (`BodyFactory.java:74-77`) whose lines are `MethodsOrFieldsArea`s, created with `style.wrapWidth()`
  (`cucadiagram/MethodsOrFieldsArea.java:255`, `:264`), the **title** style's `MaximumWidth`.
- `desc` is empty for a package whose display `equalsLike` the code (`:180-183`); otherwise it is `create3(display, …,
  style.wrapWidth(), …)` (`:184-188`), wrapped at the **body** style's `MaximumWidth`.

The issue says the renderer wraps and the sizer does not. Planning found that is only one of three mechanisms on
this tree, so the issue's own fixture fails on both sides (the `skinparam wrapWidth` form fails too, against the
issue's text):

| | Mechanism | Our origin | Upstream | Task |
|---|---|---|---|---|
| M1 | the title never wraps, in sizer **and** renderer | `EntityImageDescriptionName.ts:135` (`wrapWidth: LineBreakStrategy.NONE`) | `MethodsOrFieldsArea.java:255,264` | T2a |
| M2 | the folder **label** sizer reads `skinparam wrapWidth` only; the renderer reads the style first | `leaf-sizing-folder.ts:138` (`opts?.wrapWidth`) | `EntityImageDescription.java:184-188` | T2b |
| M3 | a `\n` in the name draws the name twice (title and label) | `EntityImageDescriptionDelegates.ts:352`, `leaf-sizing-folder.ts:137` (plain `===`) | `EntityImageDescription.java:180-182` (`equalsLike(getWithNewlines(name))`) | T2c |

Ruled out at planning: `ClusterHeader` (a non-empty package's title already wraps: `ptw-control-cluster` is 0), the
class-diagram `EntityImageEmptyPackage` path (`ptw-upstream-3018`, upstream's own `f29aa9bd058` fixture, is 0), and
`skinparam wrapWidth` reaching the style (`FromSkinparamToStyle.ts:287` mirrors `FromSkinparamToStyle.java:260`).

## Starting state, measured 2026-11-23 on `7f359ac55`

`npx tsx plans/hidden-note-host/measurements/measure.mts plans/package-title-wrap/measurements/probes` prints
**rows 17 zero 5 open 12 throw 0**. Full table: [measurements/plan-baseline.txt](measurements/plan-baseline.txt).

| Rows (diffs today) | Expected owner |
|---|---|
| `ptw-issue` 59, `ptw-skinparam` 59, `ptw-element-style` 59, `ptw-fits` 4, `ptw-stereo` 55, `ptw-title-only` 49 | T2a |
| `ptw-as-label` 30, `ptw-folder` 30 | T2b |
| `ptw-linked` 107, `ptw-nested` 73 | T2a + T2b |
| `ptw-newline` 60, `ptw-ctl-newline` 25 | T2c (+ T2a for `ptw-newline`) |
| controls at 0: `ptw-as-label-skinparam`, `ptw-control-cluster`, `ptw-control-nowrap`, `ptw-node-group`, `ptw-upstream-3018` | must stay 0 |

`ptw-title-only` separates M1 from M2: `package { title { MaximumWidth 100 } }` wraps the jar's titles and leaves
`P`'s label unwrapped. `ptw-ctl-newline` is M3 with no wrap setting at all.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.

- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt, and
  tags `package-title-wrap/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Run `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/`, `docs/` or `plans/` while a gate is running.
- The complexity hook blocks a file over 500 lines or a function over 30 NLOC.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Probes:** `npx tsx plans/hidden-note-host/measurements/measure.mts <dir> [out.json]`. Before T1, `<dir>` is
  `plans/package-title-wrap/measurements/probes`; from T1 on it is `tests/fixtures/package-title-wrap`.
- **Authored gate:** `npx vitest run tests/oracle/svg-conformance/package-title-wrap.authored.test.ts`; read the count.
- **Engines:** `npm run svg:survey -- component --out tests/oracle/svg-conformance/parity-component.json` (same for
  `usecase`, `class`, `unknown`, `c4`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete any
  `svek-N.dot` it leaves in the out dir.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D5, for example a jar oracle where a package title wraps at the body style and not
   the title style. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change or a new dependency.
6. A fix needs a write to `@knowvah/dot-engine`, `@knowvah/elk-engine`, elkjs, `~/git/graphviz` or
   `~/git/knowvah/plantuml`. File the finding instead.

**These are not stops:**

- A file outside a task's write-set inside this repository. Change it and journal why.
- A residual with a separable mechanism (one that also shows with no wrap setting and no `\n`): measure it, file a
  `queue:ready` issue with the measurement and `file:line`, give the row that `reason`, continue.
- A residual only a maintainer can end (it would need a new `DIVERGENCES.md` entry): file a `needs-ruling` issue with
  the evidence, name it in the row's `reason`, continue.

## Push-forward (decide, journal, continue)

- Authoring extra probes for a branch you touch, each with its oracle from `scripts/oracle-render.sh`, each joining
  the gate. Candidates: `package { title { MinimumWidth 200 } }` on an empty package (the sizer's
  `measureShownFolderTitle` never passes `minimumWidthTitle`, which the renderer does:
  `EntityImageDescriptionName.ts:196-202` vs `leaf-sizing-folder-title.ts:178`); a creole `**bold**` title over the
  wrap width; an empty package under `!pragma layout elk`; an empty `frame`/`rectangle`/`cloud` group with a long
  title; `skinparam packageStyle rectangle` with a long empty package.
- Fixing what such a probe exposes inside the mission when the fix is under ~20 lines, has a `file:line` origin, and
  moves no conformant row. Journal it. Otherwise file it.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none public. `EntitySizing` (internal, `LeafSizingSubject.ts:64`) and
  `EntityImageDescriptionPaint` gain a title wrap width. `dist/*.d.ts` must not move.
- **Dependencies:** nothing new.
- **Behaviour:** only description leaves of the `package` symbol (M1, M3) and the folder family's label sizing
  (M2) when a wrap width is set. Every other row is held by the description goldens and the survey's verdict-diff.

| File | Action | Task |
|---|---|---|
| `tests/fixtures/package-title-wrap/*.{puml,svg}` (17 rows) | Create | T1 |
| `tests/oracle/svg-conformance/package-title-wrap.authored.test.ts` | Create | T1, T2a, T2b, T2c |
| `src/core/svek/image/EntityImageDescriptionName.ts` (`titleStyle`, `buildCreate2Name`, `EntityNamePaint`) | Modify | T2a |
| `src/core/svek/image/EntityImageDescription.ts` (paint field, the `buildEntityName` call) | Modify | T2a |
| `src/core/svek/image/LeafSizingSubject.ts` (`EntitySizing.wrapWidthTitle`) | Modify | T2a |
| `src/diagrams/description/description-entity-style.ts` (`entitySizing`) | Modify | T2a |
| `src/diagrams/description/renderer-entity.ts` (paint) | Modify | T2a |
| `src/core/svek/image/leaf-sizing-folder-title.ts`, `leaf-sizing-folder.ts` | Modify | T2a, T2b, T2c |
| `src/core/svek/image/EntityImageDescriptionDelegates.ts` (`buildDesc`) | Modify | T2c |
| `tests/unit/core/svek/image/leaf-sizing-folder-*.test.ts` | Modify / Create | T2a, T2b, T2c |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md` | Modify | batch closes, T3 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: gate](batch-1/overview.md) | T1 | [x] |
| [2: three mechanisms](batch-2/overview.md) | T2a, T2b, T2c | [x] |
| [exit](batch-exit/overview.md) | T3 | [x] |
| [squash](batch-squash/overview.md) | T4 | [x] |

## Done when (issue #219)

- [x] `ptw-issue` (the issue's fixture) and every row the table above gives to T2a, T2b or T2c is at 0 diffs, or each
      remaining diff is named with its mechanism and `file:line` in the row's `reason`.
- [x] The five control rows stay at 0.
- [x] The jar's svek DOT node size for `ptw-issue` (`1.900694 x 0.902778`) is the port's, within the svek-dot
      tolerance.
- [x] 0 conformant losses in every engine, base survey against final survey. `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` pass.

## Documents

- [decisions.md](decisions.md): D1 to D5, operational readiness, auto-confirmed decisions, pre-flight.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `plan-baseline.txt` and `probes/` (17 `.puml` + `jar/*.svg` from
  `scripts/oracle-render.sh`). The measurer is `plans/hidden-note-host/measurements/measure.mts` (D5).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `scripts/oracle-render.sh`, `gh issue`). Deliberately not regenerated: the SessionStart hook compares it with
the live `.claude/settings.json`.

## Mission summary (2026-11-24)

**Tasks:** T0, T1, T2a, T2b, T2c, T3 completed as planned; T4 (squash) follows.

**Pre-squash commits** (tag `package-title-wrap/pre-squash`): `2155f00ab` T0 brief, `f58611213` close 0, `92e89e7e1` T1,
`10e937863` close 1, `4a1db386c` T2a, `2d465b02b` T2b, `a79b93da3` T2c, `3a327ca9b` catalog fix, `abb0bf532` close 2,
plus the exit commit carrying this summary.

**Gate:** `rows 17 zero 5 open 12 throw 0` at the base, `rows 30 zero 27 open 3 throw 0` at the end (13 push-forward
probes added, each with a `scripts/oracle-render.sh` oracle). Every row the plan gave to T2a, T2b or T2c is at 0
except `ptw-nested`. Open rows today:

| Row | Diffs | Reason |
|---|---|---|
| `ptw-nested` | 39 | #278: `classifyAsCluster` builds `directLeafAstIds` in source order (`layout-classify.ts:26-28`), so a demoted empty sub-package precedes its cluster's leaves; upstream prints leaves first (`GraphvizImageBuilder.java:440-442`). Reproduces with no wrap setting. Every DOT node size equals the jar's. |
| `ptw-elk` | 39 | #279: under `!pragma layout elk` an empty package is laid out unlike the jar (31 diffs with no wrap). |
| `ptw-psr-leaf` | 1 | #280: a brace-less `package foo` under `packageStyle rectangle` draws a regular-weight name; the jar's is bold. |

**DOT:** `ptw-issue`'s package node is `1.900694 x 0.902778`, equal to the jar's.

**Engines:** verdict-diff against `7f359ac55`, lost 0 in every engine; no row in any `parity*.json` changed. Several
reruns were needed because other jobs drove the machine load to 270 (journal rows 7, 24).

**Gates:** test, typecheck, lint, build, format:check all exit 0 at every batch close. `dist/*.d.ts` unchanged.

**Decisions flagged for review:**
- Push-forward fixes beyond the three mechanisms: the sizer floors the title at `styleTitle`'s `MinimumWidth`
  (`BodyEnhanced1.java:182-184`); `skinparam packageStyle` now restyles an empty `package {}` group
  (`layout-package-style.ts`; `GeneralImageBuilder.java:205-207`). The second one corrects a doc comment that said
  an empty package is always drawn by `EntityImageEmptyPackage`.
- The class renderer's description leaf paints `wrapWidthTitle: theme.wrapWidth` so it matches its sizer (journal 11).
- #278's one-line fix was verified and then reverted, because it reorders every description cluster that holds an
  empty sub-group; it is filed `queue:ready` instead.

**Follow-ups:** #278, #279, #280 (`queue:ready`). `EntityImageRequirement` passes no wrap width to `create2`, although
upstream's style would wrap it (`.agent-notes/ptw-T2a.md`; no oracle row yet). #219 has the summary comment and stays
open until the branch merges.
