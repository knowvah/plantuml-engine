# T1b — port UMotif and DotPath#addAfter (D4)

## Context

`GraphicsPath` draws its motif with `UMotif` (`GraphicsPath.java:80-81`). The port has no `UMotif`. `DotPath` leaves
`addAfter` unported (`src/core/klimt/shape/DotPath.ts:170-172`), and `UMotif#addHorizontal`/`addVertical` call it
(`UMotif.java:134-162`). `XPoint2D#move` is already ported (`src/core/klimt/geom/XPoint2D.ts:4-6`).

## Task

1. `src/core/klimt/shape/DotPath.ts`: port `addAfter(XCubicCurve2D)` and `addAfter(DotPath)` (`DotPath.java:328-338`) as one
   overloaded method. Both return a new `DotPath` and leave the receiver unchanged. Remove `addAfter` from the "Deferred"
   note and add it to "Ported". `addBefore` stays deferred.
2. `src/core/klimt/UMotif.ts` (new): port all of `klimt/UMotif.java`:
   - `UMotif(String)` (java:60-67) as the constructor, and `UMotif(int...)` (java:53-58) as `static fromInts`.
   - `getLength`, `getPoints` (read-only), `getRectangle`, the static `convertPoint` and `convertFromChar`
     (java:94-102), both `drawHorizontal`/`drawVertical` overloads, and the private `addHorizontal`/`addVertical`.
   - `convertFromChar` throws an `Error` whose `name` and message are `IllegalArgumentException` (D3). `TeaVM.a()`'s
     assert in `UMotif(int...)` is a no-op in the port. Say so in a comment.
   - The degenerate cubic is `XCubicCurve2D(x1, y1, x1, y1, x2, y2, x2, y2)`: a `Bezier` whose control points are its end
     points.

## Write-set

`src/core/klimt/UMotif.ts`, `src/core/klimt/shape/DotPath.ts`, `tests/unit/core/klimt/UMotif.test.ts` (new),
`tests/unit/core/klimt/shape/DotPath.test.ts` (create, or extend the existing DotPath test; find it with
`grep -rl "DotPath" tests/unit`).

## Read-set

`~/git/plantuml/.../klimt/UMotif.java` (whole), `klimt/shape/DotPath.java:320-340`, `src/core/klimt/shape/DotPath.ts:1-260`,
`src/core/klimt/geom/XPoint2D.ts`, `src/core/klimt/UGraphic.ts` (the `draw` signature).

## Acceptance (Given/When/Then)

- Given `new UMotif('ABCabc')`, then `getPoints()` is (-3,-3), (-5,-6), (-6,-9), (-4,-9), (-1,-9), (-4,-8), from
  `convertPoint`'s `v % 7 - 3`, `v / 7 - 3` (java:87-92) accumulated by `last.move` (java:62-65).
- Given that motif, when `drawHorizontal(20, 20, 1)` builds the path, then its beziers run from (20,20) through 17,17,
  15,14, 14,11, 16,11, 19,11 to 16,12. Each bezier's `ctrl1` is its start and its `ctrl2` is its end. These are the
  pixels of the jar's PNG (`measurements/decode-motif.py`).
- Given `nb = 2`, then the second repetition starts at the first one's end point (java:114-122). The same holds for
  `drawVertical`, with x and y swapped (java:124-132, :149-162).
- Given `convertFromChar` with `'x'`, `'0'` or `'-'`, then it throws `IllegalArgumentException`. With `'A'` it returns 0,
  `'Z'` 25, `'a'` 26 and `'w'` 48.
- Given `getRectangle(w, h)` on a motif of length L, then the path has `floor(w / L)` horizontal and `floor(h / L)` vertical
  repetitions (java:77-85). Given `addAfter` on either overload, then the receiver keeps its bezier count.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
Commit: `feat(klimt): port UMotif and DotPath#addAfter` (`Refs: #178`).
