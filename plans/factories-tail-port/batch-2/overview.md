# Batch 2: fixtures and residuals

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-fixtures.md) | Land the 27 probes as fixtures, author the gaps, check jar stability | orchestrator | `tests/fixtures/factories/cov-{welcome,listfont,listfonts,crash,path}-*`, `measurements/jar-variants.mjs` | T1d | [x] |
| [T2b](T2b-residuals.md) | One sub-task per remaining diff family (`cov-listfonts-tab` at least) | typescript-pro | `src/diagrams/{crash,font,eggs}/**`, shared modules a residual reaches | T2a | [x] |

Batch close per [task-contract.md](../task-contract.md#batch-close). If the factories authored gate requires a
baseline row for every `.puml` on disk, run T3 before this batch's gate run, and close batches 2 and 3 together (lsp
journal row 8).
