# T3c — state composite notes (D7) and audit sites 1–12

Agent: typescript-pro (sonnet, effort high), worktree `dss-T3c`. Include [../task-contract.md](../task-contract.md).
Commit: `fix(diagrams): state reads the scoped element colours (T3c)`.

## Context
Audit §3 and D7: the composite pipeline lays notes out and never draws them, which is the whole 46-diff baseline. Fix that FIRST and commit-measure it alone: `state__cascade-none` 46 → 0 with `buildFlatNoteGeos` appended in `layoutComposite`, but read `layout.ts:166` and mirror its creation-order sort rather than appending blindly. Composite-scoped notes (`scopeId !== ''`) are not covered by that experiment: measure them against the jar and report. Then audit sites 1–12. Sites 13–19 are T3e's. Audit site 9 overrides locally; `core/arrow-label-font.ts` is outside your write-set.

## Task
Route each bucket-skipping site the audit lists through the resolved element colour, keeping stereotype and
inline-colour tiers above it. Mirror the Java at each site; a site whose Java reads a different signature than the audit
says is a finding. Tests first, citing the row or the Java.

## Rows
`state__cascade-*`, `state__scope-state-classdiagram`, `state__flatnote-*`, `state__d*`. (the orchestrator tightens this list at the B2 close.)

## Write-set
`src/diagrams/state/*`, `tests/unit/state/*`.

## Read-set
`plans/diagram-style-scope/measurements/reader-audit.md` (your engine's section), [../decisions.md](../decisions.md) D2, D3, `src/core/style-element-scope.ts`, `src/core/theme-element-resolve.ts`.

## Acceptance
- Given `state__cascade-none`, then 0 diffs; given the other state `cascade` rows, then 0 diffs.
- Given every state corpus row, then conformant held. A mover with no `<style>`/`skin` is allowed only when moved solely by the note geos (D7): list each, with before → after, moving toward the jar.
- Given a row that rises after the note fix, then stop and report it: stop 6 still applies.

Observability: N/A. Rollback: Reversible.
