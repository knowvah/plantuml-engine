# Batch 3 — turn on, probes, residuals

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3a | Register the engine; retire bakuza and tajefa (D8) | orchestrator | `src/diagrams/regex/index.ts`, `src/registered-plugins.ts`, `src/core/{block-extractor,document-back-color,assemble-svg}.ts`, `oracle/accepted-divergences.json`, tests | T2b | [x] |
| T3b | Authored fixtures and oracles (D6) | orchestrator or typescript-pro | `tests/fixtures/regex/**` | T3a | [x] |
| T3c | Residual diffs on rows and fixtures | orchestrator | `src/diagrams/regex/**`, a shared module a residual reaches | T3b | [x] |

Serial (D10). From T3a on, the task contract's measure step applies.

## Batch close

The task contract's batch close, all four steps: the full survey, `verdict-diff` against `<base>` with 0 lost, the
census away-from-jar list, the dashboard.
