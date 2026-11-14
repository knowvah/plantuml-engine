# sequence-oracle-gap-rows (sogr)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #139 (from #109, oracle-gap-capture). Planned unattended on 2026-11-13 at
`feature/parity-queue` `a3840fb61`.

## Objective

#109 captured 94 sequence rows that had never had a jar oracle. None of them has a row in
`oracle/goldens/svg-sequence/diff-baseline.json` or `ratchet.json`, so no gate holds them. This mission:

1. **pins** every one of the 94 that is zero-diff on the ratchet path (86 today), so the sequence ratchet holds
   all of them (D2);
2. **drives the other 8 to zero** by porting the upstream mechanism each lacks, one task per mechanism (D3);
3. pins each of the 8 as it reaches zero.

No divergence is expected: none of the 8 involves a library that forces one (D4).

## Starting state, measured 2026-11-13 on `a3840fb61`

The survey (`tests/oracle/svg-conformance/parity-sequence.json`, generated 2026-11-13) reads **1237 rows: 1229
conformant, 4 structural-match, 4 diverged**. The 94 #109 rows are the survey's slugs with no `diff-baseline.json`
row (list: [measurements/new-rows.json](measurements/new-rows.json)).

On the ratchet path (`npx tsx plans/sequence-oracle-gap-rows/measurements/measure-rows.mts`):
**rows 94 zero 86 open 7 error 1**. The issue's `jovijo-34-zaro482` is already zero (#119, comment on #139).

| Row | Diffs | First diff (ours / jar) | Lead (verify before acting) | Task |
|---|---|---|---|---|
| `teoz-ng-001-11` | refused | `Syntax Error?` at line 1, `partition p` | `CommandGrouping.java:67` TYPE has `partition`; `GroupingType.java:55-56` → `START_PARTITION`; `Grouping.java:59-69` style signature; `teoz/TileBuilder.java:157` builds `PartitionTile` (255 lines, unported) | T2a |
| `taduce-47-saka647`, `tenibi-81-sede977` | 36, 116 | A5's lifeline `x` 337 / 656 | `/ note over` = one `Notes` event; `NotesTile.java:202-226 addConstraints` pushes each later note past the earlier one's `getX2` | T2b |
| `kikate-70-xevi302` | 16 | `g/title` missing; lifeline rect `#FFF` stroked / `#000` opacity 0 | `-> a **`: `CommandExoArrowAny.java:103-106` → `LifeEventType.CREATE`; parse already handled (`command-exo-arrow.ts:411-414`), so the gap is in tiles/render | T2c |
| `tupema-84-tako461` | 2 | `path` / `a` | `AtomTextUtils.java:96-135 createAtomTextForUrl` builds `AtomOpenIconic(..., url)` (`:117`), whose `drawU` wraps the glyph in `startUrl`/`closeUrl` (`AtomOpenIconic.java:77-82`). Ours: "`url` is always `null`" (`AtomOpenIconic.ts:100`) | T2d |
| `dociti-46-podu738` | 22 | anchor line `x` 59.419 / 77.813 | `{start} <-> {end}` with a `note right` on the start message: `LinkAnchor.java`, `CommunicationTileNoteRight.java` | T3a |
| `teoz-ng-001-5` | 9 | page 1 height 275 / 216; jar draws the newpage dashed line at y=165 | `NewpageTile.java`, `PlayingSpaceWithParticipants.java:100`, `GroupingTile.java:1251-1257`; activations and anchors on both sides of `newpage` | T3b |
| `teoz-ng-001-1` | 18 | width 218 / 223; activation rect heights 40 / 67 | `mainframe`, a `box`, `C -> C ++--` and `<<--`: `CommunicationTileSelf.java`, `LiveBoxes.java`, `Dolls.java` | T3c |

The leads are planning reads, not mechanisms. Each task opens the Java and quotes it before changing code
(task contract step 1).

Two rows have non-default gate twins: `teoz-ng-001-11` is `known-misroute` in `routing-baseline.json` and `known-gap`
in `refusal-baseline.json`. The other 93 are `agree` / `ok`.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.
- T0 commits this brief.
- One unsigned commit per task, in the **main checkout, serially, with no worktrees** (D6).
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `sequence-oracle-gap-rows/pre-squash`.
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
- Never write under `src/`, `tests/` or `docs/` while a gate is running.

## Baseline

Measured at planning on `a3840fb61`: see journal row 0.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **The 94 rows:** `npx tsx plans/sequence-oracle-gap-rows/measurements/measure-rows.mts [out.json] [slug...]`.
- **One row's diffs:** `npx tsx plans/sequence-divergence-drive-3/tools/diff-one.mts <slug> [path-filter]`.
- **Seed and pin:** the T1 tools in `plans/sequence-oracle-gap-rows/tools/` (see [batch-1/T1-pin.md](batch-1/T1-pin.md)).
- **Every engine, at batch close from batch 2 on:** run `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. Exit 1 means a loss.
  `verdict-diff` takes a **git ref**.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned sequence golden, leaves conformant, and you cannot state its mechanism
   with `file:line`.
2. A `diff-baseline.json` score would have to rise, or a pinned golden would have to be re-captured.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D6. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change. No public type should move (D5).
6. An authored row's jar output is not byte-stable across two renders.

**These are not stops:**
- A file outside a task's write-set. Change it and journal why.
- A row whose fix needs a maintainer ruling (a new divergence, or a jar behaviour that looks like a bug and has no
  forcing library). File a `needs-ruling` issue with the evidence, name the row in the journal, and move on to the
  next task. Do not decide it here (#139, "Done when").
- A residual diff that a fix uncovers, provided its mechanism is the task's. Fix it in the same task.

## Push-forward (decide, journal, continue)

- Authored rows for a branch the corpus does not exercise, each with a jar oracle (D3). Partition is the main case.
- Splitting a task in two when a row turns out to have two mechanisms, each with its own commit.
- Helper splits forced by the complexity hooks, by upstream method, never by fitting.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.
- A second-page (`in_001.svg`) difference on a multi-page row: journal it as a follow-on. The ratchet compares
  page 1 only.

## Blast radius

- **Data model:** none.
- **API:** none. Every change is internal to `src/diagrams/sequence/` and the creole atoms (D5).
- **Dependencies:** nothing new. Sequence emits no DOT and calls no layout engine.
- **Behaviour:** sequence diagrams using `partition`, `/ note` groups, `**` on an exo arrow, an OpenIconic inside a
  `[[url label]]`, anchors next to a `note right`, `newpage` after activations, or `++--` on a self message. The
  creole change (T2d) reaches every diagram that draws a URL label holding an OpenIconic, so the every-engine survey
  is the guard.

| File | Action | Task |
|---|---|---|
| `plans/sequence-oracle-gap-rows/tools/*` (seed tool, pin tool copy, tests) | Create | T1 |
| `oracle/goldens/svg-sequence/{diff-baseline,ratchet}.json`, `<slug>/{in.puml,golden.svg}` | Modify / Create | T1, T2a-T3c |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json` | Modify | T1, T2a-T3c (pin clones) |
| `src/diagrams/sequence/command-grouping.ts`, a new `sequence-partition-tile.ts` (or the frame modules it extends), `frame-style.ts`, `sequence-skin-param.ts` | Modify / Create | T2a |
| `test-results/dot-cache/sequence/sogr-partition-*/` (authored rows) | Create | T2a |
| `src/diagrams/sequence/sequence-layout-note.ts`, `sequence-layout-parallel-disjoint.ts` | Modify | T2b |
| `src/diagrams/sequence/` lifeline / exo-message modules (located in T2c) | Modify | T2c |
| `src/core/klimt/creole/atom/AtomOpenIconic.ts`, `src/core/klimt/creole/legacy/AtomTextUtils.ts`, or the sequence creole path (`sequence-creole-sheet.ts`) | Modify | T2d |
| `src/diagrams/sequence/` anchor, newpage and live-box modules (located in each task) | Modify | T3a, T3b, T3c |
| `tests/unit/sequence/sogr-*.test.ts` | Create | T2a-T3c |
| `tests/oracle/svg-conformance/parity-*.json`, routing/refusal running counts, `docs/parity-report.md`, `docs/catalog.md`, `planning/next-missions.md` | Modify | batch closes, T4 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: seed and pin the 86](batch-1/overview.md) | T1 (+T1a) | [x] |
| [2: partition, notes, exo create, icon url](batch-2/overview.md) | T2a, T2b, T2c, T2d | [[x] |
| [3: anchors, newpage, self `++--`](batch-3/overview.md) | T3a, T3b, T3c | [[x] |
| [exit](batch-exit/overview.md) | T4 | [x] |
| [squash](batch-squash/overview.md) | T5 | [[x] |

## Done when (issue #139)

- [x] Every one of the 94 rows is conformant, or named in `DIVERGENCES.md` / `oracle/accepted-divergences.json` with
  its mechanism, or on a new `needs-ruling` issue that the journal names.
- [x] A new divergence has a forcing library or a signed ruling.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] Conformant rows are pinned in `oracle/goldens/svg-sequence/ratchet.json`, and `docs/parity-report.md` is
  regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D6, operational readiness, and the auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md) and [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `new-rows.json` (the 94 slugs) and `measure-rows.mts`.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief: `node`, `npx tsx`,
`npx jiti`, `npm`, `scripts/oracle-render.sh` and `gh issue`. It was deliberately not regenerated, because the
SessionStart hook compares it with the live `.claude/settings.json`.

## Summary (2026-11-13)

**Tasks:** T0, T1 (+T1a protectSize), T2a (+fix: untitled partition), T2b, T2c, T2d, T3a, T3b, T3c, T4 done; T5 squashes.
Agents: T2a to T3c each ran as one foreground `typescript-pro` subagent. The orchestrator re-read each one's Java, re-measured,
ran the gates and committed.

**The 94 rows:** before, 86 zero / 7 open / 1 refused, none gated. After, 94 zero and 94 pinned. Pins: 86 at T1, 8 by
T2a to T3c, plus 11 authored rows. In total, 105 `sogr-*` entries in `ratchet.json` (1300 entries / 1276 slugs), and
`diff-baseline.json` is 1248 rows, all pinned.

**Verdicts, before (`a3840fb61`) → after:** sequence 1229/4/4 of 1237 → 1248/0/0 of 1248. Every other engine is
unchanged; no survey row in any other engine changed a field. `verdict-diff a3840fb61`: lost 0, timeout/errored 0.

**Gates (batch 3 close, same `src/` as the final tree):** `npm test` 2243 files passed (1 skipped), 48422 tests
passed, 4 expected fail; coverage 96.95/92.55/97.47/97.98; typecheck, lint, build and format:check all exit 0.

**d.ts:** `dist/*.d.ts` is byte-identical to the T0 snapshot (D5). `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged.

**Issues:** #183 (untitled partition) was filed `needs-ruling`, then resolved in-mission by mirroring the jar's crash
(commented). Outcome comments are on #139 and #136.

**CI risk:** the latest PR run (43462968864) had its slowest shard at 10m03s (shard 3), against `timeout-minutes: 15`.
This mission adds 105 sequence ratchet cases, about 16 ms each on the dev box and 2-8x that on CI, so roughly 3-13 s
spread over 4 shards. Low risk. `borala-01-tepu803` no longer costs 27 s, thanks to protectSize.

**Follow-ons:** `planning/next-missions.md`, "sequence-oracle-gap-rows (sogr)". In short: seeding in
`repin-sequence-baselines.ts`, an anchor on an exo message with a note, `--++` on self messages, note-group constraint
order, and a real `UClip`.
