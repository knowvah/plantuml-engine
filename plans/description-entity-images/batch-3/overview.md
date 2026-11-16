# Batch 3: map

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T3a](T3a-map-core.md) | Port `BodierMap` (body parse) and `EntityImageMap` to core | orchestrator or `typescript-pro` | `src/core/command/BodierMap.ts`, `src/core/svek/image/EntityImageMap.ts`, tests | T2b | [x] |
| [T3b](T3b-map-description.md) | Wire `map` into description | orchestrator or `typescript-pro` | `src/diagrams/description/*` | T3a | [x] |

Serial. Closes with the [batch close](../task-contract.md#batch-close). Target: `liripi`, `dei-map-top`, `dei-map-link`
at zero.
