# Batch 3 — turn on, probes, residuals

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3a | Register the plugin at java:141, wire the seams, measure the 7 | orchestrator | `src/diagrams/bpm/index.ts`, seams, layering test | T2b | [x] |
| T3b | Copy the probes into `tests/fixtures/bpm/`, author more, render oracles | orchestrator | `tests/fixtures/bpm/**` | T3a | [x] |
| T3c | Drive every residual on rows and fixtures to zero or a D12 end | orchestrator or typescript-pro | `src/diagrams/bpm/**`, T1 modules | T3b | [x] |

## Batch close
The task contract's batch close in full, from here on: full `npm run svg:survey`, `verdict-diff` against `<base>`
(0 lost), census away-from-jar list, `npm run parity:dashboard`, gates.
