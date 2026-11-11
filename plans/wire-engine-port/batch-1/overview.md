# Batch 1 — the model: enums, blocks, links

Unit tests only: nothing here is reachable from `renderSync` until T3a. Serial (D10).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-enums.md) | `WArrowDirection`, `WLinkType`, `WOrientation` | orchestrator or `typescript-pro` | `src/diagrams/wire/W{ArrowDirection,LinkType,Orientation}.ts`, tests | T0 | [x] |
| [T1b](T1b-wblock.md) | `WBlock`, `WPrint`, `Spot` | orchestrator or `typescript-pro` | `src/diagrams/wire/{WBlock,WPrint,Spot}.ts`, tests | T1a | [x] |
| [T1c](T1c-links.md) | `WLinkHorizontal`, `WLinkVertical` | orchestrator or `typescript-pro` | `src/diagrams/wire/WLink{Horizontal,Vertical}.ts`, tests | T1a | [x] |

Close: the README's gates and `chore(wrp): close batch 1`.
