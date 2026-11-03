# T3e — state audit sites 13–19

Agent: typescript-pro (sonnet, effort high), worktree `dss-T3e`, branched after T3c merges. Include [../task-contract.md](../task-contract.md).
Commit: `fix(diagrams): state pseudostates and link notes read scoped colours (T3e)`.

## Context
Split from T3c (stop 13; user ruling 2026-11-02). These sites fail T0c's probes, not a `cascade` row.

## Task
Audit sites 13–19: note on link (signature `sequenceDiagram`, so `stateDiagram { … }` must not reach it), fork and join, history fill, stroke and text, concurrent separator (`ConcurrentStates.java:115-120` reads `state`), sdlreceive text. Mirror the Java at each site; a site whose Java reads a different signature than the audit says is a finding. Tests first, citing the row or the Java.

## Rows
`state__pseudo-*`, `state__hist-*`, `state__conc-*`, `state__cluster-*`, `state__flatnote-*`.

## Write-set
`src/diagrams/state/*`, `tests/unit/state/*`.

## Read-set
`plans/diagram-style-scope/measurements/reader-audit.md` (state), [../decisions.md](../decisions.md) D2a, `src/core/style-element-scope.ts`, `src/core/theme-element-resolve.ts`.

## Acceptance
- Given the rows above, then 0 diffs, or each residue named with its mechanism (audit §8's note-on-link text is one candidate).
- Given every state corpus row, then conformant held and any byte mover passes the gate (D3b), named with its mechanism.

Observability: N/A. Rollback: Reversible.
