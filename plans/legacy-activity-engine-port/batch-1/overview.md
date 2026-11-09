# Batch 1 — diagram and commands

Serial, one directory (`src/diagrams/activity-legacy/`). Nothing is registered yet, so unit tests are the measure.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | `ActivityDiagram`, `ConditionalContext`, factory skeleton, plugin parse | typescript-pro | engine core files | T0 | [x] |
| T1b | `CommandLinkActivity` | typescript-pro | `command/CommandLinkActivity.ts` | T1a | [x] |
| T1c | Long activity, if/else/endif, partition | typescript-pro | six command files | T1a | [x] |
| T1d | Note commands | typescript-pro | note command files | T1a | [x] |

T1b, T1c and T1d each add their commands to `ActivityDiagramFactory.ts` at the upstream position; that shared file is
why the batch runs serially.

Close per [task-contract.md](../task-contract.md#batch-close), steps 1 and 4.
