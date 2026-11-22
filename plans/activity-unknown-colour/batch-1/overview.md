# Batch 1: gate

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1](T1-gate.md) | Move the 30 probes into the authored gate; add the `NEUTRAL` kind | orchestrator or `typescript-pro` | `tests/fixtures/unresolved-colour/act-*`, `unresolved-colour.authored.test.ts` | T0 | [x] |

Closes with the [batch-close procedure](../task-contract.md#batch-close). No `src/` change, so no verdict may move.
