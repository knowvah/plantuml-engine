# T3a: anchors next to a `note right`

**Row:** `dociti-46-podu738` (22 diffs). Source: `!pragma teoz true`, `{start} Alice -> Bob: start`, `note right:
starting`, `{end} Bob -> Alice: finish`, `{start} <-> {end}: some time`. Every diff is the anchor line's `x`: ours
`59.419`, the jar `77.813` (18.394 apart), on the line, both arrowheads and the label.

## Java to read

- `sequencediagram/LinkAnchor.java`: how the anchor line's `x` is chosen, and from which tiles.
- `teoz/CommunicationTileNoteRight.java`: its `getMinX`/`getMaxX` and contact points, since the start message carries
  the note. The anchor may read the tile's extent including the note.
- Where the port draws the anchor (grep `LinkAnchor` in `src/diagrams/sequence/`).

## Steps

1. Write the mechanism in the journal with `file:line`, then red: assert the jar's anchor `x` (77.813) and label `x`
   (81.813).
2. Port. Then pin the row.
3. Push-forward: the same source with `note left`, and with the note on the end message, as authored rows, if the
   mechanism has a branch per side.

## Acceptance
- Given `dociti-46-podu738`, then it is at 0 diffs and pinned.
- Given the pinned rows with `{anchor}` links, then they are unchanged.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
