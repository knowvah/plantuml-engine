# T2b — Composite tiles

**Read:** `ebnf/ETileConcatenation.java` (`marginx = 20`), `ETileAlternation.java` (`marginx = 12`, the two drawing
paths at :102-153), `ETileOptional2.java` (`deltax = 24`, `deltay = 20`, `corner = 12`, the `Zigzag`),
`ETileOneOrMore.java` (`deltax = 15`, `deltay = 12`, the `Brace` and loop label), `ETileZeroOrMore.java`,
`ETileNot.java` (`MARGIN_X1 = 3`, `MARGIN_X2 = 8`), `ETileWithCircles.java` (`SIZE = 8`, `deltax = 30`); D10, D12.

**Do:**

1. Port each class whole, keeping the Java's local names (`a b c … p q r` in `ETileAlternation#drawU`,
   `height42`, `linePos`). Split `ETileAlternation#drawU` into helpers named after its two branches if the hooks
   demand it (D12).
2. `ETileConcatenation#push` prepends and `#pushLast` appends, as `EbnfEngine#concatenation` relies on; same for
   `ETileAlternation#push` (read which end it adds to).
3. `ETileWithCircles`: strokes 1.5 for the body, 2 for the start circle, 1 and `CopyForegroundColorToBackgroundColor`
   for the end circle, then the two directed lead-in lines.

**Tests:** build `s, {"0", "1"}` by hand (`ETileConcatenation` of a box and an `ETileZeroOrMore` over an
`ETileAlternation`) and draw it through `UGraphicSvg`: every `path`, `line`, `ellipse` and `rect` matches
`butiti-18-tava797`'s oracle body (comments aside). `3 * "x"` gives the `3×` label at `bigger(-2)` and the brace
(`cov-repetition-symbol`); `"a" - "b"` gives `ETileNot`'s geometry (`cov-not`); `[ "b" ]` gives `ETileOptional2`'s
zigzag (`cov-operators-all`).

## Acceptance
- Given the hand-built `butiti-18-tava797` tree, then its drawn primitives equal the oracle's, coordinate for
  coordinate.
- Given `ETileWithCircles` around an `ETileEmpty`, then its width is 60 and the two circles match `cov-empty-rule`.
- Given `npm test`, then it passes with every new file at 90/90/90.

Observability N/A. Rollback Reversible.
