# Batch 1: the three factories and the catch

Serial: every task writes `src/registered-plugins.ts` (D10). Each task registers its own plugin, so the factory is
reachable from `renderSync` as soon as its task lands, and measured against `/tmp/ftp-plan/fx`.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-welcome.md) | `PSystemWelcomeFactory` as `welcomePlugin`; `emptySvg` loses the gate | typescript-pro | `src/diagrams/eggs/PSystemWelcomeFactory.ts`, `error-diagrams.ts`, `index.ts`, registry | T0 | [x] |
| [T1b](T1b-listfonts.md) | `PSystemListFonts{,Factory}`; hoist the font-name seam | typescript-pro | `src/diagrams/font/*`, `src/core/available-font-family-names.ts`, `CommandHelpFont.ts`, registry | T1a | [x] |
| [T1c](T1c-crash.md) | `CrashDiagramFactory` and `@startcrash` | typescript-pro | `src/diagrams/crash/*`, `block-extractor.ts`, registry | T1b | [x] |
| [T1d](T1d-fatal-crash.md) | `PSystemBuilder`'s catch in `dispatcher.ts#attempt` | typescript-pro | `src/core/dispatcher.ts` | T1c | [x] reverted (D7) |

Batch close per [task-contract.md](../task-contract.md#batch-close), survey included: this batch changes routing.
