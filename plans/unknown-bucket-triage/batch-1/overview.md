# Batch 1 — activity stereogroups: colour and style

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-stereogroup-colours.md) | `<<#color>>` on if, elseif, endif, repeat and every command upstream reads it on | orchestrator | `src/diagrams/activity/` dispatch, AST and the tiles that draw the coloured shape, tests | T0 | [x] |
| [T1b](T1b-stereotype-merged-style.md) | A stereotyped box reads one merged `Style`: stroke, font, padding as well as colours | orchestrator | `activity-scoped-colors.ts`, `activity-renderer-shapes.ts`, the action and backward sizers, tests | T1a | [x] |

Serial: both touch `dispatch-stereogroup.ts` and `activity-renderer-shapes.ts`.

Exit: `cubixe-14` (4 diffs at T0), `lacifo-03` (2) and `mazuxi-71` (3) conformant; `gucipa-88` (85), `ticini-08`
(90), `xebuce-87` (96) and `xevumo-18` (216) conformant or each residual journaled with its owner. Close per
[task-contract.md](../task-contract.md).
