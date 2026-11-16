# Batch 1: pin the 111

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1](T1-pin.md) | Copy the class pin tool, pin the 111 zero rows, update the running counts | orchestrator | `tools/*`, `oracle/goldens/svg-class/**`, routing/refusal baselines, count constants | T0 | [x] |
| T1b | Multiline `usecase` opener types the leaf USECASE (split from T1, journal 3) | orchestrator | `class-multiline-element.ts`, test, pin | T1 | [x] |

Batch 1 closes with the README gates. No `src/` changes, so no survey is needed: `verdict-diff` starts at batch 2.
