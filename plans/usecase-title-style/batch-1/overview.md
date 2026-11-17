# Batch 1: gate, port

Serial: T1b depends on T1a's gate file.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-gate.md) | Move the probes into an authored gate, all `OPEN` | orchestrator | `tests/fixtures/usecase-title-style/`, `usecase-title-style.authored.test.ts` | T0 | [x] |
| [T1b](T1b-port.md) | Read a usecase as `EntityImageDescription` does, pin the rows | orchestrator or `typescript-pro` | `description-entity-style.ts`, its unit test, the gate | T1a | [x] |

Close with the batch close in [task-contract.md](../task-contract.md).

Observability is N/A for both tasks. Rollback is Reversible (revert the task commit).
