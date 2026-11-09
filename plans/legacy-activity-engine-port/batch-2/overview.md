# Batch 2 — svek images, DOT, render

Serial. T2a's images are shared core files; T2b to T2d build on the engine directory.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | The five leaf images, with `CircleStart` and `CircleEnd` | typescript-pro | `src/core/svek/image/` | T1a | [x] |
| T2b | The svek DOT and layout | typescript-pro | `layout.ts`, `activity-legacy-dot.ts` | T1b-T1d, T2a | [x] |
| T2c | The renderer, chrome routing, `row-diffs.mts` | typescript-pro | `renderer*.ts`, `assemble-svg.ts` | T2b | [x] |
| T2d | Autarkic groups: `CucaDiagramSimplifierActivity`, `GroupMakerActivity` | typescript-pro | two engine files | T2c | [x] |

Close per [task-contract.md](../task-contract.md#batch-close), steps 1 and 4.
