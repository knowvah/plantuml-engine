# Batch 2 — the five factories

Each factory class, tested against jar values, still unreachable from `renderSync` until T3a. Serial (D10).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-creole.md) | `PSystemCreole`, `PSystemCreoleFactory` | typescript-pro | `src/core/klimt/creole/legacy/{PSystemCreole,PSystemCreoleFactory}.ts`, test | T1a | [x] |
| [T2b](T2b-definition.md) | `PSystemDefinition`, `PSystemDefinitionFactory` | typescript-pro | `src/diagrams/definition/*`, test | T1a | [x] |
| [T2c](T2c-math-latex.md) | `DirectOsDiagram`, `PSystemMath`, `PSystemLatex` and their factories | typescript-pro | `src/core/DirectOsDiagram.ts`, `src/diagrams/math/*`, test | T1a, T1c | [x] |
| [T2d](T2d-help.md) | `Help`, `HelpFactory`, the five commands | typescript-pro | `src/diagrams/help/*`, `src/core/themes-source.ts`, test | T1b | [x] |

Close per [task-contract.md](../task-contract.md#batch-close), without a survey (nothing is reachable yet).
