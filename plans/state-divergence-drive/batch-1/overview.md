# Batch 1 — identity and draw order

The largest families, and the ones hiding other diffs: `compareSvg` stops descending at a `[childCount]` mismatch. Nothing here moves
geometry. Run these in order, because T1c restructures the file T1b and T1a just touched.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | Link path ids: `Entity#getName`, `-backto-`, `uniq` | orchestrator | `state-renderer-transitions.ts`, `state-geo-types.ts` | T0 | [x] |
| T1b | Border points open no entity group | orchestrator | `renderer.ts`, `renderer-border-point.ts` | T0 | [x] |
| T1c | Clusters, then nodes, then lines | orchestrator | `renderer.ts`, `state-composite-pass*.ts` | T1a, T1b | [x] |
| T1d | Entity uids and quark-made parents | orchestrator | `state-parse-*.ts`, `renderer-uid.ts`, `renderer-composite-box.ts` | T1c | [x] |

Rows: the T1 families in [rows.md](../rows.md). Close: [task-contract.md](../task-contract.md).
