# activity-authored-rows (aar)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #121. Planned unattended on 2026-11-06 at `feature/parity-queue` `122daf4e9`.

## Objective

Every non-legacy activity row draws what the jar draws: arrow labels in loops, forks and branches, arrow colours,
stereotype and group styles, notes, creole, the `(X)` spot glyphs, and the parser gaps where we draw an error page
and the jar draws a diagram. In-scope rows end conformant or named with their mechanism (D10). Lose no conformant
row in any engine, pin every conformant row, and regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-06 on `122daf4e9`

Baseline gates: see journal row 1 (planning ran them; T0 records the numbers). The issue's numbers are dated and
#109 added 315 activity rows since, so everything was re-measured (D1). Activity survey: 610 conformant, 233
diverged, 35 structural-match; 114 diverged rows are legacy `(*)` (#123). **In scope: 154 corpus rows (Σ 18,202
diffs), 10 dss `loops-*` rows, 48 authored rows, `unknown/dijapi-54`.** Per-row table:
[measurements/planning-corpus.tsv](measurements/planning-corpus.tsv) (slug, verdict, diffs, family, task, first
diffs). Authored: [measurements/planning-authored.json](measurements/planning-authored.json).

| Family (D2) | Rows (Σ diffs) | Evidence at planning | Task |
|---|---|---|---|
| E1 skinparam block with `X<<st>>` keys or `/' '/` comments routes to class | 4 (297): `kizofi-56`, `fuficu-36`, `nabako-16`, `zugoco-10` | Ours: `Syntax Error? (Assumed diagram type: class)`; the jar draws activity | T1a |
| E2 activity3 parser gaps, item 12 | 7 (276): `munovo-17`, `rikegu-37` (`-> label;` first in a fork branch), `mivipi-10`, `suxeji-23`, `votigi-61`, `zesoto-64`, `nadata-32`; authored `long3-colour`, `-hex` 36-37 | Ours draws our error page. `CommandActivityLong3.java:126` takes a leading `#color` with a deprecation warning | T1b |
| A1 `->label;` in while, repeat, backward | 25 (1,400) | Canvas height and label box offsets, e.g. `bunefa-86` (`while/:task;/->label;/endwhile`) height 134 vs 145 | T2a |
| A2 labels around fork, split, merge; item 9, item 10 | 11 corpus (868), dss `loops-*` 10 (311-313), authored `splitnote-*` 62-78, `mergelabel-*` 14-83 | `InstructionSplit.java:155-158` hands a note after `end split` to the last branch's last instruction; ours stacks it below | T2b |
| A3 labels in if, elseif, switch; `MessageAlign` | 8 (321) | `vovemi-32` switch case labels, `bixece-33`/`gelizi-30`/`zifaza-86` `skinparam arrow { MessageAlign }` | T2c |
| R1 one `-[#c]->` colour, its placement in loops and branches | 11 (418) | `jozagi-52`: `-[#black]->` before `repeatwhile`, ours `#181818`, jar `#000`; `foxobi-84`: `-[#green]->` in a while body, ours `#181818` | T3a |
| R2 rainbow `-[#a;#b]->`, `colorArrowSeparationSpace`, `inc`/`out` colours | 17 (2,920) | `pegimu-03`/`temeku-00` 28 each: canvas 85 vs 100 and per-line strokes | T3b |
| R3 arrow `<style>`, item 16 | 4 (156); authored `groupin-*` 3 each | `FtileGroup.java:124-125` returns `inner.getInLinkRendering()`; ours draws the default | T3c |
| S stereotype and class styles on diamonds, start, stop, repeat; item 15 | 18 (355), `dijapi-54` | `FtileFactoryDelegatorIf.java:79-80` merges the diamond style `withTOBECHANGED(stereotype)` (`vupecu-35` 28) | T4a |
| G group, card, partition, rectangle style; notes on groups | 10 (1,003) | `gateti-51` rx missing; `botani-09` 117 | T4b |
| N, W `MaximumWidth`; swimlane `<style>` | 6 (564) | `raneku-06` 10, `vemeno-50` 133, `rutaji-30` 208, `lulavi-01` 211 | T4c |
| item 13 `(X)` spot glyphs | authored `spot-*` 32 rows, 2 each | `DriverCenteredCharacterSvg.java:72-81` outline; `activity-spot-glyph-data.ts` has A, B, E, G | T5a |
| C creole, sprites, emoji, qrcode, `<back:>` | 11 (1,962) | `tejere-86` filter ids, `cedero-01` gradient, `lugicu-06` sprite on a label, `jexavu-72` 1,619 | T5b |
| L `<latex>` | 6 (145) | KaTeX, a named permanent divergence (D5) | T5c |
| X large composite sources | 16 (7,517) | Mixes of A, R, S; re-measured after batches 2-4 | T6a |

**Moved here from #119:** `dijapi-54` (item 15), `vupecu-35`, the lone-sprite group title. **Not taken (D1):**
legacy `(*)` (#123), partition `LineThickness` (#138), dss json/yaml cascade rows.

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits
this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees** (D9). Do not create another
branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha
named in the execution prompt, and tags `activity-authored-rows/pre-squash`. Never push: the user reviews, signs and
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

Tools are under `plans/activity-authored-rows/measurements/`, plus reused ones named here. Run with `node` or
`npx jiti`. Type commands literally: the allowlist has no `bash plans/...`, no `java`, no `date`, and no
shell-variable prefixes. Producers run **alone** (`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd`
below the repo root.

- `npx jiti plans/activity-authored-rows/measurements/row-diffs.mts <parity-activity.json> <out.json> [slug ...]`:
  every diff of the named corpus rows (or every open row), plus our SVG beside `<out.json>`.
- `npx jiti plans/style-mode-cascades/measurements/rows.mts tests/fixtures/diagram-style-scope --diffs 5 activity__<group>`:
  authored and dss rows, diff count and first diffs.
- `node plans/style-mode-cascades/measurements/stock-check.mjs <file.puml ...>`: the stock jar's verdict (D4).
- `node plans/activity-authored-rows/measurements/gen-rows.mjs <dir>`, then `scripts/oracle-render.sh <dir> <dir>/*.puml`:
  authored rows and their oracles. Push-forward rows are added to `gen-rows.mjs`, the same way.
- `npm run svg:survey -- activity --out /tmp/aar-<task>/parity-activity.json`. A positional type with no `--out`
  clobbers `parity.json`.
- `node plans/unknown-bucket-triage/measurements/ubt-moves.mjs /tmp/aar-b0/parity-activity.json /tmp/aar-<task>/parity-activity.json`:
  moved rows; exit 1 on a loss.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every
  engine, at batch close. Exit 1 on a loss.
- `npx jiti plans/description-divergence-drive/measurements/measure-diff-baseline.mts`.
- `npx jiti plans/activity-divergence-drive/tools/pin-goldens.mts <source-tag> <close-label> <slug ...>`: pin (D8).

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D10: amend `decisions.md` with the date, then halt. This includes a public
   `dist/*.d.ts` change, which D7 rules out.
5. `@knowvah/dot-engine` needs a change. File it (`docs/graphviz-issues/` and `TRACKER.md`) and carry on with other
   rows; halt only if nothing else can move.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else
finishes. `oracle/accepted-divergences.json` is never edited here (the user signs). A file outside a task's write-set
is not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, splitting one whose rows turn out to hold two mechanisms, or merging two that share one.
- Moving a row to the task that owns its mechanism (`planning-corpus.tsv` is a heuristic, D2).
- A residual diff a fix uncovers: `compareSvg` short-circuits, so expect some. Read the Java and fix it in the task
  that owns it, or add a task.
- More authored rows where a branch has no row, generated and rendered the T0 way.
- A correct fix that raises another row's diff count (`compareSvg` is not monotonic): journal the row with its
  mechanism. A pinned row may not rise (stop 2).
- Helper splits forced by the 500-line, CCN or NLOC hooks.
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes, with its Java quote. A gain in another bucket counts for that bucket's
  issue: the exit comments there.
- A mechanism that is genuinely large and separable: file a `queue:ready` issue, add a "Blocked by" line for it to
  #136 (D10), and journal the measurement that proves it.

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief, baseline, authored rows](batch-0/overview.md) | T0 | [x] |
| [1 — error pages and parser gaps](batch-1/overview.md) | T1a, T1b | [x] |
| [2 — arrow labels](batch-2/overview.md) | T2a-T2c | [x] |
| [3 — arrow colours](batch-3/overview.md) | T3a-T3c | [x] |
| [4 — styles, groups, notes](batch-4/overview.md) | T4a-T4c | [x] |
| [5 — glyphs, creole, LaTeX](batch-5/overview.md) | T5a-T5c | [x] |
| [6 — composite rows](batch-6/overview.md) | T6a | [x] |
| [exit](batch-exit/overview.md) | T7 | [x] |
| [squash](batch-squash/overview.md) | T8 | [x] |

## Done when (issue #121)

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
byte-identical to the live `.claude/settings.json` (checked at planning). It was deliberately not regenerated:
editing it would break that identity, which the SessionStart hook compares.

## Summary — DONE 2026-11-06

Executed over two sessions on `feature/parity-queue` from `122daf4e9` (the first halted mid-T6a, journal row 39; the
second resumed at row 41). Squashed to one unsigned commit on the base by T8; per-task history on the local tag
`activity-authored-rows/pre-squash`. Not pushed.

**Tasks:** T0, T1a (merged into T1b, row 8), T1b, T2a-T2c, T3a-T3c, T4a-T4c, T5a-T5c, T6a (eight mechanism groups,
rows 41-49), T7, T8 — all planned tasks done.

**Gates (batch-6 close, row 50):** `npm test` 2053 files passed (1 skipped), 42769 tests, exit 0; `typecheck`,
`lint`, `build`, `format:check` exit 0; `dist/*.d.ts` byte-identical to T0's; `oracle/accepted-divergences.json`
unchanged since the base.

| | b0 (`122daf4e9`) | final |
|---|---|---|
| Activity survey (conformant / structural-match / diverged) | 610 / 35 / 233 | 755 / 4 / 119 |
| Unknown survey conformant | 859 | 860 (`dijapi-54`) |
| Every other engine | — | unchanged, 0 lost (`verdict-diff 122daf4e9`, row 50) |
| In-scope corpus rows conformant (of 154, Σ 18,202 diffs at b0) | 0 | 145 |
| dss activity rows (`rows N open M`) | 244 / 60 | 272 / 3 (the 3 are outside D1) |

**Pins added:** 146 activity golden-ratchet rows (145 in-scope corpus rows, plus `dovoda-34`, conformant since b0 and
pinnable once the gates rendered with the survey's asset store), `unknown/dijapi-54` in the unknown tree, and 76 dss
rows (48 at T0, 26 lowercase spots at T5a, 2 sprite-title rows at T6a; dss `ROW_COUNT` 996 → 1072). Every authored
and `loops-*` row sits at 0.

**Rows ended by D10, family by family:** E, A, R, S, G, N, W, C, X — every in-scope row conformant except: L —
`bigobe-53`, `xexuxu-81`, `xuzovi-55` named under DIVERGENCES.md "LaTeX rendering engine — KaTeX" (T5c);
C — `nomave-73` named under DIVERGENCES.md "QR codes draw blank (MIT edition)" (the signed 2026-10-13 ruling);
L — `rekefe-90` on `needs-ruling` #155 (`%version()`); E/C/X — `nadata-32`, `sacedo-05`, `mugupa-02`,
`radute-87` are the legacy activity engine, owned by `queue:ready` #123.

**Decisions flagged for review:** journal row 27 (D7 breach caught and fixed), row 46 (surveys rerun with
`SVG_PARITY_TIMEOUT_MS=300000` under other sessions' load), row 47 (`nomave-73` named under the MIT-edition ruling
rather than a new ruling request; the gates now render with the survey's asset store), row 48 (`FontName` bridge in
`resolveActivityBoxStyle` extends `paddingOtherThanSkin`), row 50 (`unwind2-s8` skin pin lowered 1 → 0).

**CI risk:** the dss ratchet grew by 76 rows and the activity golden ratchet by 146 goldens; neither is measured on
the runner until the first PR run. The activity gates now build a combined sprite/emoji/utility asset store once per
worker.

**Follow-ons:** `planning/next-missions.md` "activity-authored-rows (aar)".
