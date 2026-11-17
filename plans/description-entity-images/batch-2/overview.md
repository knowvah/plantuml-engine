# Batch 2: json

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-json-image.md) | Port `EntityImageJson` + `TextBlockCucaJSon` to core | orchestrator or `typescript-pro` | `src/core/svek/image/EntityImageJson.ts`, `TextBlockCucaJSon.ts`, their tests | T1a | [x] |
| [T2b](T2b-json-description.md) | Wire `json` into description: commands, `leafType`, layout, render | orchestrator or `typescript-pro` | `src/diagrams/description/*` (see task) | T2a | [x] |

Serial: T2b consumes T2a's image. Closes with the [batch close](../task-contract.md#batch-close). Target: `gacoxo`,
`dei-json-top`, `dei-json-single`, `dei-json-group` at zero.
