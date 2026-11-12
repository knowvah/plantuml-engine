# Batch 3 — turn on, probes, residuals

Serial in the main checkout (D10). From T3a on, every task measures with the survey (task contract step 5).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3a | [Register the plugin and measure the 4 rows](T3a-turn-on.md) | orchestrator | `src/diagrams/git/index.ts`, `src/registered-plugins.ts`, `src/core/{block-extractor,assemble-svg}.ts`, `tests/architecture/layering.test.ts`, `docs/catalog.md` | T2b | [x] |
| T3b | [Authored probes](T3b-authored-probes.md) | orchestrator or typescript-pro | `tests/fixtures/git/**` | T3a | [x] |
| T3c | [Residuals: fix or name each remaining diff](T3c-residuals.md) | orchestrator | `src/diagrams/git/**`, the T1c core modules, `DIVERGENCES.md` | T3a, T3b | [x] |

Observability: N/A — no new observable operations. Rollback: Reversible (each task is one revertible commit).
