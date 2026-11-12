# Batch 1: factory, commands, diagram

The files are unreachable from `renderSync` until T2a registers the plugin, so the unit tests are the measure. T1b
edits the diagram T1a creates, so they run in order.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | `CommandListSprite`, the common-commands copy, the skin param, `ListSpriteDiagram` (no page yet), `parseListSprite` | typescript-pro | see [T1a](T1a-factory-commands.md) | T0 | [x] |
| T1b | `getAllSpriteNames`, the sprite `TextBlock`, `ListSpriteDiagram#getTextBlock` | typescript-pro | see [T1b](T1b-sprite-page.md) | T1a | [x] |

Close the batch as [task-contract.md](../task-contract.md#batch-close) says (no survey yet).
