# Batch 2 — oracle bytes and the port

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-oracle-bytes.md) | Write the seam-5 oracle bytes for T1b's movers; adopt the jar | orchestrator | oracle bytes (movers only), `oracle/dist/plantuml-oracle.jar` (untracked) | T1b | [x] |
| [T2b](T2b-png-bounder.md) | `png-string-bounder.ts`; wire `print` follows the render's mode | orchestrator or `typescript-pro` | `src/core/png-string-bounder.ts`, `src/diagrams/wire/{WireDiagram,WireDiagramFactory,index}.ts`, tests | T2a | [x] |
| [T2c](T2c-rollback-size.md) | Rollback atom sized by its PNG export; author creole rollback fixtures | orchestrator or `typescript-pro` | `src/core/klimt/creole/atom/AtomMath.ts`, `src/core/math/ScientificEquationSafe.ts`, tests, `tests/fixtures/factories/cov-rollback-*` | T2b | [x] |

Serial, in this order (D6). After T2a, the wire `print` and #170 tests are red by design. Journal the failing test names
in T2a's row; T2b and T2c turn them green. T2c depends on T2b for the PNG bounder module, so the two write sets do not
overlap.

## Close

Run the README gates (green is required here), then the full `npm run svg:survey`, `verdict-diff.mjs <base>` and
`npm run parity:dashboard` (task-contract "Batch close"). Re-pin what newly reached 0 with each engine's own tool:
`svg-factories` (`diff-baseline.json`), and `svg-wire` if a golden moved. Tick, journal, and commit
`chore(pbs): close batch 2`.
