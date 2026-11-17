# Batch 1: version string, accounting

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-version-string.md) | `%version()` returns `versionString()` (D1, D2) | orchestrator | `TimEnvironment.ts`, `GetVersion.ts`, their tests | T0 | [x] |
| [T1b](T1b-accounting.md) | Ledger the row, `DIVERGENCES.md`, parity note (D3) | orchestrator | ledger, `DIVERGENCES.md`, `parity-dashboard-notes.ts`, reports | T1a | [x] |

Serial: T1b measures the row T1a moves. Close the batch per `task-contract.md` after T1b.

**Interface T1a → T1b:** the activity survey record for `rekefe-90-baju604` after T1a —
`{ verdict: 'diverged', maxDelta: number, firstDiff: string, maxDeltaPath: string }` — and its diff count from the
diff-baseline ratchet. T1b writes those numbers into the ledger `reason`.

Observability is N/A for both tasks. Rollback is Reversible: revert the task commit.
