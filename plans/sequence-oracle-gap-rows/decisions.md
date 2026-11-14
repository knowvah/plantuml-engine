# Decisions

These are pre-made. A finding that contradicts one is stop 4: amend the decision here with the date, then halt.

| ID | Decision | One line |
|---|---|---|
| D1 | Scope | the 94 #109 rows in `measurements/new-rows.json`; nothing else in sequence moves |
| D2 | Pinning | seed a `diff-baseline.json` row for all 94, then pin each zero-diff row with a mission copy of sdd3's `pin-goldens.mts` |
| D3 | Fixes | one task per upstream mechanism, ported from the Java; partition gets authored rows |
| D4 | Divergences | none expected; a row that needs one goes on a `needs-ruling` issue |
| D5 | Public API | no `dist/*.d.ts` change |
| D6 | Execution | serial, main checkout, no worktrees; one commit per task; squash at the end |

### D1: Scope
The 94 slugs are the survey's sequence rows with no `diff-baseline.json` row at `a3840fb61`. 86 are zero-diff on the
ratchet path, 7 have diffs and 1 is refused (README table). #139's "9 non-conformant" is dated: `jovijo-34-zaro482`
became conformant in #119.

`jetigu-21` and `nuzise-60` (named in `oracle/goldens/svg-sequence/README.md` as cached without a row) already have
rows: they are not in the 94, and are out of scope.

### D2: Pinning
`pin-goldens.mts` (sdd1-sdd3) refuses a slug without a `status: "baseline"` row (`pin-goldens.mts:104-112`), and
`scripts/repin-sequence-baselines.ts` only updates existing rows. So T1 writes a seed tool:

- It measures each given slug through the same seams as `repin-sequence-baselines.ts` (`fixtureIncludeStore()`,
  `DeterministicMeasurer`, `renderFixtureSequence`), and appends a row with today's `weightedScore` and `diffCount`,
  `status: "baseline"`, or `status: "error"` for a refused render. It refuses a slug that already has a row.
- T1 copies `plans/sequence-divergence-drive-3/tools/pin-goldens.mts` and its test into
  `plans/sequence-oracle-gap-rows/tools/`, changing only `MISSION`.
- Then T1 pins the 86. Each later task pins its row(s) when they reach zero.

So the 8 open rows are held shrink-only from T1 on, by the existing `sequence.diff-baseline.ratchet.test.ts`.

**Rejected:** teach `repin-sequence-baselines.ts` to add missing rows. That changes shared tooling for a one-off gap;
the seed tool is mission-local and reversible. Journal the idea as a follow-on.

### D3: Fixes
Each open row's mechanism is ported from upstream, never fitted:
- **T2a, partition.** `CommandGrouping`'s TYPE alternation includes `partition` (`CommandGrouping.java:67`), which maps to
  `START_PARTITION` (`GroupingType.java:55-56`). It changes the style signature to `partition` / `partition.header`
  (`Grouping.java:59-69,84-86`) and the tile to `PartitionTile` (`teoz/TileBuilder.java:156-163`, `PartitionTile.java`,
  which extends `GroupingTile`). The corpus has one row. Partition is in upstream's grammar, so it needs **authored
  rows** ("the long tail is the deliverable"): titled and untitled, a nested partition and group, `else` inside a
  partition, both colours, `skinparam`, `<style> partition { header { } }`, and `&` parallel. Each gets a jar oracle
  under `test-results/dot-cache/sequence/sogr-partition-<case>/`.
- **T2b to T3c.** The README table names a lead for each row. The task proves or replaces it with the Java quoted.

If a row turns out to have two mechanisms, split the task (push-forward). A lead that turns out wrong is not stop 4: the
leads are not decisions.

### D4: Divergences
None of the 8 rows involves dot-engine, KaTeX, the `{{ }}` oracle seam or platform glyphs, the only libraries that
force a divergence here (`DIVERGENCES.md`). So a row is fixed or it goes on a `needs-ruling` issue.
`oracle/accepted-divergences.json` and `DIVERGENCES.md` are expected to show no diff.

### D5: Public API
Every fix is internal. T0 snapshots `dist/*.d.ts`; T4 diffs it and expects no change (stop 5).

### D6: Execution
The mechanisms are independent, but all of them write into `src/diagrams/sequence/` and the same two baseline JSON
files. So the mission runs serially in the main checkout. The orchestrator writes, or one `typescript-pro` subagent at a
time whose prompt is `task-contract.md`, this file and the task file. There are no worktrees and never two writers at
once. Each task makes one unsigned commit with the footer `Refs: #139`, and T5 squashes them.

## Operational readiness

- **Observability:** N/A. This is a pure library, with no new operations, services or I/O.
- **Rollback:** Reversible. Revert the squash commit; no data or format migrates. The new goldens and baseline rows go
  with it.
- **Scalability:** 94 more goldens add 94 renders to the sequence ratchet, about 30 s of CPU on the planning machine for
  all 94 (`measure-rows.mts`), spread over the test shards.
- **Failure modes:**
  1. A conformant sequence row moving because a shared module changed (notes, frames, creole). It is detected by the
     sequence ratchet and `verdict-diff`, and it is stop 1 until the mechanism is quoted.
  2. T2d moving a non-sequence diagram that draws an OpenIconic inside a link. It is detected by the every-engine
     survey; a move towards the jar is a win to journal, a move away is stop 1.
  3. A pin round leaving the routing or refusal running counts stale. It is detected by `routing-conformance.test.ts`
     and `refusal-coverage.test.ts` in the same gate run.
- **Backwards compatibility:** no public type, option or output contract changes, apart from the diagrams moving to
  the jar's bytes.

## Auto-confirmed (unattended)

Planned on 2026-11-13 by `/plan-mission --unattended next --branch feature/parity-queue`, with no maintainer present.
The queue selected #139, the lowest `queue:ready` issue with no open blocker (#136 is blocked by about 30 issues).

**D2, recommendation taken:** a mission-local seed tool plus a copy of sdd3's pin tool.
- **Rejected: extend `repin-sequence-baselines.ts`.** It is shared tooling, and the gap is one-off (#109 is done).
- **Rejected: pin the 86 straight into `ratchet.json` by hand.** That skips the zero-diff check and the routing and
  refusal clones that `pin-goldens.mts` makes.

**D3, recommendation taken:** one task per mechanism, with authored rows only for partition.
- **Rejected: one task for all 8 rows.** The mechanisms are unrelated: grammar, constraints, lifelines, creole,
  anchors, pagination and live boxes. One commit would hide which change moved which row.
- **Rejected: authored rows for every task.** The other seven mechanisms are small branches of features that the
  existing 1143 pinned rows already exercise. They stay a push-forward.

**Why this is not a parking case:** #139 says what done means. No row needs a maintainer-reserved decision at
planning, no public type changes, and nothing is irreversible. A row that turns out to need a ruling is parked on its
own issue, and the rest of the mission continues.

**D1, D4, D5, D6:** each follows from the measurements and the project rules, and is recorded above with its evidence.
