# T1a — The reachable `golem` classes

**Read:** D1, D2, D4, D8; `golem/{TileGeometry,TileArea,Tile,Position,Path,MinMaxGolem,TilesField}.java` in full;
`FlowDiagram.java` for which members it calls.

**Write-set:** `src/core/golem/{TileGeometry,TileArea,Tile,Position,Path,MinMaxGolem,TilesField}.ts`,
`tests/unit/golem/**`.

**Do:**
1. Record D1's greps in the journal:
   - `grep -rn "golem\." src/main/java/net --include=*.java` (flowdiagram and Visio only);
   - the callers of `Tile#drawU` and `TilesField#drawU` (none from flow).
2. `TileGeometry`: the five values, `opposite` (it throws on `CENTER`), and `fromString`, which takes the first character
   upper-cased and throws `IllegalArgumentException` on anything else.
3. `Position`: immutable, with `equals` by value, `move` (it throws on `null`/`CENTER`), and `getCenterX`/`getCenterY`,
   which keep the `IllegalStateException` parity guard.
4. `Tile` takes its `num`, and each of the five `TileArea`s is built once in the constructor. `Path` is `build`,
   `getStart` and `getDest`. `MinMaxGolem` is `manage(x, y)`, `manage(Position)`, `getMinX/Y` and `getWidth/Height`.
5. `TilesField`: `positions` is a `Map<Tile, Position>` in insertion order (D4), and `paths` is an array.
   - Port `createTile`, `addPath`, `buildPath`, `isAdjoining`, `getTileAt`, `getFreePosition`, `moveAllToEast`,
     `isOccuped`, `getPosition` (throws on a miss, as `Objects.requireNonNull` does) and `getPaths`.
   - `moveAllToEast` must build `toMove` first, then `set(getTileAt(p), p.move(EAST, 2))` per entry. The re-lookup is
     the D4 quirk: keep it, and comment it with the measurement.
   - `isAdjoining`'s `TeaVM.a()` assert is a no-op in the jar: leave it out, with a comment.

## Acceptance
- Given `10 "A"`, `e 20 "B"`, `w 30 "C"` (`cov-shift-east`) replayed through `TilesField`, then the positions equal one
  of the two jar layouts. Read the boxes' x out of `/tmp/flp-plan/variants/run*/cov-shift-east.svg`. A unit test pins
  which one, and its comment names D4.
- Given `bemixo-79-xulu250`'s nine moves, then every tile's position yields the oracle's box centres.
- Given a non-adjoining, non-WEST→EAST pair, then `buildPath` throws `IllegalArgumentException`, and given the same
  position and geometry, `isAdjoining` throws too.
- Given `fromString('x')` or `opposite()` on `CENTER`, then each throws the Java exception's name in its message.

Observability N/A. Rollback Reversible.
