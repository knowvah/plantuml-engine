# T3d — activity fills and fonts

Agent: typescript-pro (opus, effort high), worktree `dss-T3d`. Include [../task-contract.md](../task-contract.md).
Commit: `fix(diagrams): activity reads scoped fills and fonts (T3d)`.

## Context
Planning deltas: bg 13 in every form (boxes, diamonds, notes, fork bars), font 9/7/0. Activity's defaults are per element (`activity-style-defaults*.ts`) and its circles have a merged style (`activity-circle-style.ts`). Its signature is `root,element,activityDiagram,<sname>` (`ftile/vertical/FtileBox.java:98`, `ftile/FtileFactoryDelegator.java:84`). `LineColor` is T4a: do not chase it here.

## Task
Audit sites 1–7, probe-only 5–7 included (user ruling 2026-11-02). Route each bucket-skipping site the audit lists through the resolved element colour, keeping stereotype and
inline-colour tiers above it. Mirror the Java at each site; a site whose Java reads a different signature than the audit
says is a finding. Tests first, citing the row or the Java.

## Rows
`activity__cascade-bg-*`, `activity__cascade-font-*`, `activity__{lanes,loops,sdl}-{bg,font}-*`. (the orchestrator tightens this list at the B2 close.)

## Write-set
`src/diagrams/activity/*`, `src/core/activity-circle-style.ts`, `tests/unit/activity/*`.

## Read-set
`plans/diagram-style-scope/measurements/reader-audit.md` (your engine's section), [../decisions.md](../decisions.md) D2, D3, `src/core/style-element-scope.ts`, `src/core/theme-element-resolve.ts`.

## Acceptance
- Given the activity bg and font rows in all four forms, then 0 extra diffs, swimlanes and notes included.
- Given every corpus row of the engine, then conformant held and any byte mover passes the gate (D3b), named with its mechanism.

Observability: N/A. Rollback: Reversible.
