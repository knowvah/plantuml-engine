# Batch 1: gate

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1](T1-gate.md) | Move the probes into an authored gate: 23 `OPEN`, 10 `EXACT` | orchestrator | `tests/fixtures/svg-dimension-style/`, `svg-dimension-style.authored.test.ts` | T0 | [x] |

Close with the batch close in [task-contract.md](../task-contract.md).

Observability is N/A. Rollback is Reversible (revert the task commit).
