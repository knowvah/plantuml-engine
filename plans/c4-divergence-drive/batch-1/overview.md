# Batch 1 — `biluko-70`: seed and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-stdlib-seed-lines.md) | Seed lines hold the jar's compiled stdlib sprite lines | orchestrator | `src/core/tim/IncludeExecutor.ts`, `src/core/preprocessor.ts`, a new `src/core/tim/` helper, tests | T0 | [x] |
| [T1b](T1b-per-atom-baseline.md) | Each text atom of a line sits on its own descent | orchestrator | `src/core/svek/image/EntityImageDescriptionTextBlock.ts`, tests | T0 | [x] |

Exit: `biluko-70` reaches conformant, or a journal line names what remains. Close per [task-contract.md](../task-contract.md).
