# T2a — the style seam, and corners

Commit: `fix(description): read corners from the merged entity style`.

## Context
`renderer-entity.ts` hard-codes `diagonalCorner: 0` and calls `resolveElementRoundCorner(theme, node.symbol)` with no labels. The jar: `styleTitle.value(PName.RoundCorner)`, `.value(PName.DiagonalCorner)` (`EntityImageDescription.java:168-169`), reaching `Fashion#withCorner` (`:180`) and `USymbolRectangle#drawRect` (`USymbolRectangle.java:65-70`): `diagonalCorner > 0 ? rect.diagonalCorner(d) : rect.rounded(r)`. That is `rect` against `path` on 17 rows. `Cluster.java:321,326` and `EntityImageEmptyPackage.java:109-110` read the same two values; `USymbolHexagon`, `USymbolProcess`, `USymbolAction` also take them.

Build D2: `descriptionEntityStyle(builder, styleName, symbol, labels, colors)` in `src/diagrams/description/description-entity-style.ts`, returning the merged `Style`s the Java names. `currentStyleBuilderOf` (`core/document-back-color.ts:100-105`) builds the builder; a malformed `<style>` keeps the guard `documentStyleBuilder` has (`StyleParsingException`, #120 owns the jar's error page). Carry it on `LayoutServices` (`core/elk/elk-backend.ts:32`). The ratchet and survey render through `renderSync`, so both get it.

Keep the sizer and renderer on one result. Store what the renderer needs on the node geo. Do not move a flat read that no row needs moved.

`URectangle#diagonalCorner` is ported (`src/core/klimt/shape/URectangle.ts:103`), so this is wiring, not a new shape.

## Rows
`bavezi-52`, `gipeda-98`, `mafaki-14`, `potani-24`, `zucave-84`, `gijegu-60`, `sacupe-57`, `zonamu-61`, `somule-10`, `tufixe-50`, `dunila-61`, `gitaxu-39`, `tuliba-37`, `manama-22`, `midevi-31`, `mocucu-79`, `nopelu-51`, `sapeka-40`. `toxeto-79`, `xapuji-91`, `zetedu-83` and `fupumu-08` also say `DiagonalCorner`. `sacupe`, `zonamu` and `fupumu` remainders are #122 item 22 (D6).

## Acceptance
- Given `bavezi-52`, when rendered, then `rect[1]` is the jar's `path` with `DiagonalCorner 10`'s points.
- Given `manama-22`, then the `<<Foo>>` rectangle's `rx` is `22.5` and the `<<Concept>>` one's is `12.5`.
- Given a source with no style and no skinparam, then its bytes do not move: `verdict-diff` 0 lost, and no ratchet pin rises.
- Given `npm test` wall clock before and after, then the number is in the journal (D2).

Observability: N/A — no new observable operations. Rollback: Reversible.
