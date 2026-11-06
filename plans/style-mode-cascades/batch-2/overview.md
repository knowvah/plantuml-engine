# Batch 2 — dark mode

`skinparam mode dark` maps every builder colour through `ColorMapper.DARK_MODE` (D2). T2a builds the shared path
and closes sequence. T2b and T2c carry it into the engines that read their own colour tables.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-dark-core-sequence.md) | Builder colours through `DARK_MODE` in `buildTheme`; sequence | orchestrator or `typescript-pro` | `src/core/build-theme.ts`, `style-element-scope.ts`, `theme-dark.ts`, `skinparam-theme-builder.ts`, sequence readers, tests | batch 1 | [x] |
| [T2b](T2b-dark-description-class.md) | Component, usecase, class, object and activity: boxes and notes | orchestrator or `typescript-pro` | description, class and activity colour readers, tests | T2a | [x] |
| [T2c](T2c-dark-state.md) | State: boxes, notes, and the `mode-dark-style` row | orchestrator or `typescript-pro` | state colour readers, tests | T2a | [x] |

Rows: dss `sequence__scope-dark-explicit-white`, `-own`, `-skinparam-white`, `-style`, `-unrelated-style`,
`component__probe-dark`, `component__probe-dark-element`; authored `*__mode-dark` and `*__mode-dark-style` in seven
engines. Guard rows that must stay as they are: the three corpus dark-mode rows (activity `levuma-67`, class
`zirori-93`, sequence `voruto-32`), and `sequence__scope-dark-skinparam-white` and `-explicit-white` wherever their
diffs show the explicit value, because a colour with no `@media` partner keeps itself.

Close: the task contract's batch close.

Observability: N/A — no new observable operations. Rollback: Reversible (revert the batch commits).
