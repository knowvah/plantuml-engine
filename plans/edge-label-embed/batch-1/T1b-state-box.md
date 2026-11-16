# T1b — state: the label's reserved DOT box

## Context

`measureStateLabelBox` (`state-label-style.ts:108-138`) reserves the DOT label table from the flat creole block
(`stateCreoleBlock`). For xetase the jar's `svek-1.dot` reserves `WIDTH="544" HEIGHT="239"`: the 532x227 Welcome-page
embed plus `2·marginLabel` (6 on a self-loop, `SvekEdge.java:372-373`). Ours reserves the text `{{`.
`state-dot-graph.ts:190-191` and `state-composite-edge-label.ts:58-59` both call `measureStateLabelBox`.

## Task

When `splitEdgeLabelEmbeds` (T1a) finds an embed in the label lines, take `measuredWidth`/`measuredHeight` from the
stacked block:
- text runs keep `stateCreoleBlock`'s measure;
- embeds use the atom's dimension;
- the stacking is T1a's `SheetBlock1` arithmetic.

The visibility icon fold and margins stay as they are. Carry what T1c needs on `TransitionGeo['label']` (its type in
`state-geo-types.ts`): one item per stripe, either text lines or `{ kind: 'image', y, width, height, block }`, where
`block` is the atom to draw.

**Read first.** Does `labelDisplayBlock`'s wrap (`maxMessageSize`) apply to the embed stripe? Settle it in
`SheetBlock1`/`Fission` before deciding.

Embed-free labels must produce identical boxes: `state-dot-parity` and the state ratchet stay green.

## Write-set
`src/diagrams/state/state-label-style.ts`, `state-dot-graph.ts`, `state-composite-edge-label.ts`, `state-geo-types.ts`,
`tests/unit/state/ele-label-box.test.ts`.

## Read-set
`src/diagrams/state/state-label-style.ts` (all), `state-dot-graph.ts:170-200`, `state-composite-edge-label.ts:40-70`,
`state-transition-label.ts:80-110`, `tests/oracle/state-dot-parity.test.ts:30-60`,
`test-results/dot-cache/state/xetase-70-zaza808/{in.puml,svek-1.dot}`, `plans/edge-label-embed/measurements/probes/state*.puml`.

## Acceptance
- Given xetase, when the state DOT is emitted, then its label table is `WIDTH="544" HEIGHT="239"`, and
  `state-dot-parity` reports `xetase-70-zaza808` `dotEqual` (re-run `npm run svg:survey -- state --out …`).
- Given the `state` probe (well-formed, non-self-loop), then the reserved box equals the jar's DOT box (render the
  probe with `scripts/oracle-render.sh` into `/tmp` to read its `svek-1.dot`).
- Given every pinned state row, then the state ratchet and `state-dot-parity` stay green.

Observability is N/A. Rollback is Reversible.
