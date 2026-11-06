# Batch 5 — whole-document

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5a | `skinparam handwritten` | orchestrator | `description/renderer.ts`, `core/UgDiagram.ts` | T4g | [x] |
| T5b | `!theme`, `skin`, monochrome | orchestrator | `description-entity-style.ts`, theme readers | T5a | [x] |
| T5c | Inline gradient, shadow, interactive defs, transparent root | orchestrator | `renderer-color-override.ts`, `renderer-entity.ts`, `core/klimt/drawing/svg/` | T5a | [x] |
| T5d | Residue: read every open row | orchestrator | as found | T5b, T5c | [x] |
| T5f | json, map, domain, requirement images (`gacoxo-93`, `liripi-72`, `rukitu-26`): whole entity images, from T1c | orchestrator | `core/svek/image/`, description parser and renderer | T5c | [x] |
| T5e | The rows ended by a standing ruling | orchestrator | `DIVERGENCES.md`, a test | T5d | [x] |

Close: [task-contract.md](../task-contract.md).
