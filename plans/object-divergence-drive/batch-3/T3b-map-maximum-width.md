# T3b — A map cell wraps at `MaximumWidth`

**Row:** `maxosa-84-juci042` (41 diffs). `map { MaximumWidth 200; MinimumWidth 100; ... }`, with a long `Placeholder Text => Lorem ipsum...`. Jar: box 297.887 × 108 and 53 children. Ours: 701.175 × 75 and 18 children. The `json` box on the same row already matches. Recorded since `planning/next-missions.md:936`.

**Read:** `BodierMap.java` `getBody` (`style.wrapWidth()`), `TextBlockMap.java` constructor and `getTextBlock` (`create0(..., wordWrap, CreoleMode.FULL, ...)`), `Style#wrapWidth`, `Fission#getSplitted`. On our side `class-map-sizing.ts:96-110` `measureMapCell`, and `class-json-sizing.ts:98-108,338-341` as the precedent, including `resolveElementMaximumWidth`.

**Do:** carry the wrap through `measureMapCell`, the cell's height, and the `Point` row's `horizontalAlignment` case. Both key and value wrap: `getTextBlock` serves both. Reuse the json wrap; do not write a second `Fission`. `Padding 100` and `Margin 50` on this row reach nothing the jar draws, so they must stay unread.

**Red:** `maxosa-84`'s cell lines; a key longer than the width; a linked row beside a wrapped row; a stereotyped `map <<X>>` whose style carries the width.

## Acceptance
- Given `maxosa-84`, when compared, then conformant.
- Given a map with no `MaximumWidth`, then its output is unchanged.

Observability N/A. Rollback Reversible.
