# Batch 3 — monochrome and reverse colour

One mapper over the whole output, the root background included (D6). Class, component, object and usecase are
already conformant on every `mode-*` row except dark. They are guards here.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T3a](T3a-activity-sequence-background.md) | Activity and sequence: the root background and the participant head through the mapper | orchestrator or `typescript-pro` | `src/diagrams/activity/renderer.ts`, `src/diagrams/sequence/renderer.ts`, tests | batch 2 | [x] |
| [T3b](T3b-state-mapper.md) | State gets the fragment mapper | orchestrator or `typescript-pro` | the state renderer's return point, tests | batch 2 | [x] |

Rows: `activity/gigefo-15-cami497`; authored `activity__mode-monorev`, `-revdark`, `-revrbg`;
`sequence__mode-monorev`, `-revdark`, `-revrbg`; `state__mode-monorev`, `-revdark`, `-revrbg`, `-mono-style`.

Close: the task contract's batch close, then pin `gigefo-15` in the activity golden ratchet (D8).

Observability: N/A — no new observable operations. Rollback: Reversible (revert the batch commits).
