# Decisions

These are pre-made. A finding that contradicts one is stop 4: amend the decision here with the date, then halt.

| ID | Decision | One line |
|---|---|---|
| D1 | Scope | the 57 #109 rows in `measurements/new-rows.json`; the 5 D14 pins stay as they are |
| D2 | Zero-diff pins | a mission pin tool, adapted from cogr's class tool to `svg-dot`, pins the 47 at T1 |
| D3 | Error-page pins | the 8 go into `ratchet.json` with a `jarError` record and a held score; the test asserts error parity |
| D4 | The 2 structural rows | diagnose from the Java and graphviz C; fix here only if the mechanism is ours, else file it |
| D5 | Public API | no `dist/*.d.ts` change |
| D6 | Execution | serial, main checkout, no worktrees; one commit per task; squash at the end |

### D1: Scope
The 57 slugs are the `bucket: "dot"` rows of `plans/oracle-gap-capture/measurements/new-rows.json` (55 conformant and
2 structural-match there, and in the 2026-11-14 survey). With the 5 D14 pins they are the whole `test-results/dot-cache/dot/`
corpus (62 directories), so after this mission every cached `@startdot` row is either pinned or named.

Out of scope: `@startdot` behaviour that no row exercises. If T2 finds a mechanism that reaches other labels, its
authored probes are evidence for that task, not new rows (push-forward).

### D2: Zero-diff pins
`plans/class-oracle-gap-rows/tools/pin-goldens.mts` does what pinning needs, for class: it copies `in.puml` and
`in.svg` into the golden directory, appends a `ratchet.json` entry, and clones the `dot-cache` routing and refusal
twins as `tree: goldens`. T1 copies the tool, its test and its config into `plans/dot-oracle-gap-rows/tools/` and
adapts it to dot:
- `GOLDEN_DIR` is `oracle/goldens/svg-dot`, the clone `type` is `svg-dot`, and the cache tree is `dot`;
- there is no `unknown/` subdirectory, and no CLASS routing assertion (dot rows route `NONE` / `NONE`);
- the ratchet entry keeps `svg-dot/ratchet.json`'s existing shape (`slug`, `addedAt`, `source`).

The tool does not check zero-diff itself; the dot ratchet does, on the same `renderSync` call the measurer uses.

The 5 existing `tree: goldens, type: svg-dot` twins show the clone shape (`routing-baseline.json`, the
`bemepi-16-kuzo249` row).

**Rejected: hand-editing `ratchet.json` and the two baselines.** 47 rows times three files is where a typo hides,
and the tool's copy check (byte equality with the cache) is the evidence the goldens are the oracles.

### D3: Error-page pins
The 8 error-page rows are conformant by the 2026-10-10 ruling (CLAUDE.md, "Error pages: stock jar errors + we render
our own = conformant"). They are 9 or 10 diffs on a byte compare, because nobody asks us to match the jar's error page.
The board, chart, bpm and wbs ratchets already hold this kind of row. Each pins a `weightedScore` that never rises and
a `jarError: { line, message }` in `stock-error-pages.json`'s shape, and asserts error parity
(`tests/oracle/svg-conformance/board.diff-baseline.ratchet.test.ts:10-13, 88-131`).

T1b brings that pattern to `svg-dot/ratchet.json`:
- an error-page entry carries `jarError` (copied from `stock-error-pages.json` `dot/<slug>`) and `weightedScore` /
  `diffCount` measured with `weightedScore` from `compare.ts`;
- the AC1 zero-diff test runs on entries without `jarError`;
- entries with `jarError` get a never-rises test, a shape test (the message is in the golden), and error parity: the
  golden has no graphviz `id="graph0"`, and ours is our own error page, detected the way the survey detects it
  (`setErrorPageObserver`, `scripts/lib/survey-error-verdict.ts:16`);
- the passthrough-contract block (`id="graph0"`, no `<marker`) runs only on entries without `jarError`;
- the routing clone keeps `status: jar-error` and `jarErrored: true`, and the refusal clone keeps `weErrored: true`.

**Rejected: leave the 8 unpinned and name them in the journal.** #141's done-when says conformant rows are pinned,
and these are conformant by the standing ruling. **Rejected: a separate `error-baseline.json`.** Board keeps a
separate manifest only because its authored rows have their own invariant. Dot has one population, and one manifest
keeps the corpus-count test simple.

### D4: The 2 structural rows
Both rows differ only through node `a`'s label `Node A` (README table). The `@startdot` path forwards the user's DOT
to graphviz, and the engine measures the labels (`src/core/dot-engine-measurer.ts:24-33`). So the mechanism is in one
of three places, and T2 must prove which one with a quote:
1. **Ours** (`src/diagrams/dot/` passes something different from the jar, or our measurer wrapper does): fix it from
   the Java and pin both rows.
2. **dot-engine** (its estimate differs from graphviz's own `estimate_textspan_size`, `textspan.c:28-92`): file
   `docs/graphviz-issues/<NN>-*.md` and a `TRACKER.md` line before the task closes (CLAUDE.md). The rows stay open
   and are named in the journal and on #141. Do not change dot-engine (stop 6).
3. **The oracle host** (native graphviz measures through its `textlayout` plugin with the machine's fonts, and the
   browser-safe engine cannot): that is a new divergence that only the maintainer can rule on. File a `needs-ruling`
   issue with the evidence (#170 is the same family, for AWT fonts) and leave the rows open.

"Never fit a value" holds in every case. A per-label correction, a kern table built to make two rows pass, or a
tolerance change is fitting.

### D5: Public API
No change is expected to anything a consumer sees. T0 snapshots `dist/*.d.ts`, and T3 diffs it and expects no change
(stop 5).

### D6: Execution
Every task writes into the same `ratchet.json` and baseline JSON files, so the mission runs serially in the main
checkout. The orchestrator writes, or one `typescript-pro` subagent at a time whose prompt is `task-contract.md`,
this file and the task file. There are no worktrees, and never two writers at once. Each task makes one unsigned
commit with the footer `Refs: #141`, and T4 squashes them.

## Operational readiness

- **Observability:** N/A. This is a pure library, with no new operations, services or I/O.
- **Rollback:** Reversible. Revert the squash commit; no data or format migrates. The new goldens and baseline rows go
  with it.
- **Scalability:** 55 to 57 more goldens add that many `renderSync` calls to the dot ratchet. All 57 measure in
  about 2 s on the planning machine. The routing and refusal suites each gain the same number of clones.
- **Failure modes:**
  1. A dot golden that depends on graphviz 16.1.0 fails on a machine with another graphviz. Detected by the dot
     ratchet; the golden's `Generated by` comment names the version (`svg-dot/README.md`, "Oracle-stability caveat").
  2. A pin round leaving the routing or refusal running counts stale. Detected by `routing-conformance.test.ts` and
     `refusal-coverage.test.ts` in the same gate run.
  3. A T2 fix in `dot-engine-measurer.ts` moving svek edge labels in other engines. Detected by the every-engine
     survey; a move away from the jar is stop 1.
- **Backwards compatibility:** no public type, option or output contract changes.

## Auto-confirmed (unattended)

Planned on 2026-11-14 by `/plan-mission --unattended next --branch feature/parity-queue`, with no maintainer present.
The queue selected #141: no `queue:planned` issue is open; #136 (lower-numbered) is blocked by open issues, #141 among
them; #141 has no "Blocked by" line.

**D2, recommendation taken:** a mission copy of the cogr class pin tool, adapted to `svg-dot`.
- **Rejected: hand edits** (see D2).
- **Rejected: a generic multi-type pin tool under `scripts/`.** It would be build tooling no other task asked for.

**D3, recommendation taken:** error-page entries in the one `ratchet.json`, with `jarError` and a held score, after
the board/chart/bpm/wbs pattern.
- **Rejected:** leaving the 8 unpinned, or a second manifest (see D3).

**D4, recommendation taken:** diagnose, then fix only a mechanism that lives in this repository; otherwise file it.
- **Rejected: park the whole issue as needing a ruling.** Only 2 of 57 rows might need one, and the skill says a
  question about some of the work is not a reason to park.
- **Rejected: decide now that the delta is host font metrics.** The kerning lead is a planning read. Quoting the C
  and the Java is the task's first step, and a lead is not a mechanism (CLAUDE.md).

**Why this is not a parking case:** #141 says what done means. No row needs a maintainer-reserved decision at
planning. No public type changes, and nothing is irreversible. If T2 finds a row that needs a ruling, that row goes
on its own issue and the rest of the mission continues.

**D1, D5, D6:** each follows from the measurements and the project rules, and is recorded above with its evidence.
