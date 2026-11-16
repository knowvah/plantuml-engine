# Batch 4: domain and requirement

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T4a](T4a-domain-command.md) | Port `CommandCreateDomain`: leaves, groups, stereotypes | orchestrator or `typescript-pro` | `src/diagrams/description/command-domain.ts`, parser, cluster style | T3b | [x] |
| [T4b](T4b-boxed-domain.md) | `BoxedCharacter`, size-8 outline captures, `EntityImageDomain` | orchestrator or `typescript-pro` | `src/core/descdiagram/{BoxedCharacter,boxed-glyph-data,EntityImageDomain}.ts` | T4a | [x] |
| [T4c](T4c-machine-designed-requirement.md) | `EntityImageMachine`, `EntityImageDesignedDomain`, `EntityImageRequirement`, dispatch | orchestrator or `typescript-pro` | `src/core/descdiagram/EntityImage*.ts`, `renderer-entity.ts`, layout | T4b | [x] |

Serial. Closes with the [batch close](../task-contract.md#batch-close). Target: `rukitu`, `dei-domain-each`,
`dei-requirement`, `dei-domain-group` at zero.
