# Batch 1 — error pages and parser gaps

Rows where ours draws our error page and the jar draws a diagram (D4). They go first: until they parse, their
other diffs are invisible, and a parser fix can hand rows to every later family.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-skinparam-block-routing.md) | A `skinparam` block with stereotyped keys or block comments stays activity | orchestrator or `typescript-pro` | skinparam block parsing / routing in `src/core/`; tests | T0 | [x] (folded into T1b, journal row 8) |
| [T1b](T1b-activity3-parser-gaps.md) | activity3 commands we refuse; `CommandActivityLong3`'s leading colour | orchestrator or `typescript-pro` | `src/diagrams/activity/` parser commands; tests | T1a | [x] |

Close: the task contract's batch close.

Observability: N/A — no new observable operations. Rollback: Reversible (revert the batch commits).
