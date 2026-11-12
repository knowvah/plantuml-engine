# T2a — Drawing: `Arrow`, `MagicBox`, `GitCurve`

**Read:** D3, D5; `gitlog/{MagicBox,GitCurve}.java`; `jsondiagram/{Arrow,Mirror}.java`; `src/diagrams/json/Mirror.ts`;
`src/diagrams/json/JsonCurve.ts:55-113` (the same arithmetic as strings, to cross-check, not to import).

**Write-set:** `src/diagrams/json/Arrow.ts`, `src/diagrams/git/{MagicBox,GitCurve}.ts`, `tests/unit/json/**`,
`tests/unit/git/**`.

**Do:**
1. `Arrow.ts`: port `Arrow.java` (`getPoint` uses sin on x and cos on y, and `atan2(dx, dy)`; `drawArrow` draws a
   4-point `UPath` filled by the caller's `bg`). It is a new file, and `JsonCurve.ts` is untouched (D3).
2. `MagicBox`:
   - The constructor reads `FontColor` from `{root, element, gitDiagram}` (`MagicBox.java:66-68`).
   - `getSmallBlock` uses `UFontFactory.monospace(15)` bold, centred, through `Display.create(texts).create(...)`, so
     creole is parsed.
   - `getCommentBlock` uses `sansSerif(13)` only when the comment is non-null and the node is top, and is empty
     (0×0) otherwise.
   - `getBigDim` is `dimComment.mergeTB(dimSmall).delta(8, 2)`.
   - `drawBorder`: the rect `sizeInDot.w × (sizeInDot.h − moveY)`, `rounded(8)`, stroke 1.5, at `dy(moveY)`; then the
     comment at the origin; then the small block centred in the rect. Draw in the Java's order.
3. `GitCurve`:
   - Cubic `UPath` from `points[0]`, stepping by 3, every point through `xMirror.invGit`.
   - `UStroke(2, 2, 1)`: dash 2, space 2, thickness 1 (`GitCurve.java:88`).
   - When `ep` is set, `new Arrow(last, ep)` filled with `color.bg()`.
   - Keep the `sp`/`ep` "(0,0) means absent" rule (`:69-77`), and the `IllegalStateException` when the edge has other
     than one bezier (D5).
4. Tests:
   - `Arrow` points for `juzane-95`'s first edge: feed the oracle's last control point and arrow tip back through
     `invGit`, and assert the drawn polygon `M66.549,75.575 L69.5,77.788 L72.451,75.575 L69.5,82.952` to 3 dp.
   - `getBigDim` of `juzane-95`'s first node (comment `origin/cds/issue700`, name `a0f65180`) is 119.3125×30 under
     `DeterministicMeasurer`, as planning measured. Plus its `drawBorder` element order and text attributes against
     the oracle, given the jar's 119×30 box.
   - A handwritten `UGraphic` path for one box.

## Acceptance
- Given the jar's engine box for a node, when `drawBorder` draws, then the rect, comment `<text>` and name `<text>`
  match the oracle's attributes (x, y, width, height, rx, stroke, font, `textLength`) exactly.
- Given an edge with `ep` absent, then no arrow is drawn; given one, then the arrow polygon matches `Arrow.java`
  arithmetic to 3 dp.
- Given `JsonCurve.ts`, then it is byte-unchanged and every json ratchet passes.

Observability N/A. Rollback Reversible.
