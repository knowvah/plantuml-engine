# Batch 3 — turn on, probes, residuals

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T3a](T3a-turn-on.md) | Register the engine | orchestrator | `src/diagrams/wire/index.ts`, seams, enumerating tests | T2b | [x] |
| [T3b](T3b-authored-probes.md) | Copy and extend the probes | orchestrator or `typescript-pro` | `tests/fixtures/wire/**` | T3a | [x] |
| [T3c](T3c-residuals.md) | Close every open row and fixture | orchestrator or `debugger` | `src/diagrams/wire/**`, klimt modules a residual reaches | T3a, T3b | [x] |

Close: survey, dashboard, drift test (see [task-contract.md](../task-contract.md#batch-close)), then
`chore(wrp): close batch 3`.
