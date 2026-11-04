# Batch 1 — the gate and the tool

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1](T1-coverage-gate.md) | Pure coverage function and an empty reasons file | typescript-pro or orchestrator | `scripts/lib/oracle-coverage.ts`, its test, `oracle/no-oracle-reasons.json` | T0 | [x] |
| [T2](T2-capture-tool.md) | Route, stage and install tool, plus docs | typescript-pro or orchestrator | `scripts/capture-missing-oracles.ts`, `scripts/lib/oracle-route.ts`, `scripts/capture-oracle-cache.ts`, tests, `oracle/README.md`, `scripts/populate-corpus.py` | T1 | [x] |

T2 imports T1's function, so run them in order. The real-tree test lands in T5, when it can be green.
**Close:** the four gates, then `chore(ogc-b1): close batch 1`.
