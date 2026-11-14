## Observation: anchor x reads the note wrapper's extent
- **Context**: dociti-46-podu738, `{start}` message carrying a `note right`.
- **Finding**: `LinkAnchor#drawAnchor` takes `getMiddleX` (`CommonTile.java:62-66`) of the tile `matchAnchor` finds; for a message with a note that is the `CommunicationTileNoteRight/Left` wrapper (max = note pos + untruncated preferred width, `:246-250`; left: min = note pos, `:219-225`). The drawn note box is `trunc`ated; the tile extent is not (note x 86.613 + 73.575 = 160.188).
- **Impact**: `layoutNotesOnMessage` already folds the wrapper chain's extent; it now records it in `ctx.wrapperExtents` for the anchor layout. Exo messages with notes are not recorded (chain extent there is 0,0), so an anchor on an exo message with a note still reads the bare exo tile.
- **Confidence**: High (row at 0, two authored jar oracles at 0)
