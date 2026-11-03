# T3a — description: component and usecase readers

Agent: typescript-pro (sonnet, effort high), worktree `dss-T3a`. Include [../task-contract.md](../task-contract.md).
Commit: `fix(diagrams): description reads the scoped element colours (T3a)`.

## Context
Planning deltas (`<x>Diagram` / `element` / `root`): component bg 14/2/2, line 16/2/0, font 8/7/7; usecase bg 6/2/2, line 7/1/0, font 6/5/5. A description diagram's style name is `componentDiagram` (`DiagramType.java:250-251`), usecase included.

## Task
Audit site 1 is yours (`renderer-edge.ts:29,33`, override locally from `elements.arrow.font`; `core/arrow-label-font.ts` is out of your write-set). Sites 2 and 3 landed in T2a. Route each bucket-skipping site the audit lists through the resolved element colour, keeping stereotype and
inline-colour tiers above it. Mirror the Java at each site; a site whose Java reads a different signature than the audit
says is a finding. Tests first, citing the row or the Java.

## Measured after T2a (orchestrator, b2 close; D8 scope)
`component__cascade-bg-diag` 14 → 0 landed in T2a. What remains:
- `cascade-font-{diag,diag-element}` and the usecase pair, 1 each: arrow label, site 1. `elements.arrow.font` is written and has no reader.
- A leaf's `titleFont`: leaf text reads `font` only, where a display equal to the code reads `fcTitle` (`EntityImageDescription.java:152-153,173`; written by T2a, no reader). Rows `component__probe-title`, `-sym-title`.
- `actor/` and `usecase/` ellipse fills (`component__probe-business`).
- `LineColor none` prints `stroke=none` on paths where the jar omits it (`component__probe-transparent`).
- Gradient `FontColor`: `usymbol-resolve.ts:142` falls to black, jar paints `#CCC` (`component__probe-gradient-line`).
- Audit §8, in scope by D8: hexagon leaf polygon missing (`renderer-entity.ts:233` `hexagonPolygon: null`; every `syms-*` row, 1 each) and `note on link` not drawn on a description link (every `links-*` row, 5 each). Both move rows with no `<style>`: D8 excepts stop 5 row by row for a jar-ward move only, each mover named.

## Rows
`component__cascade-font-*`, `usecase__cascade-font-*`, `component__{syms,links}-*`, `component__probe-*`. `-none` rows included: they must reach 0.

Probe rows at b2 (T2a's probes, pins seeded at this measure): `business` 2, `cond-root` 1, `dark` 63, `dark-element` 2, `gradient-line` 2, `short` 1, `skin-rose` 13, `skinparam-after-style` 35, `sym-title` 3, `title` 4, `transparent` 3. `dark`, `dark-element`: dark mode's other diffs are out of scope (name the residue). `skin-rose`, `skinparam-after-style`, `cond-root`, `short`: not diagnosed, yours to diagnose; a mechanism outside bg, line and font is named and left.

## Write-set
`src/diagrams/description/*`, `tests/unit/description/*`.

## Read-set
`plans/diagram-style-scope/measurements/reader-audit.md` (your engine's section), [../decisions.md](../decisions.md) D2, D3, `src/core/style-element-scope.ts`, `src/core/theme-element-resolve.ts`.

## Acceptance
- Given the rows above, then 0 diffs, each residue named with its mechanism.
- Given every corpus row of the engine, then conformant held and any byte mover passes the gate (D3b), named with its mechanism.

Observability: N/A. Rollback: Reversible.
