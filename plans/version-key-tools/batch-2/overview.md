# Batch 2: rows and accounting

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-authored-rows.md) | Authored fixtures + jar oracles, measured into `authored-baseline.json` | orchestrator | `tests/fixtures/utility/cov-*`, build tool, `authored-baseline.json` | T1d | [x] |
| [T2b](T2b-ledger-divergences.md) | Ledger entries and the `DIVERGENCES.md` entry | orchestrator | `oracle/accepted-divergences.json`, `DIVERGENCES.md` | T2a | [x] |

T2b needs T2a's measured diff counts. Close with the batch close in [task-contract.md](../task-contract.md).
