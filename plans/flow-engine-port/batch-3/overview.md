# Batch 3 — turn on, probes, residuals and ruling

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3a | Register the plugin at java:185, wire the seams, measure the row | orchestrator | `src/diagrams/flow/index.ts`, seams | T2b | [x] |
| T3b | Copy the probes into `tests/fixtures/flow/`, author more, render oracles, classify variance | orchestrator | `tests/fixtures/flow/**` | T3a | [x] |
| T3c | Drive every residual to zero, multiset-equal or a D11 end; file the D4 ruling | orchestrator or typescript-pro | `src/diagrams/flow/**`, `src/core/golem/**` | T3b | [x] |

## Batch close
The task contract's batch close in full, from here on: full `npm run svg:survey`, `verdict-diff` against `<base>`
(0 lost), census away-from-jar list, `npm run parity:dashboard`, gates.
