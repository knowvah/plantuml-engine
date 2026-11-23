# activity-unknown-colour (auc)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #189 (found by the unresolved-colour mission, #145, exit T4). Planned unattended on
2026-11-22 at `feature/parity-queue` `7120760fa`.

## Objective

Where an activity diagram names a colour the jar cannot resolve, the jar raises `NoSuchColorException`
(`HColorSet.java:69-76`) and `SingleLineCommand2.java:176-177` / `CommandMultilines2` turn it into
`CommandExecutionResult.badColor()`: an error page, `No such color`. We draw. The issue asks which of two answers the
2026-10-10 rule allows. Planning measured the jars, then took the answer the maintainer's standing rulings already
give (D1): **we keep drawing, and paint the #143 neutral (`colorOrNeutral`, `#D3D3D3`) at every such site, never the
default colour or a raw invalid token.** That is what activity already does at its partition, stereotype and
circle-spot sites.

This mission:
1. holds the 30 planning probes in the existing authored gate, with a new `NEUTRAL` row kind (batch 1);
2. paints the neutral at the three remaining activity sites: arrow colours, swimlane colours, note colours (batch 2);
3. records the activity sites in `DIVERGENCES.md`, files the separable finding, and re-measures (exit).

## Starting state, measured 2026-11-22 on `7120760fa`

`npx tsx plans/activity-unknown-colour/measurements/measure.mts` prints
**rows 30 zero 13 jarError 17 neutral 2 invalid 2 oursError 0**.

| Rows | Upstream site (the throwing `getColor`) | Jar | Ours today | Task |
|---|---|---|---|---|
| `act-arrow`, `-label`, `-style`, `-rainbow`, `-long`, `act-repeatwhile`, `act-backward-in`, `-out`, `act-else-when`, `act-elseif-incoming`, `-when` | `HtmlColorAndStyle.java:100` via `Rainbow.java:109-118`, from `CommandArrow3.java:106`, `CommandArrowLong3.java:114`, `CommandRepeatWhile3.java:163`, `CommandBackward3.java:172` (also used by `CommandElse3.java:107`, `CommandElseIf3.java:169-170`) | `No such color` | default line colour `#181818`; 16 to 55 diffs | T2a |
| `act-link3` | `CommandLink3.java:84` | `No such color` | default line colour; 28 diffs | T2a |
| `act-swimlane` (`\|#zzblue\|L1\|`) | `CommandSwimlane.java:98` | `No such color` | no lane fill; 21 diffs | T2b |
| `act-note-multi`, `act-note-single` | `Colors.java:103` via `CommandNoteLong3.java:129`, `CommandNote3.java:127` | `No such color` | raw `fill="#zzblue"` (invalid); 30, 29 diffs | T2c |
| `act-circlespot`, `act-partition-back` | `CommandCircleSpot3`, `CommandPartition3.java:152` | `No such color`, `Syntax Error?` | neutral already | guard |
| 13 `ZERO` guards: `act-arrow-valid`, `-empty` (`-[]->`), `-bold`, `-named`, `-transparent`, `-gradient`, `act-action-color`, `act-if-color`, `act-while-color`, `act-elseif-color`, `act-repeat-color`, `act-switch-color`, `act-activity-long` | none: the jar draws | draws | 0 diffs | guard |

- **The stock jar** (`oracle/dist/stock/plantuml-stock-a720bdd…jar`, the pinned upstream sha, no `-D` flags) gives the
  same answer as the oracle on all 30 rows. **Release v1.2026.8** errors on all 17 jar-error rows too. The latest
  release, **v1.2026.10**, was not measured: its download was refused in the planning session (D4).
- **The corpus:** the only row with an unresolvable activity arrow, link or lane colour is `unknown/duluve-89-mati167`
  (`-[#toto]->`, `-[#titi]->`), already signed under #143 as "jar errors, we draw". It stays `diverged`,
  `firstDiff: error-page`; only its arrows' colour changes (D5).
- **Planning baseline on `7120760fa`:** `npm test -- --maxWorkers=4` 2344 files passed (1 skipped), 50757 tests,
  coverage 96.99/92.58/97.48/98.03; `npm run lint` exit 0. `typecheck`, `build`, `format:check` first run at T0.
- **`-[]->` is a trap** for T2a: the jar draws it, and our parser hands `memberLook` the empty string. T2a must find and
  cite why the jar draws before it swaps in `colorOrNeutral`.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt, and
  tags `activity-unknown-colour/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Run `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/` or `docs/` while a gate is running.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Probes:** `npx tsx plans/activity-unknown-colour/measurements/measure.mts [dir] [out.json]`. From T1 on, also run
  it with `tests/fixtures/unresolved-colour` as `dir`.
- **Activity ratchets:** `npx vitest run tests/oracle/svg-conformance/activity` and read the collected count.
- **Engines:** `npm run svg:survey -- activity --out tests/oracle/svg-conformance/parity-activity.json` (same for
  `unknown`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete any
  `svek-N.dot` it leaves in the out dir.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D6, for example a jar-error row the stock jar draws. Amend `decisions.md` with the date,
   then halt.
5. Any `dist/*.d.ts` change (D6), or any edit to `oracle/accepted-divergences.json` (D5).
6. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`. File the finding instead.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A probe whose residual turns out to be a different mechanism (D4, "separable"): measure it, file a `queue:ready`
  issue with the measurement and `file:line`, record the row as `OPEN` naming it, continue.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Authoring extra probes for a site you touch (`-[#zzblue,bold]->`, `|#zzblue|` on a later lane, `note #zzblue` on a
  `floating` note, `-[#zzblue]->` inside a `fork`), each with its oracle from `scripts/oracle-render.sh`; each joins
  the gate in the kind its jar answer gives.
- Removing a fallback the change makes unreachable (`colorTokenHex`'s `?? line` in `activity-rainbow.ts`), with the
  invariant quoted in a comment.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none. Every touched module is internal. `dist/*.d.ts` must not move (D6).
- **Dependencies:** nothing new. `colorOrNeutral` and `UNKNOWN_COLOR_NEUTRAL` already exist in
  `src/core/klimt/color/HColorSet.ts`.
- **Behaviour:** only colour tokens `HColorSet` cannot parse, at the three activity sites. Resolvable tokens keep
  today's path, guarded by the 13 `ZERO` rows, the activity ratchets and the every-engine survey.

| File | Action | Task |
|---|---|---|
| `tests/fixtures/unresolved-colour/act-*.{puml,svg}` (30 rows) | Create | T1 |
| `tests/oracle/svg-conformance/unresolved-colour.authored.test.ts` | Modify | T1; rows lose `pending` in T2a to T2c |
| `src/diagrams/activity/activity-rainbow.ts` (+ its unit test) | Modify | T2a |
| `src/diagrams/activity/dispatch-support.ts` (`setCurrentSwimlane`) or the swimlane renderer (+ test) | Modify | T2b |
| `src/diagrams/activity/note-dispatch.ts` (`noteColorSpread`) or the note renderer (+ test) | Modify | T2c |
| `DIVERGENCES.md` ("We draw where the jar errors", the colour paragraph) | Modify | T3 |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md` | Modify | batch closes, T3 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: gate](batch-1/overview.md) | T1 | [x] |
| [2: activity sites](batch-2/overview.md) | T2a, T2b, T2c | [x] |
| [exit](batch-exit/overview.md) | T3 | [x] |
| [squash](batch-squash/overview.md) | T4 | [x] |

## Done when (issue #189)

- [ ] Every one of the 17 jar-error rows draws, emits no invalid colour, and paints `UNKNOWN_COLOR_NEUTRAL` at the
      unresolved site; the authored gate holds it.
- [x] Every `ZERO` row is at 0 diffs.
- [x] `oracle/accepted-divergences.json` is unchanged (D5). `DIVERGENCES.md` names the activity sites.
- [x] The separable finding (`swimlane L1` refused, D4) is on a filed issue the journal names (#231).
- [x] The #189 comment states the answer taken, the rulings it rests on, the v1.2026.10 gap and the `duluve-89` colour
      change, so the maintainer can reverse D1 at review.
- [x] 0 conformant losses in every engine, base survey against final survey. `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` pass.

## Documents

- [decisions.md](decisions.md): D1 to D6, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `measure.mts` and `probes/` (30 `.puml` + `jar/*.svg` from `scripts/oracle-render.sh`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `scripts/oracle-render.sh`, `gh issue`). Deliberately not regenerated: the SessionStart hook compares it with
the live `.claude/settings.json`.

## Mission summary (2026-11-22)

- **Tasks:** T0, T1, T2a, T2b, T2c, T3 done; T4 squash follows this commit.
- **Done-when, the one unticked box:** 15 of the 17 planning jar-error rows paint the neutral. `act-else-when` is held
  `OPEN` under **#230** (a separable mechanism: the two-branch `if` drops `else`'s WHEN colour even when it is valid).
  `act-swimlane` has no drawn site in either engine (`Swimlanes.java:253-259`); two-lane rows carry the swimlane site.
  The gate adds 8 authored jar-error rows (all neutral) and 2 guards.
- **Decisions:** 17 journal rows; flagged for review: rows 5 (D3 `pending` semantics), 7 (`''` → neutral, contrary to
  T2a's spec, with the Java quote), 8 (#230), 12 (`unseen` kind), 15 (batch-2 survey reused as T3's final survey).
- **Gates (final tree):** `npm test` 2347 files / 50812 tests, coverage 96.99/92.57/97.48/98.03; typecheck, lint, build,
  format:check green; d.ts unchanged; `verdict-diff.mjs 7120760fa` lost 0.
- **Follow-ups:** #230, #231 (both `queue:ready`, both on #136); v1.2026.10 release check for signing (D4).
