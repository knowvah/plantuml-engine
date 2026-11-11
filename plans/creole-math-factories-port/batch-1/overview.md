# Batch 1 — shared pieces

Three independent pieces the factories build on. Nothing is reachable from `renderSync` yet: the unit tests are the measure.
Run serially (D10).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-basic-factory.md) | Port `PSystemBasicFactory` | typescript-pro | `src/core/command/PSystemBasicFactory.ts`, test | T0 | [x] |
| [T1b](T1b-language-descriptor.md) | Port `LanguageDescriptor` | typescript-pro | `src/core/syntax/LanguageDescriptor.ts`, test | T0 | [x] |
| [T1c](T1c-math-document.md) | The Batik-shaped document, with a body seam | typescript-pro | `src/core/math/math-document.ts`, test | T0 | [x] |

Close per [task-contract.md](../task-contract.md#batch-close). Batch-close surveys are skipped here (nothing renders new
output). Interface outputs consumed by batch 2 are in each task's file.
