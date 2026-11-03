# T3b — class and object readers

Agent: typescript-pro (sonnet, effort high), worktree `dss-T3b`. Include [../task-contract.md](../task-contract.md).
Commit: `fix(diagrams): class and object read the scoped element colours (T3b)`.

## Context
Planning deltas: class bg 3, line 2, font 1 in every form (notes, package frames); object bg 4/2/2, line 5/0/0, font 5/0/0. Object entities use `objectDiagram` (`EntityImageObject#getStyleSignature`) while the document uses `classDiagram`. Class already reads `style-cascade-class*.ts`; keep that seam and correct what the audit names.

## Task
All audit class sites 1–6 and object sites 1–3, probe-only ones included (user ruling 2026-11-02). `object__cascade-bg-diag` moved here from T2a: the leak is `renderer-classifier-colors.ts:52`. Route each bucket-skipping site the audit lists through the resolved element colour, keeping stereotype and
inline-colour tiers above it. Mirror the Java at each site; a site whose Java reads a different signature than the audit
says is a finding. Tests first, citing the row or the Java.

## Rows
`class__cascade-*`, `object__cascade-*`, `class__element-order-*`, `class__{notes,kinds,generic}-*`, `object__kinds-*`, `class__d*`, `object__d5-*`. (the orchestrator tightens this list at the B2 close.)

## Write-set
`src/diagrams/class/*`, `src/core/style-cascade-class*.ts`, `tests/unit/class/*`.

## Read-set
`plans/diagram-style-scope/measurements/reader-audit.md` (your engine's section), [../decisions.md](../decisions.md) D2, D3, `src/core/style-element-scope.ts`, `src/core/theme-element-resolve.ts`.

## Acceptance
- Given the class and object `cascade` rows and `class__element-order-*`, then 0 extra diffs.
- Given `object__cascade-bg-diag` (`classDiagram` selector), then object entities keep their default, as the jar does.
- Given `objectDiagram { BackgroundColor }` on an object row, then objects take it and the document does not.
- Given every corpus row of the engine, then conformant held and any byte mover passes the gate (D3b), named with its mechanism.

Observability: N/A. Rollback: Reversible.
