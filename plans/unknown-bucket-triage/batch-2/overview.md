# Batch 2 — sprite partition, state table, sequence note

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-sprite-partition.md) | A group named by an SVG sprite: sized by the sprite, the sprite drawn with the group's stroke | orchestrator | `src/diagrams/activity/` group and composite files, possibly `src/core/klimt/sprite/`, tests | T1b | [x] |
| [T2b](T2b-state-table-stroke.md) | A composite state's creole table takes `drawUState`'s ambient stroke | orchestrator | `src/diagrams/state/renderer-box*.ts`, the composite renderer, tests | T0 | [x] |
| [T2c](T2c-sequence-note-left.md) | Diagnose and fix the 3 px shift on `teoz-ng-001-17` | orchestrator | `src/diagrams/sequence/` note placement, tests | T0 | [x] |

Serial (D5). T2b and T2c touch other engines, so either may run first.

Exit: `bezogu-47`, `rurufo-83`, `tivado-46`, `legoda-27` (5 diffs each at T0), `jutesi-96` (8), `lofabo-38` (8)
and `teoz-ng-001-17` (46) conformant, or each residual journaled with its owner. Close per
[task-contract.md](../task-contract.md).
