# T3g — class visibility icon and mindmap Margin

Agent: typescript-pro (sonnet, effort high), worktree `dss-T3g`. Include [../task-contract.md](../task-contract.md).
Commit: `fix(diagrams): visibility icon and mindmap margin read the style (T3g)`.

## Context
Added by the orchestrator under D8 from the probe past the rows (130 engine x form x chrome probes vs the jar; 107 identical).

## Task
1. **Visibility icon.** `element { LineColor #BB0000 }` or `root { ... }` on `class A { +ab }`: jar icon stroke `#B00`, ours `#038048`. The signature names no diagram: `root,element,visibilityIcon,<kind>` (`skin/VisibilityModifier.java:336-350`), with the kind's default in `plantuml.skin:216-`, so the last declaration wins and `classDiagram { LineColor }` must NOT reach it (it does not today; keep that). Ours reads only `visibilityIcon` selectors (`src/core/style-cascade-visibility-icon.ts`, `src/diagrams/class/class-visibility-icon.ts:181-182`). Route it through the builder: a `style-element-scope.ts` row per kind, with the citation, and the reader takes the bucket first. Cover every kind and both colours (`BackgroundColor` shows on a method's icon), plus the order case `visibilityIcon { public { LineColor #x } } element { LineColor #y }`. Object documents take the same reader: check.
2. **mindmap `document { Margin }`.** `document { Margin 20 }` on `@startmindmap`: canvas height jar 149, ours 129, 40 diffs. `root { Margin 10 }` passes only because 10 is the default. Read `core/TextBlockExporter.java:510-516` and how `src/diagrams/wbs/` and the mindmap engine get their margin, then mirror wbs, which passes. Keep today's value when nothing sets a margin.

## Rows
New, with jar oracles, named for the orchestrator to pin: `class__x-icon-{element,root,method-bg,order,diag}`, `object__x-icon-element`, `mindmap__x-margin-{document,root,sides}`.

## Write-set
`src/diagrams/class/class-visibility-icon.ts`, `src/core/style-cascade-visibility-icon.ts`, `src/core/style-element-scope.ts`, `src/diagrams/mindmap/*`, `tests/unit/class/*`, `tests/unit/mindmap/*`, `tests/unit/core/*`, the new fixtures.

## Acceptance
- Given the new rows, then 0 diffs, or each residue named with its mechanism.
- Given every corpus row, then conformant held; a mover with no `<style>`/`skin` is a defect: neither fix should touch one.

Observability: N/A. Rollback: Reversible.
