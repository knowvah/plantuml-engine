# Batch 3 — turn on, probes, residuals

Serial (D9). From T3a on, every task measures with the survey (task contract step 4).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3a | Register the plugin and route `@startnwdiag` and `{{nwdiag}}` to it | orchestrator | `src/diagrams/nwdiag/index.ts`, `src/registered-plugins.ts`, `src/core/{block-extractor,document-back-color,assemble-svg}.ts`, tests that name them | T2b | [x] |
| T3b | Authored probes past the corpus | orchestrator | `tests/fixtures/nwdiag/**`, fixes in `src/diagrams/nwdiag/**` | T3a | [x] |
| T3c | Corpus residuals: every one of the 68 rows to zero or a D6 end | orchestrator, `typescript-pro` per mechanism | `src/diagrams/nwdiag/**`, shared klimt modules a residual reaches | T3a | [x] |

T3b and T3c may interleave: a mechanism found on a fixture often owns corpus rows too. Journal which task owns each
fix.

## Batch close

Per [task-contract.md](../task-contract.md#batch-close), all four steps. The full survey rewrites every
`parity-*.json`; `unknown` must gain and nothing may be lost in any engine.
