# Batch 2 — links

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | `Link#applyStyle` and link stereotype reach the draw | orchestrator | `state-commands.ts`, `state-renderer-transitions.ts`, `state-render-colors.ts` | T1c | [x] |
| T2b | Inverted links: head, id, comment | orchestrator | `state-composite-pass-edges.ts`, `state-composite-transition-geo.ts`, `state-renderer-transitions.ts`, `renderer-arrowhead.ts` | T1a | [x] |
| T2c | Link labels through `getWithNewlines` | orchestrator | `state-composite-edge-label.ts`, `state-commands.ts` | T1c | [x] |

Rows: the T2 families in [rows.md](../rows.md). Close: [task-contract.md](../task-contract.md).
