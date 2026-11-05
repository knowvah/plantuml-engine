# Batch 2 — `RoundCorner` and the class path

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-annotation-round-corner.md) | Annotation boxes read `RoundCorner` from the merged style | orchestrator | `src/core/annotations/style.ts`, `annotation-skinparam.ts`, tests | T1b | [x] |
| [T2b](T2b-class-package-corner.md) | Class and object clusters read `RoundCorner` from the merged style | orchestrator | `src/diagrams/class/class-package-style.ts`, `renderer.ts`, `class-empty-package.ts`, `class-elk-adapter.ts`, tests | T1b | [x] |
| [T2c](T2c-class-dash-and-root.md) | Class edge dash rounded; class root keeps the jar's fractional size and link comment | orchestrator | `src/diagrams/class/` edge and root files, tests | T2b | [x] |

Exit: `rosoga-84` reaches conformant. `vakasu-51` loses its corner diff. Close per [task-contract.md](../task-contract.md).
