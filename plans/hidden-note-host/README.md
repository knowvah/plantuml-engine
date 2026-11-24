# hidden-note-host (hnh)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #204 (from #151, `class-comment-bytes`). Planned unattended on 2026-11-23 at
`feature/parity-queue` `72dc9201f`.

## Objective

Upstream hides a note together with its host. `CucaDiagram#isHidden` (`net/atmp/CucaDiagram.java:778-794`) passes a
`NOTE` that has exactly one non-invisible link to a non-note to `isHidden(other)`, the hidden flag of the entity at
the other end (`isNoteWithSingleLinkAttachedTo`, `:835-853`). `#isRemoved` (`:796-812`) does the same for removal.
`SvekResult#drawU` then draws that note under `UHidden` (`svek/SvekResult.java:82-90`), which draws nothing.
`EntityImageNote` writes no comment.

The port breaks this rule in three engines:

- **Class and object:** `computeHiddenIds` already delegates a note (`class-directives-removal.ts:336-349`), but the
  renderer never reads the result for a note. Rule D5 says "`UHidden` wraps only the HOST node's own image"
  (`renderer-leaf.ts:165-170`, `renderer.ts:200-205`, `renderer-note-dispatch.ts:55-59`), and the jar contradicts
  it for a `NOTE`. Member tips (`LeafType.TIPS`) are not delegated, and the jar draws them on a hidden host
  (`hnh-tips-on-member`).
- **Description (component, usecase, actor):** `effectiveHiddenIds` (`element-grammar.ts:321-339`) has no
  delegation, so a note on a hidden host is drawn and `hide N` hides a note the jar keeps. The removal cascade
  (`:258-271`) skips `-[hidden]-` links where upstream skips only `isInvisible()` ones (`WithLinkType.java:100-101`).
- **State:** `computeHiddenIds` (`state-directives.ts:183-185`) folds notes by their own name only. The renderer
  already skips a hidden note node (`hnh-state-hide-lone-note` is at 0), so the delegation is the missing half.

The mission:

1. files the seven separable findings planning turned up (batch 0, `decisions.md` "Side findings");
2. adds an authored gate holding the 50 planning probes (batch 1);
3. ports the delegation and the `UHidden` draw rule into class, description and state, one task each (batch 2);
4. re-measures every engine, regenerates the reports and comments on #204 (exit).

## Starting state, measured 2026-11-23 on `72dc9201f`

`npx tsx plans/hidden-note-host/measurements/measure.mts` prints **rows 50 zero 18 open 32 throw 0**. A row is zero
when its `compareSvg` diff count and its comment mismatch are both 0. Every jar oracle draws: none errors. The full
table is [measurements/plan-baseline.txt](measurements/plan-baseline.txt).

| Rows (diffs / comment mismatch today) | What the jar does that we do not | Task |
|---|---|---|
| `hnh-hide-host` 12/0, `hnh-hide-by-tag` 12/0, `hnh-hide-by-stereotype` 12/0, `hnh-floating-note` 12/0, `hnh-multiline-note` 12/0, `hnh-two-notes` 20/0, `hnh-object-host` 5/0 | draws no note on a hidden class or object | T2a |
| `hnh-hide-lone-note` 55/0, `hnh-hide-unlinked-note` 55/0, `hnh-hide-note-two-links` 21/0 | draws no note hidden by its own `hide N` or `hide @unlinked` | T2a |
| `hnh-smetana-hide-host` 16/0 | the same under `!pragma layout smetana`; after T2a only geometry is left (ruling 2026-08-09) | T2a |
| `hnh-desc-hide-host` 8/1, `hnh-uc-hide-host` 8/1, `hnh-desc-actor-host` 8/1, `hnh-desc-floating-note` 8/1, `hnh-desc-hide-by-stereotype` 8/1, `hnh-desc-two-notes` 8/1 | draws no note on a hidden host; the comment is I3 | T2b |
| `hnh-desc-hide-note-name` 20/0, `hnh-desc-elk-hide-note-name` 1/0 | keeps `N` under `hide N` while `N` passes its flag to a visible host | T2b |
| `hnh-desc-hidden-link-remove` 12/1 | keeps `N`, which has two links (a `-[hidden]-` link counts); our cascade skips that link and removes `N` with `A` | T2b |
| `hnh-state-hide-host` 9/0, `hnh-state-multiline-note` 8/0, `hnh-state-two-notes` 9/2 | draws no note on a hidden state; the comment is I6 | T2c |
| `hnh-note-to-note` 2/1, `hnh-note-to-note-visible` 95/1, `hnh-hidden-link-remove` 2/1 | opale choice counts every link (I1) | none |
| `hnh-elk-hide-host` 6/2 | class ELK notes (I2) | none |
| `hnh-desc-host-in-hidden-package` 0/1, `hnh-desc-hidden-link-to-note` 0/1 | the hidden-entity comment (I3) | none |
| `hnh-desc-hide-unlinked-note` 15/0 | description `hide @unlinked` (I4) | none |
| `hnh-state-host-in-hidden-composite` 25/0 | hidden-composite geometry (I5) | none |
| `hnh-lap-hide-host` 4/0 | legacy activity document size (I7) | none |

The 18 zero rows are controls: `remove` (where the note already goes), `show` after `hide`, a note with two links,
a note whose host is hidden only by its package (`isHidden(other)` reads the host's own fold, not its parents), tips,
`note on link`, and the description ELK host case. They must stay at 0.

- **Planning baseline on `72dc9201f`:** see `decisions.md` "Pre-flight". `typecheck`, `build` and `format:check`
  first run at T0.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.

- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt, and
  tags `hidden-note-host/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Run `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/` or `docs/` while a gate is running.
- The complexity hook blocks a file over 500 lines or a function over 30 NLOC.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Probes:** `npx tsx plans/hidden-note-host/measurements/measure.mts [dir] [out.json]`. From T1 on, run it with
  `tests/fixtures/hidden-note-host` as `dir`.
- **Authored gate:** `npx vitest run tests/oracle/svg-conformance/hidden-note-host.authored.test.ts`; read the count.
- **Class comment gate:** `npx vitest run tests/oracle/svg-conformance/class-comment-bytes.authored.test.ts`.
- **Engines:** `npm run svg:survey -- class --out tests/oracle/svg-conformance/parity-class.json` (same for
  `object`, `component`, `usecase`, `state`, `unknown`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete any
  `svek-N.dot` it leaves in the out dir.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D6, for example a jar oracle that draws a note on a hidden host, or one that hides a
   member tip. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change or a new dependency (D6).
6. A fix needs a write to `@knowvah/dot-engine`, `@knowvah/elk-engine`, elkjs, `~/git/graphviz` or
   `~/git/knowvah/plantuml`. File the finding instead.

**These are not stops:**

- A file outside a task's write-set inside this repository. Change it and journal why.
- A residual with a separable mechanism (one that also shows without a note, or that the note-free control in
  `decisions.md` "Side findings" reproduces): measure it, file a `queue:ready` issue with the measurement and
  `file:line`, give the row that `reason`, continue.
- A residual only a maintainer can end (it would need a new `DIVERGENCES.md` entry): file a `needs-ruling` issue with
  the evidence, name it in the row's `reason`, continue.

## Push-forward (decide, journal, continue)

- Authoring extra probes for a branch you touch (a note on a hidden lollipop or association class, `hide` on a
  `together` member with a note, a note on a hidden usecase inside a `rectangle`, a note on a hidden history state,
  `skinparam strictUmlStyle` with a note on a hidden host), each with its oracle from `scripts/oracle-render.sh`.
  Each joins the authored gate.
- Moving a probe whose oracle turns out to be a jar error page into the gate as an error row, with its message.
- Fixing a side finding (I1 to I7) inside the mission when the fix is under ~20 lines, has a `file:line` origin and
  moves no conformant row. Journal it and comment on that issue. Otherwise leave it filed.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none public. Internal geometry may gain a `hidden` flag on a note geo. `dist/*.d.ts` must not
  move.
- **Dependencies:** nothing new.
- **Behaviour:** only diagrams that carry `hide`/`remove` and a note, in class, object, description and state. Every
  other row is held by the class, object, description and state golden ratchets, `class-comment-bytes`, and the
  survey's verdict-diff.

| File | Action | Task |
|---|---|---|
| `tests/fixtures/hidden-note-host/*.{puml,svg}` (50 rows) | Create | T1 |
| `tests/oracle/svg-conformance/hidden-note-host.authored.test.ts` | Create | T1, T2a, T2b, T2c |
| `src/diagrams/class/{renderer,renderer-leaf,renderer-note-dispatch}.ts` | Modify | T2a |
| `src/diagrams/class/{layout,class-geo-builders,note-layout-types}.ts` (carry the note's hidden flag) | Modify | T2a |
| `src/diagrams/class/renderer-note-connector.ts` (a connector from a hidden note) | Modify | T2a |
| `tests/unit/class/*hidden-note*.test.ts` | Create | T2a |
| `src/diagrams/description/element-grammar.ts` (delegation in `effectiveHiddenIds`, the removal criterion) | Modify | T2b |
| `src/diagrams/description/{layout,description-elk-adapter}.ts` (pass the links) | Modify | T2b |
| `tests/unit/description/*hidden-note*.test.ts` | Create | T2b |
| `src/diagrams/state/state-directives.ts` (and `state-hidden.ts`, `renderer.ts`, `renderer-note.ts` if a note path skips the hidden test) | Modify | T2c |
| `tests/unit/state/*hidden-note*.test.ts` | Create | T2c |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md` | Modify | batch closes, T3 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline, side findings](batch-0/overview.md) | T0 | [x] |
| [1: gate](batch-1/overview.md) | T1 | [x] |
| [2: the rule in three engines](batch-2/overview.md) | T2a, T2b, T2c | [x] |
| [exit](batch-exit/overview.md) | T3 | [x] |
| [squash](batch-squash/overview.md) | T4 | [x] |

## Done when (issue #204)

- [x] `hnh-hide-host` (the issue's fixture) and every class, object, description and state row the table above gives
      to T2a, T2b or T2c is at 0 diffs, or each remaining diff is named with its mechanism and `file:line` in the
      row's `reason`.
- [x] `hidden-class-with-note` in `class-comment-bytes` stays a ZERO row, and its comment in that gate no longer
      says the note is drawn.
- [x] The D5 comments in the class renderer state the jar's rule: a `NOTE` draws under its own hidden flag, which
      it takes from its single-link host; a `TIPS` leaf draws whatever its host's flag.
- [x] The 18 control rows stay at 0. Every row left open names one of I1 to I7 or the Smetana ruling.
- [x] I1 to I7 are filed and named in the journal.
- [x] 0 conformant losses in every engine, base survey against final survey. `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` pass.

## Documents

- [decisions.md](decisions.md): D1 to D6, side findings I1 to I7, operational readiness, auto-confirmed decisions,
  pre-flight.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `measure.mts`, `plan-baseline.txt` and `probes/` (50 `.puml` + `jar/*.svg` from
  `scripts/oracle-render.sh`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `scripts/oracle-render.sh`, `gh issue`). Deliberately not regenerated: the SessionStart hook compares it with
the live `.claude/settings.json`.

## Mission summary (2026-11-23)

- **Tasks:** T0, T1, T2a, T2b, T2c, T3 done as planned; T4 (squash) follows. Commits before the squash: `efdcb2377`
  (T0), `65d3f0447` (batch 0 close), `7ff8abce6` (T1), `d7869df46` (batch 1 close), `51abdc0b0` (T2a), `0f8bcd888`
  (T2b), `4b568fe64` (T2c), `6a1df48c4` (batch 2 close), then the T3 commit.
- **Gate:** `measure.mts tests/fixtures/hidden-note-host` prints `rows 58 zero 37 open 21 throw 0` (50 planning probes
  plus 8 push-forward probes, each with its jar oracle). Open rows and reasons:
  - #272 (I3), 0 diffs / 1 comment: `hnh-desc-actor-host`, `hnh-desc-floating-note`, `hnh-desc-hide-by-stereotype`,
    `hnh-desc-hide-host`, `hnh-desc-two-notes`, `hnh-desc-show-note-hidden-host`, `hnh-desc-host-in-hidden-package`,
    `hnh-desc-hidden-link-to-note`, `hnh-uc-hide-host`, `hnh-uc-in-rectangle-hide-host`.
  - #275 (I6): `hnh-state-two-notes` 0/2. #270 (I1): `hnh-note-to-note` 2/1, `hnh-note-to-note-visible` 95/1,
    `hnh-hidden-link-remove` 2/1. #271 (I2): `hnh-elk-hide-host` 6/2. #273 (I4): `hnh-desc-hide-unlinked-note` 15/0.
    #274 (I5): `hnh-state-host-in-hidden-composite` 25/0. #276 (I7): `hnh-lap-hide-host` 4/0.
  - Ruling 2026-08-09: `hnh-smetana-hide-host` 86/0 (geometry only; journal row 12).
  - #277 (`needs-ruling`): `hnh-tips-hide-star`, `hnh-tips-hide-star-show-host` 1/0 (journal row 13).
- **Decisions:** 24 journal rows. Flagged for review: D3 (three engines), the D2 amendment and #277 (tips own fold),
  the `markUnlinked` one-line fix (row 17), the Smetana row's raised `maxDiffs` (row 12).
- **Gates:** every engine surveyed at batch 2 close, 0 lost against `72dc9201f` and no row moved; no `src/` change
  after it, so it stands for T3. `docs/parity-report.md` was regenerated and differed only in timestamps, so it was
  left at HEAD (row 23). `dist/*.d.ts` unchanged. Final `npm test` (2356 files, 51096 tests, coverage
  97/92.6/97.51/98.04), `typecheck`, `lint`, `build`, `format:check` all exit 0.
- **Follow-ups:** #270 to #277 open. #204 has the summary comment and stays open until the branch merges.
