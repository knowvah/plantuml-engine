# Batch 1: diagram, factory, commands

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | `ChenEerDiagram`, the factory walk, skin param, common commands, `CommandEndGroup`, plugin skeleton | typescript-pro | `src/diagrams/cheneer/{ChenEerDiagram,ChenEerDiagramFactory,cheneer-skin-param,common-commands-1,index}.ts`, `command/CommandEndGroup.ts`, `tests/unit/cheneer/**` | T0 | [x] |
| T1b | The five remaining commands and upstream's `CommandCreateEntityTest` | typescript-pro | `src/diagrams/cheneer/command/*.ts`, `tests/unit/cheneer/**` | T1a | [x] |

The tasks run serially (D10). Nothing is registered yet, so `renderSync` cannot reach these files, and the unit tests
are the measure.

**Interface contract (T1a → T1b, T2c, T2d):** `parseChen(source, preprocessing)` returns the populated
`ChenEerDiagram`. Its leaves, links (in `addLink` order), pragma, annotations, `scale` and skin param are everything the
DOT build and renderer read. A failing command returns the factory's error result, which the plugin turns into the
standard error page, as activity-legacy does.

Close with [task-contract.md#batch-close](../task-contract.md#batch-close). The survey step starts at batch 3.
