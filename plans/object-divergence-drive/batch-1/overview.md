# Batch 1 — map links and canvas

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-map-link-uid.md) | A linked map row takes its uid when the map is built | orchestrator | `src/diagrams/class/class-map-commands.ts`, tests | T0 | [x] |
| [T1b](T1b-empty-map-canvas.md) | A map with no rows bounds the canvas by its rect | orchestrator | `src/diagrams/class/class-map-sizing.ts`, tests | T0 | [x] |
| [T1c](T1c-lr-port-edge-decor.md) | The arrowhead stays on the target under `left to right direction` | orchestrator | `src/diagrams/class/class-edge-geo.ts`, tests | T0 | [x] |

Exit: `lisepi-64`, `gatefi-65`, `style-stereotype-on-arrow-7`, `sivapa-41` and `satuco-50` conformant. `gubene-80` loses its id diffs. Close per [task-contract.md](../task-contract.md).
