# Batch 3 — bodies and leaves

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T3a](T3a-table-body.md) | A `|...|` body line is a table, on `entity` and `object` | orchestrator | `class-body-enhanced.ts`, `class-object-fields.ts`, tests | T2d | [x] |
| [T3b](T3b-map-maximum-width.md) | A map cell wraps at `MaximumWidth` | orchestrator | `class-map-sizing.ts`, tests | T2c | [x] |
| [T3c](T3c-state-leaf.md) | A `state` leaf in the class engine draws `EntityImageState` | orchestrator | a state-leaf module, `class-layout-helpers.ts`, `renderer.ts`, tests | T2c | [x] |
| [T3d](T3d-embedded-map-cell.md) | A map cell holding `{{` draws an embedded diagram | orchestrator | `class-map-sizing.ts`, renderer, tests | T3b | [x] |

Exit: `pikuba-31`, `maxosa-84`, `togixe-65`, `zicope-62` and `zuvila-56` conformant, or ended by D8. Close per [task-contract.md](../task-contract.md).
