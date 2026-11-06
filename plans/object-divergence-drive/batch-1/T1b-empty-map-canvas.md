# T1b — A map with no rows bounds the canvas by its rect

**Rows:** `gatefi-65-curu360` (`svg/@width` 171 against 170), `style-stereotype-on-arrow-7` (169 against 168).

**Read:** `EntityImageMap.java` `drawU`, `TextBlockMap.java` `drawU` (the loop draws the `ULine.hline(trueWidth)`), `LimitFinder.java:179-188`. The jar's rect bounds at `x + w - 1`; a row's `hline` bounds at `x + w`. A map with rows therefore reaches `w` and an empty one reaches `w - 1`.

Our side was not opened: `class-map-sizing.ts`, `class-classifier-ink-reservation.ts` and the `LimitFinder` use it feeds. Find where a map's right ink is set, and which function feeds the canvas. Check height too: `gatefi`'s height already matches, so state why before changing anything vertical.

**Do:** the empty map contributes only its rect. Check `json` with an empty body and `object` with hidden fields against an oracle, because `class-object-map-header.ts` shares the formula.

**Red:** assert the two rows' widths; author a map with one row beside one with none, and a sole empty map (the degenerated path, `GraphvizImageBuilder.java:214`).

## Acceptance
- Given both rows, when compared, then conformant.
- Given a map with one row, when rendered, then the width still equals the oracle.

Observability N/A. Rollback Reversible.
