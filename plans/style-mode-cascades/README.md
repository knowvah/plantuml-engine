# style-mode-cascades (smc)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #120. Planned unattended on 2026-11-05 at `feature/parity-queue` `47346297c`.

## Objective

Dark mode, monochrome and reverse colour, malformed `<style>` blocks, and the `FontSize`, `LineThickness`,
`RoundCorner` and `Shadowing` cascades under `skin rose`, `!theme` and a skinparam declared after `<style>` match the
jar in every engine that draws them. In-scope rows end conformant or named with their mechanism (D10). Lose no
conformant row in any engine, pin every conformant row, and regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-05 on `47346297c`

Baseline gates on `47346297c`, run 2026-11-05 at planning: `npm test` 2013 files passed (1 skipped), 42377 tests
passed; `typecheck`, `lint`, `build` and `format:check` exit 0. The issue's numbers are dated, so they were re-measured. **93 open rows in 8 mechanism families**: 13 dss rows, 2
corpus rows and 78 of the 131 rows authored for this mission (D1). The authored rows come from
`measurements/gen-rows.mjs`, rendered by `scripts/oracle-render.sh`. Measured with `measurements/rows.mts`.

| Family | Open rows (diffs) | Evidence (read 2026-11-05) | Task |
|---|---|---|---|
| M3 malformed `<style>` | `sequence__scope-malformed-brace` 6, `-colour` 6; authored `*__malformed-novalue` in 7 engines, 6-40 | Stock jar exit 200: `Error in style definition: parsing` at the `<style>` line. `CommandStyleMultilinesCSS.java:84-98` returns `CommandExecutionResult.error`; `StyleParser.java:141` throws on a key with no value. A stray `}` alone parses (`:144-148`) | T1b |
| M4 dark-only `@media` value | `sequence__scope-media-dark-only` 25 | Stock jar crashes: `IllegalArgumentException: null/#111111` at `ValueImpl.asColor(ValueImpl.java:101)` from `TitledDiagram.calculateBackColor` (`:280-289`). Ours already throws at `ValueImpl.ts:134`; something catches it | T1c |
| M1 `skinparam mode dark` | dss `sequence__scope-dark-*` 5 × 17, `component__probe-dark` 63, `-dark-element` 2; authored `mode-dark` and `mode-dark-style` in 7 engines: sequence 22, component 10, state 7 and 41, usecase 7, activity, class, object 3 each (the note) | `TitledDiagram.java:292-294` returns `ColorMapper.DARK_MODE`, whose `fromColorSimple` takes the colour's `@media` partner (`ColorMapper.java:68-72`). The partners come from `plantuml.skin`'s `@media` block, parsed by our `StyleParser.ts:188,241` and paired by `ValueImpl.ts:138`. Ours: `theme-dark.ts` holds 5 literal defaults, and its header still says the parser has no `@media` | T2a-T2c |
| M2 monochrome and reverse colour | `activity/gigefo-15-cami497` 1 (`svg/@background`); authored `mode-monorev`, `mode-revdark`, `mode-revrbg`: activity 1-2, sequence 3-4, state 17-18; `state__mode-mono-style` 4 | `TitledDiagram.java:295-313`. Board, chart, gantt and salt pass `calculateBackColor` through `toSvgPaint(…, muteColorMapper(diagram))`; activity and sequence map the fragment but not the root background; state maps nothing | T3a, T3b |
| M5 `skin rose` shadow lost under `<style>` | dss `class__d3-skin-rose-element` 1, `component__probe-skin-rose` 1; authored `casc-control-rose` activity 9, class 1, component 1 | A `<style>` that sets only `note { FontSize 12 }` loses the rose `Shadowing` filter on the note and the start circle | T4a |
| M8 skinparam after `<style>` | dss `component__probe-skinparam-after-style` 34; authored `casc-*-after`: component fontsize, thickness 57; activity fontsize 64, thickness 24, shadow 2; class fontsize 24, roundcorner 14; state 4 rows | `CommandStyleMultilinesCSS.java:90` calls `SkinParam#applyPendingStyleMigration` (`SkinParam.java:254`), which converts skinparams through `FromSkinparamToStyle`; `SkinParam.java:230,329` call it too | T4b |
| M6 `!theme` with a `<style>` block | `activity/finadu-74-duvi890` 50; authored `casc-*-theme`: activity 70-74, state 60-103, class 14-20 (component and sequence 0) | Plain box under `!theme cerulean` reads the flat tiers, not the merged style: rx 13.021 against 4.167 (#119's comment on #120) | T4c |
| M7 state note reads no `<style>` `FontSize` | authored `state__casc-control-plain` 33, and every state `casc-*` row starts from it | Not yet diagnosed | T4d |

**Already conformant, pinned at T0:** 53 authored rows, among them every `mode-*` row of class, component, object and
usecase except dark (the description and class mappers already work, #113) and every sequence `casc-*` row, and the seven `malformed-straybrace` guards (a stray `}` parses upstream).
`component__probe-skin-rose` fell from its pinned 13 to 1 since dss; T0 re-pins it.

**Moved here (D1):** `gigefo-15` and `finadu-74` are listed on #121, but their remaining diffs are M2 and M6. T0
comments on #121. **Not taken:** `component__probe-cond-root` (#122 item 18); #138's partition `LineThickness`.

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits
this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees** (D9). Do not create another
branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha
named in the execution prompt, and tags `style-mode-cascades/pre-squash`. Never push: the user reviews, signs and
opens the PR for the whole branch.

## Quality gates (all four at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`npm test`, never `vitest run tests/unit`. New exports may need `npm run catalog` (drift-gated). A `vitest run
<paths>` that collects nothing exits 0: read the count.

## Measurement commands

Tools are under `plans/style-mode-cascades/measurements/`, plus two reused from
`plans/description-divergence-drive/measurements/`. Run with `node` or `npx jiti`. Type commands literally: the
allowlist has no `bash plans/...`, no `java`, no `date`, and no shell-variable prefixes. Producers run **alone**
(`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- `npx jiti plans/style-mode-cascades/measurements/rows.mts tests/fixtures/diagram-style-scope --diffs 5 <prefix ...>`:
  each row's diff count and its first diffs. `--json <out>` writes the pin's shape.
- `node plans/style-mode-cascades/measurements/stock-check.mjs <file.puml ...>`: the stock jar's verdict (D5).
- `node plans/style-mode-cascades/measurements/gen-rows.mjs <dir>`, then `scripts/oracle-render.sh <dir> <dir>/*.puml`:
  the authored rows and their oracles (T0 only).
- Survey a bucket, always with `--out`: `npm run svg:survey -- activity --out /tmp/smc-<task>/parity-activity.json`.
  A positional type with no `--out` clobbers `parity.json`.
- `node plans/unknown-bucket-triage/measurements/ubt-moves.mjs /tmp/smc-b0/parity-<type>.json /tmp/smc-<task>/parity-<type>.json`:
  moved rows; exit 1 on a loss.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every
  engine, at batch close. Exit 1 on a loss.
- `npx jiti plans/description-divergence-drive/measurements/measure-diff-baseline.mts`.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D10: amend `decisions.md` with the date, then halt. This includes a public
   `dist/*.d.ts` change, which D2 rules out.
5. `@knowvah/dot-engine` needs a change. File it (`docs/graphviz-issues/` and `TRACKER.md`) and carry on with other
   rows; halt only if nothing else can move.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else
finishes. `oracle/accepted-divergences.json` is never edited here (the user signs). A file outside a task's write-set
is not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, or merging two whose rows turn out to share a mechanism (M5, M6 and M8 may).
- A residual diff a fix uncovers: `compareSvg` short-circuits, so expect some. Read the Java and fix it in the task
  that owns it, or add a task.
- More authored rows where a branch has no row, generated and rendered the T0 way.
- A correct fix that raises another row's diff count (`compareSvg` is not monotonic): journal the row with its
  mechanism.
- Helper splits forced by the 500-line, CCN or NLOC hooks.
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes, with its Java quote. A gain in another bucket counts for that bucket's
  issue: T5 comments there.
- A mechanism that is genuinely large and separable: file a `queue:ready` issue, add a "Blocked by" line to #136
  (D10), and journal the measurement that proves it.

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief, baseline, authored rows](batch-0/overview.md) | T0 | [x] |
| [1 — error pages](batch-1/overview.md) | T1a-T1c | [x] |
| [2 — dark mode](batch-2/overview.md) | T2a-T2c | [x] |
| [3 — monochrome and reverse colour](batch-3/overview.md) | T3a, T3b | [x] |
| [4 — cascades](batch-4/overview.md) | T4a-T4e | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #120)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its mechanism.
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D10, operational readiness.
- [task-contract.md](task-contract.md): what every task does and how it closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief and is
byte-identical to the live `.claude/settings.json`. It was deliberately not regenerated, because editing it would
break that identity (the SessionStart hook compares them). That is why the stock-jar check is a `node` script.

## Summary (2026-11-06)

**Tasks:** 13 of 12 planned ran: T0, T1a-T1c, T2a, T2b+T2c (merged, one mechanism), T3a+T3b (merged, one run), T4d (moved
first), T4a, T4b, T4c, T4e (added: the state name font, journal row 26), T5; T6 squashes. Agents: `typescript-pro`
subagents in the foreground for T2a, T2b+T2c, T3a+T3b, T4a-T4e, each verified by the orchestrator (rows, ratchets,
surveys, d.ts) before its commit; T0, T1a-T1c and every batch close by the orchestrator.

**Rows, family by family (all in-scope rows conformant; none needed a divergence or a ruling):**
- M3 malformed `<style>`: the seven `*__malformed-novalue`, `sequence__scope-malformed-brace`/`-colour` → our error page
  where the stock jar errors (`stockError: true`, D5); the seven `malformed-straybrace` guards stay drawn and 0.
- M4 `sequence__scope-media-dark-only` → our crash page (stock jar `IllegalArgumentException`), `stockError`.
  `sequence__scope-single-line-slash` → 0 by the same rule.
- M1 dark mode: 5 `sequence__scope-dark-*`, `component__probe-dark`, `-dark-element`, and `mode-dark`/`-dark-style` in
  seven engines → 0.
- M2 monochrome/reverse: activity, sequence, state `mode-monorev`/`-revdark`/`-revrbg`, `state__mode-mono-style` → 0;
  `activity/gigefo-15-cami497` conformant, pinned.
- M5 rose shadow: every `*__casc-*-rose`, `class__d3-skin-rose-element`, `component__probe-skin-rose` → 0.
- M8 skinparam after `<style>`: every `*__casc-*-after`, `component__probe-skinparam-after-style` → 0.
- M6 `!theme` + `<style>`: every `*__casc-*-theme` → 0; `activity/finadu-74-duvi890` conformant, pinned.
- M7 state note/name font: `state__casc-control-plain` and every state `casc-*` → 0.

**dss rows:** T0 `rows 996 open 129` raw (130 pins above 0 incl. pre-existing) → `rows 996 open 48` raw; 93 rows fell, all
to 0, none rose. Of the 48, 11 are `stockError` rows (0 under the ratchet rule) and 37 are dss rows this mission did not
take (activity `loops-*` 10, `activity__probe-legacy`, 13 json and 13 yaml cascade rows; dss follow-ons 5-22).

**Verdicts per engine (survey, base `47346297c` → final):** activity conformant 605 → 610, structural-match 37 → 35,
diverged 236 → 233 (`finadu-74`, `gigefo-15`, `titope-07` diverged → conformant; `ronovu-01`, `vifiba-70` structural-match
→ conformant). Every other engine unchanged. 0 lost in every engine, 0 timeouts.

**Pins added:** 131 dss rows (T0); activity golden ratchet: `gigefo-15-cami497`, `finadu-74-duvi890`,
`titope-07-cixa052`, `ronovu-01-voku005`, `vifiba-70-repa468` (with routing/refusal twins and count constants);
`diff-baseline` `lulavi-01` 283 → 211, `rutaji-30` 280 → 208.

**Gates (final, `2d07498c7` source):** `npm test` 2025 files passed (1 skipped), 42594 tests, coverage gate green;
typecheck, lint, build, format:check exit 0. `dist/*.d.ts` byte-identical to the T0 build; `oracle/accepted-divergences.json`
unchanged.

**Decisions flagged for review:** journal row 7 (flag `stockError` only once ours errors), 15 (dark mode in the style
layer, not `buildTheme`; flag off the public types), 17-18 (dark element seeds removed), 22 and 33 (hand-edited stale
routing/refusal twins for new goldens), 29-31 (two-tier cascade patched per measured key: follow-on 1 in
`planning/next-missions.md`), 32 (activity box padding/corner read the merged style). Several tests were written after
their fix, with the dss rows as red evidence (rows 19, 22, 28, 30, 33, 34).

**Not done (session permissions):** the `gh` comments on #120 and #121 were denied by the auto-mode classifier; their text
is in journal rows 4 and 36. No `needs-ruling` or `queue:ready` issue was needed.

**CI risk:** the dss ratchet now renders 996 rows (867 → 998 tests, 5.6 s → 5.9 s locally, journal row 3); the queue's
pins since #146 and this mission's new goldens are unmeasured on the runner until the first PR run.
