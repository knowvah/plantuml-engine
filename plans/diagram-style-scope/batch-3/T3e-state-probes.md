# T3e — state audit sites 13–19

Agent: typescript-pro (sonnet, effort high), worktree `dss-T3e`, branched after T3c merges. Include [../task-contract.md](../task-contract.md).
Commit: `fix(diagrams): state pseudostates and link notes read scoped colours (T3e)`.

## Context
Split from T3c (stop 13; user ruling 2026-11-02). These sites fail T0c's probes, not a `cascade` row.

## Task
Audit sites 13–19: note on link (signature `sequenceDiagram`, so `stateDiagram { … }` must not reach it), fork and join, history fill, stroke and text, concurrent separator (`ConcurrentStates.java:115-120` reads `state`), sdlreceive text. Mirror the Java at each site; a site whose Java reads a different signature than the audit says is a finding. Tests first, citing the row or the Java.

## Added by D8 (orchestrator, b2 close)
`note on link` text on a state link is missing (audit §8, `lnk4/text[2]`, `state__flatnote-none`): draw it, D8 excepting stop 5 row by row for that jar-ward move. Read `note.link`, `state.*`, `circle.*`, written by T2a. The false comment at `state-render-colors.ts:9`/`renderer-pseudostate.ts:103` (`EntityImageBranch.java:62-63`): fix it where you touch it.

## Rows
`state__pseudo-*`, `state__hist-*`, `state__conc-*`, `state__cluster-*`, `state__flatnote-*`, `state__probe-*` that T3c leaves.

Probe rows at b2, before T3c: `diag` 2, `note-link` 16, `state-after-element` 2, `zones` 26.

## From T3c (orchestrator, measured at its merge)
Left to you, per row at T3c: `probe-note-link` 3, `flatnote-*` 10-12, `hist-*` 43-49 with `hist-none` 43 (border-point layout, not colour: name it), `pseudo-bg-{element,root}` 2, `cluster-*` 1 (the `__zaent_` path id: diagnose whether it is the colour path; name it if not).
Also, D8, each with an authored row and a jar oracle: a flat `stateArrowColor` then a last declaration equal to the default keeps the flat value, the D3a hole for arrows (the bucket is not written); and `state C <<choice>> #red`, where T3c mirrored the jar's `#F1F1F1`. `element { HeadColor }` is a property outside bg, line and font: journal it, do not fix. Composite-scoped notes are T3f's.

## Write-set
`src/diagrams/state/*`, `tests/unit/state/*`.

## Read-set
`plans/diagram-style-scope/measurements/reader-audit.md` (state), [../decisions.md](../decisions.md) D2a, `src/core/style-element-scope.ts`, `src/core/theme-element-resolve.ts`.

## Acceptance
- Given the rows above, then 0 diffs, or each residue named with its mechanism (audit §8's note-on-link text is one candidate).
- Given every state corpus row, then conformant held and any byte mover passes the gate (D3b), named with its mechanism.

Observability: N/A. Rollback: Reversible.
