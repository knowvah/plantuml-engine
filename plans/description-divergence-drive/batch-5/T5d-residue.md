# T5d — residue

Commit: `fix(description): close the remaining rows` (one per mechanism).

Re-run `row-diffs.mts` and `classify.mjs` on a fresh survey. Read every open row: the survey short-circuits, so batches 1 to 5 will have exposed diffs nobody has seen.

Planned rows with no family: `perapa-23` (port-cluster x, "unexplained after three probes" in codd), `banatu-09` (same family, 0.125 px), `runedi-09`, `larevi-66`, `barobi-40`, `vevali-53` (`!define` macros with `nodesep 70`, `ranksep 120`, 676 diffs and `dotEqual` false, so read its DOT first), and the four `berufi-69`, `bobije-35`, `seline-83`, `xoculo-95` at `g[36]`, `text @x`, where a `skinparam defaultTextAlignment center` reaches something we left-align.

Ruled out in planning for `perapa-23` and `banatu-09`: the `ee` against `i` membership that was issue 39's mechanism (`docs/graphviz-issues/39-*.md`, fixed in `16ad2ffd4`). `tests/oracle/svek-dot.ts#scanNesting` now counts `ee` declarations, and that change flipped no component or unknown row. A hasPort cluster re-declares its anchor in `i` regardless (`ClusterDotString.java:178-181`), so the port-cluster family's membership was already right. Detail in `.agent-notes/dot-engine-2.10.2-bump.md`. Both rows still have no stated mechanism: start from the Java, not from that trace.

Each row ends by D7. Journal one line per mechanism, with `file:line`. Split a commit per mechanism, and push forward rather than stopping: a row with no answer after reading the Java and instrumenting is a named lead on a chained issue, with the measurement.

## Acceptance
- Given a fresh survey, then every open row in scope has an end under D7 in `measurements/final-rows.md`, with no "unknown".

Observability: N/A — no new observable operations. Rollback: Reversible.
