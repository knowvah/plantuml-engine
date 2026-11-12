# Batch 3: turn on, fixtures, residuals, ELK

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3a | Register the plugin and the `chen` tag; check that routing does not move | orchestrator | `src/registered-plugins.ts`, `src/core/block-extractor.ts`, `tests/oracle/svg-conformance/render-fixture-cheneer.ts` (early) | T2d | [x] |
| T3b | Fixtures: the 48 probes plus authored ones, with jar oracles, DOTs and a stability check | orchestrator | `tests/fixtures/cheneer/**` | T3a | [x] |
| T3c | Drive the fixture diffs to an end, one task per diff family | typescript-pro | `src/diagrams/cheneer/**`, `src/core/svek/**` | T3b | [x] |
| T3d | `!pragma layout elk`: the Chen ELK adapter | typescript-pro | `src/diagrams/cheneer/cheneer-elk-adapter.ts`, `index.ts` | T3c | [x] |

From this batch on, close with the every-engine survey ([task-contract.md#batch-close](../task-contract.md#batch-close)).
