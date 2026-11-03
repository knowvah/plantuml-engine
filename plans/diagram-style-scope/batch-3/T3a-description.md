# T3a — description: component and usecase readers

Agent: typescript-pro (sonnet, effort high), worktree `dss-T3a`. Include [../task-contract.md](../task-contract.md).
Commit: `fix(diagrams): description reads the scoped element colours (T3a)`.

## Context
Planning deltas (`<x>Diagram` / `element` / `root`): component bg 14/2/2, line 16/2/0, font 8/7/7; usecase bg 6/2/2, line 7/1/0, font 6/5/5. A description diagram's style name is `componentDiagram` (`DiagramType.java:250-251`), usecase included.

## Task
Audit site 1 is yours (`renderer-edge.ts:29,33`, override locally from `elements.arrow.font`; `core/arrow-label-font.ts` is out of your write-set). Sites 2 and 3 landed in T2a. Route each bucket-skipping site the audit lists through the resolved element colour, keeping stereotype and
inline-colour tiers above it. Mirror the Java at each site; a site whose Java reads a different signature than the audit
says is a finding. Tests first, citing the row or the Java.

## Rows
`component__cascade-*`, `usecase__cascade-*`, `component__{syms,clusters,links}-*`, `component__d*`, `usecase__d5-*`. (the orchestrator tightens this list at the B2 close.)

## Write-set
`src/diagrams/description/*`, `tests/unit/description/*`.

## Read-set
`plans/diagram-style-scope/measurements/reader-audit.md` (your engine's section), [../decisions.md](../decisions.md) D2, D3, `src/core/style-element-scope.ts`, `src/core/theme-element-resolve.ts`.

## Acceptance
- Given the component and usecase `cascade` rows, then each equals its `cascade-none` baseline (0 extra diffs), clusters and notes included.
- Given every corpus row of the engine, then conformant held and any byte mover passes the gate (D3b), named with its mechanism.

Observability: N/A. Rollback: Reversible.
