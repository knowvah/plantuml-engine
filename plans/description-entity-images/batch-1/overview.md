# Batch 1: fixtures and measurer

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-fixtures.md) | Author `dei-*` fixtures with jar oracles, register them, write the measurer | orchestrator | `oracle/goldens/svg-description/component/dei-*/`, `measurements/measure-dei.mts` | T0 | [x] |

Closes with the [batch close](../task-contract.md#batch-close). No `src/` change, so every verdict must be unchanged
apart from the new `dei-*` rows.
