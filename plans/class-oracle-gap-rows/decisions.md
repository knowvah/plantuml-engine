# Decisions

These are pre-made. A finding that contradicts one is stop 4: amend the decision here with the date, then halt.

| ID | Decision | One line |
|---|---|---|
| D1 | Scope | the 151 #109 rows in `measurements/new-rows.json`; nothing else in class moves |
| D2 | Pinning | copy cdd's class `pin-goldens.mts` into the mission, pin the 111 at T1, pin each open row when it reaches zero |
| D3 | Fixes | one task per upstream mechanism cluster, ported from the Java; the README table's leads are where to start |
| D4 | Divergences | none expected; a row that needs one goes on a `needs-ruling` issue |
| D5 | Public API | no `dist/*.d.ts` change |
| D6 | Execution | serial, main checkout, no worktrees; one commit per task; squash at the end |

### D1: Scope
The 151 slugs are the `bucket: "class"` rows of `plans/oracle-gap-capture/measurements/new-rows.json`. At
`cd7587779`, none is in `ratchet.json`. 111 are zero-diff on the ratchet path and 40 are open (README table).

Out of scope:
- `luzive-62-zote562`, `sadamo-18-siva346` and `zuduxu-90-kosi876`. They are survey-conformant and unpinned, but they
  are not #109 rows. Journal them as a follow-on at T5.
- `radute-87-nize199`, named in #140. It is a legacy-activity row and routes `ACTIVITY` / `agree` since #123. The class
  regex fix #140 describes is already in `class-relationship-parser.ts:188-197` (laep/T3b-4).
- #140 also says `kofogo-67-jiju461` is excluded by name from `tests/unit/class/class-cluster-levels.test.ts` until it
  parses. T3a removes that exclusion once it parses. `potatu-55-pave291`'s exclusion stays, because it embeds diagrams.

### D2: Pinning
`plans/class-divergence-drive/tools/pin-goldens.mts` already does what pinning needs:
- it copies `in.puml` and `in.svg` into `oracle/goldens/svg-class/<slug>/`;
- it appends a `ratchet.json` entry;
- it clones the `agree` / `ok` routing and refusal twins.

It does not check zero-diff itself. `class.golden.ratchet.test.ts:209-210` does that, and the measurer uses the same
render call. T1 copies the tool and its test into `plans/class-oracle-gap-rows/tools/`, changing only `MISSION` (the
constant's own comment at `pin-goldens.mts:40-44` says each mission bumps it). This is the sogr precedent: the cdd
copy stays as history.

Class has no `diff-baseline.json` for open rows, unlike sequence, so the 40 open rows are not held shrink-only during
the mission. The measurer is the record. Each task's measure step checks that no other row moved.

**Rejected:** a new class `diff-baseline` gate. Building it is a tooling project, and #140 does not ask for one.
Journal it as a follow-on if the mission needs one.

### D3: Fixes
Each open row's mechanism is ported from upstream, never fitted. The README table groups the 40 rows by lead into 19
tasks. A lead is a planning read, not a decision:
- a row whose mechanism turns out to be another task's moves there (push-forward);
- a row with two mechanisms splits its task;
- a wrong lead is not stop 4.

Order matters in three places:
- T2c needs T2a's colours and T2b's empty-group mute.
- T2d's `compA` is an empty group, so it comes after T2b.
- T4f's notes sit on empty components (`nacave`, `subdiagram-theme-1`, `dobefe`), so it comes after T2b.

### D4: Divergences
Class rows go through real graphviz, where the jar's geometry is the target. The capture strips `!pragma layout
smetana` (G0 policy), so `potatu-55-pave291`'s "With Smetana" embed is a graphviz graph. Its ELK embed runs through
elkjs 0.12.0, the version the jar bundles. The `{{ }}` slot size is oracle seam #3, already retired as a divergence
(`DIVERGENCES.md:2092-2094`). None of the 40 involves KaTeX or a platform glyph outline. So a row is fixed, or it goes
on a `needs-ruling` issue. `oracle/accepted-divergences.json` and `DIVERGENCES.md` are expected to show no diff.

One exception is already ruled. T4e's `{{json}}` / `{{yaml}}` embeds are `JsonDiagram`, a Smetana path, and their
node placement falls under the settled ruling (2026-08-09; `DIVERGENCES.md:17`). Each embed is one node with no
edges, so planning expects no such residue. If one appears and it is only Smetana node placement, the row is added to
that existing entry, with its measurement. That is not a new divergence. Text measurement inside the embed is a
target, never part of the Smetana delta.

### D5: Public API
Every fix is internal. T0 snapshots `dist/*.d.ts`; T5 diffs it and expects no change (stop 5).

### D6: Execution
The mechanisms are mostly independent, but they all write into `src/diagrams/class/` and the same baseline JSON files.
So the mission runs serially in the main checkout. The orchestrator writes, or one `typescript-pro` subagent at a time
whose prompt is `task-contract.md`, this file and the task file. There are no worktrees, and never two writers at once.
Each task makes one unsigned commit with the footer `Refs: #140`, and T6 squashes them.

## Operational readiness

- **Observability:** N/A. This is a pure library, with no new operations, services or I/O.
- **Rollback:** Reversible. Revert the squash commit; no data or format migrates. The new goldens and baseline rows go
  with it.
- **Scalability:** 151 more goldens add 151 renders to the class ratchet. All 151 measure in about 4 s on the planning
  machine (`measure-rows.mts`), spread over the test shards.
- **Failure modes:**
  1. A conformant class row moving because a shared module changed (clusters, notes, creole). It is detected by the
     class ratchet and `verdict-diff`, and it is stop 1 until the mechanism is quoted.
  2. A shared svek, creole or embed change moving description or state rows. It is detected by the every-engine
     survey. A move towards the jar is a win to journal; a move away is stop 1.
  3. A pin round, or T3a's routing flip, leaving the routing or refusal running counts stale. It is detected by
     `routing-conformance.test.ts` and `refusal-coverage.test.ts` in the same gate run.
- **Backwards compatibility:** no public type, option or output contract changes, apart from the diagrams moving to
  the jar's bytes.

## Auto-confirmed (unattended)

Planned on 2026-11-13 by `/plan-mission --unattended next --branch feature/parity-queue`, with no maintainer present.
The queue selected #140: no `queue:planned` issue is open, and #136 (lower-numbered) is blocked by about 30 open
issues. #140 has no "Blocked by" line.

**D2, recommendation taken:** a mission copy of cdd's class pin tool.
- **Rejected: pin the 111 straight into `ratchet.json` by hand.** That skips the byte-equality check and the routing
  and refusal clones the tool makes.
- **Rejected: edit the cdd tool's `MISSION` in place.** It would work, but sogr set the copy precedent, and a copy
  leaves cdd's tooling history untouched.

**D3, recommendation taken:** one task per mechanism cluster (19 tasks), ordered so dependent clusters come later.
- **Rejected: one task per row (40 tasks).** Rows like `puboje`/`secomu`/`cokute`/`vacuso` are the same source with
  small variants. One commit per mechanism shows which change moved which rows.
- **Rejected: split #140 into several missions.** The queue plans one brief per issue, and #140's done-when covers
  all the rows. A row that turns out large and separable goes on its own issue, proven by measurement (CLAUDE.md).

**Why this is not a parking case:** #140 says what done means. No row needs a maintainer-reserved decision at
planning, no public type changes, and nothing is irreversible. A row that turns out to need a ruling is parked on its
own issue, and the rest of the mission continues.

**D1, D4, D5, D6:** each follows from the measurements and the project rules, and is recorded above with its evidence.
