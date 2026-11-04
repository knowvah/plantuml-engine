# Batch 3 — state boxes and composites

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3a | State `Colors`: line colour and stroke | orchestrator | `state-commands-declarations.ts`, `state-render-colors.ts`, `renderer-box*.ts`, `renderer-composite-box.ts` | T1c | [x] |
| T3b | `LineThickness` reads | orchestrator | `state-render-colors.ts`, `renderer-pseudostate.ts`, `renderer-box.ts` | T3a | [x] |
| T3c | Composite header: description, height, zones | orchestrator | `renderer-composite-box.ts`, `state-composite-header.ts`, `state-composite-cluster.ts` | T3a | [x] |
| T3d | Small reads | orchestrator | `state-render-colors.ts`, `renderer-box.ts`, `renderer-group.ts` | T3c | [x] |

Rows: the T3 families in [rows.md](../rows.md). Close: [task-contract.md](../task-contract.md).
