# Batch 1: gates

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | `invalidColours` helper, every-row refusal-gate assertion, authored gate with the 27 probes | orchestrator or typescript-pro | see T1a | T0 | [x] |

[T1a](T1a-gates.md). No `src/` change in this batch: the gates go in first, so every later task turns an `OPEN` row
`ZERO` under a gate that already holds.

Batch close: the task contract's batch close. The survey should be unchanged; `verdict-diff` still runs.

Observability is N/A for every task here (task contract). Rollback is Reversible: revert the task commit.
