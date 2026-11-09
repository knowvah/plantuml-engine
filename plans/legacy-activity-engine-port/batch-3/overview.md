# Batch 3 — turn on, drive the rows, probes

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3a | Register at `java:137`; routing, refusal and style-scope pins | orchestrator | `registered-plugins.ts`, gate baselines | T2d | [x] |
| T3b | Drive the 124 rows, one sub-task per diff family | typescript-pro | engine and core files the family needs | T3a | [x] |
| T3b-1 | Note on link: `EntityImageNoteLink` beside the edge label (pumime-12, robezu-51, terupo-52, xudulo-43) | typescript-pro | `renderer-edge.ts`, `src/core/svek/` | T3a | [x] |
| T3b-2 | Swimlane DOT: `minPoint`/`maxPoint`, `sourceIn`/`sinkIn` (cutuzu-67, xoxite-49) | typescript-pro | `activity-legacy-dot.ts`, graph-layout emitter | T3a | [x] |
| T3b-3 | Octagon activity polygon from the laid-out node (japasi-25, nikezu-09) | typescript-pro | `EntityImageActivity`, layout | T3a | [x] |
| T3b-4 | Class parser over-accepts `-down[hidden]->` (radute-87) | typescript-pro | `src/diagrams/class/` link grammar | T3a | [x] |
| T3c | Authored fixtures past the rows (D6) | typescript-pro | `tests/fixtures/activity-legacy/**` | T3a | [x] |
| T3c-2 | Swimlane under kermor: no lane scaffolding in the layout (swimlane-kermor) | orchestrator | `src/core/svek-dot-swimlane.ts` | T3c | [x] |

T3b and T3c both edit engine files when a probe finds a defect: run them serially. T3b is expected to split
(`T3b-1`, `T3b-2`, ...); add each as a row here with its family before starting it.

Close per [task-contract.md](../task-contract.md#batch-close), all steps.
