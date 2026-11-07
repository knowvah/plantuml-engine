# T4b — Group, card, partition, rectangle styles; notes on groups

**State at planning:** 10 corpus rows, Σ 1,003.

| Row | Diffs | Source | First diff (ours / jar) |
|---|---|---|---|
| `gateti-51-lasi768`, `vupefo-81-jane512` | 2 each | `.action { RoundCorner 25 }` and `rectangle { RoundCorner 0 }`, both orders, on `rectangle X <<action>> { }` | `rect[1]` rx missing / 12.5 |
| `tibedu-29-ticu124` | 2 | `skinparam rectangle { RoundCorner<<action>> 25 }` | rx 5 / 12.5 |
| `nokixe-72-poki730` | 44 | `group Group <<test>>` with a `.test` style, `floating note` after `end group` | height 236 / 233 |
| `xicopo-62`, `botani-09`, `mubojo-03`, `dezobu-34` | 60, 117, 160, 172 | one style on `rectangle`, `partition`, `card` or `.test`; a `card`, `group` and `partition` each followed by a floating note | height 708 / 705, `rect` heights 86 / 83 |
| `bokida-76`, `jigalo-17` | 222 each | a note inside a partition, before a `switch` | height 1448 / 1476 |

The four 708-tall rows share one source with a different style target: read them together. Each group draws 3 px
taller than the jar.

**Read (leads):** `FtileGroup.java:94-117` (constructor: `addHorizontalMargin(inner, 10)`, the style and
`USymbol`), `InstructionGroup.java`, `FtileFactoryDelegatorAssembly`/`FtileNoteAlone.java` for a floating note
after a group, and `USymbol*` corner reads (`RoundCorner` from the merged style versus `skinparam
RoundCorner<<st>>`). #138 owns partition `LineThickness` and the `Partition*`/`rectangle*` last-wins order: leave
those two alone and note any row that needs them.

**Do:** red with `gateti-51` (rx), then the 3 px group height on `xicopo-62`.

**Measure:** the 10 rows; activity survey.

## Acceptance
- Given `gateti-51`, `vupefo-81`, `tibedu-29`, then each is conformant and pinned.
- Given the other 7 rows, then each is conformant and pinned, or journaled with its remaining mechanism and owner
  (a #138 mechanism is named as #138's).
- Given the activity survey, then 0 lost.

Observability N/A. Rollback Reversible.
