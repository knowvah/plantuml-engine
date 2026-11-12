# T1c — The BPM grid core

**Read:** D1, D4, D8, D9, D11; `bpm/{Line,Col,Coord,Cell,Placeable,ConnectorPuzzle,AbstractConnectorPuzzle,
ConnectorPuzzleEmpty,Chain,ChainImpl,Navigator,Navigators,Grid,GridCleaner,CleanerEmptyLine,CleanerInterleavingLines,
CleanerMoveBlock}.java`.

**Write-set:** those 17 files as `src/diagrams/bpm/*.ts`; `tests/unit/bpm/**`.

**Do:**
1. Port the chain first (`ChainImpl` with its `positive`/`negative` lists, `null` padding in `ensure`, the version
   check that throws on concurrent modification), then `Navigators.iterate`/`reverse`.
2. `Grid#cells`: a `Map` keyed by a per-grid identity key for each `Line`/`Col` (D4), iterated in insertion order.
   `getById` returns `undefined` where Java returns `null`; `getCell(undefined…)` must throw as Java's NPE does (D5).
   Record the D1 greps (`FootPrint`, `cloneMe`) and the D4 measurement in the journal.
3. `Grid#toArray` constructs `GridArray` (T2a). Either land a minimal `GridArray` data holder here and finish its drawing
   in T2a, or leave `toArray` to T2a — journal which.
4. `addPuzzle` casts: throw a `ClassCastException`-equivalent `Error` when the cell holds a non-puzzle (`cov-goto-back`).
5. Tests build grids by hand (no `BpmDiagram` yet) and assert the puzzle directions and line/column counts the oracles
   show: e.g. `rikosu-08` is 2 lines × 6 columns after cleaning (two hlines at y=10/72, six vlines).

## Acceptance
- Given a chain with root `a`, when `navigator(a).insertAfter(b)` and `navigator(a).previous()` then `insertBefore`,
  then `toList()` and `compare` agree with `ChainImpl.java` (nulls skipped, negatives first).
- Given duplicate ids in two cells, when `getById` runs, then the earlier-inserted coord returns (D4).
- Given a route that crosses a `BpmElement` cell, when `addConnections` runs, then it throws.
- Given `CleanerMoveBlock` on a grid with an NS puzzle, then it returns `false` and the column chain gains a trailing
  `null` that `toList` hides.

Observability N/A. Rollback Reversible.
