# Batch 3 — turn on, probes, math sizing

Serial (D10). T3a makes the factories live. From there the survey is the measure, and every task from T3c on changes shared
`latex-metrics`, so survey **every** engine before the commit.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T3a](T3a-turn-on.md) | Register the plugins; first survey | orchestrator | `registered-plugins.ts`, `block-extractor.ts`, `EmbeddedDiagram.ts`, survey | T2a–T2d | [x] |
| [T3b](T3b-probes.md) | Copy probes to fixtures, fix non-math residuals | typescript-pro | `tests/fixtures/factories/**`, `src/` residual | T3a | [x] |
| [T3c](T3c-rollback.md) | Mirror JLaTeXMath rollback (D5, D6) | typescript-pro | `latex-metrics/jlm-commands.ts`, `ScientificEquationSafe`, `AtomMath`, tool | T3a | [x] |
| [T3d](T3d-accents.md) | Accent and underline sizing | typescript-pro | `latex-metrics/` | T3a | [x] |
| [T3e](T3e-stacks.md) | Newline and stack sizing | typescript-pro | `latex-metrics/` | T3a | [x] |
| [T3f](T3f-symbols.md) | Symbol metrics, ±1, 8×8 cases | typescript-pro | `latex-metrics/` | T3a | [x] |
| [T3g](T3g-name-the-rest.md) | Name what remains; file the ruling | orchestrator | `DIVERGENCES.md`, new issue | T3c–T3f | [x] |

Close per [task-contract.md](../task-contract.md#batch-close), with the full survey and `verdict-diff`.
