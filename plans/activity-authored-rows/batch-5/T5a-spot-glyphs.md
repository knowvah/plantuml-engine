# T5a — `(X)` outlines for every letter and digit (item 13)

**State at planning:** 32 authored rows `activity__spot-<c>` (C, D, F, H-Z, 0-9), 2 diffs each: ours draws two
`<text>` where the jar draws two `<path>` (`:a;` / `(c)` / `detach` / `(c)` / `:b;`). `DriverCenteredCharacterSvg.java:72-81`
draws the platform font's `TextLayout#getOutline` centred by `UnusedSpace`; its `<text>` branch (`:64-69`) is
`SVG_DETERMINISTIC` only, a format the oracle never selects. `activity-spot-glyph-data.ts#CAPTURED_SPOT_LETTERS`
holds A, B, E, G; `spotGlyphPath` returns undefined for the rest and `renderSpot` falls back to `<text>`.

**Read:** the module doc of `activity-spot-glyph-data.ts` (the capture method, reference centre
`SPOT_REFERENCE_CX`/`CY`, and how a captured `d` is translated) and `class-badge-glyph-data.ts` (the worked
example); `src/core/spot-glyph-data.ts` for the size-17 table it does not share. The connector's font is the bare
`root` 14 SansSerif (that module's header), so the size-17 badge table does not apply.

**Do:** D6. Scrape each glyph's `d` from its authored oracle (`tests/fixtures/diagram-style-scope/activity__spot-<c>.svg`),
normalised to the reference centre the existing four use, one entry per character with its source fixture cited.
Red: a test that `spotGlyphPath` returns the oracle's `d` for one new letter, translated to that fixture's centre.
Lowercase is not authored: if `FtileCircleSpot` upper-cases (`activity-spot-glyph.ts:39` does), journal the Java
line; if it does not, add lowercase rows the T0 way.

**Measure:** `rows.mts ... activity__spot`; the activity survey (any corpus `(X)` with a new letter moves).

## Acceptance
- Given the 32 `spot-*` rows, then each is 0.
- Given each new table entry, then it names the fixture it came from.
- Given the activity survey, then 0 lost.

Observability N/A. Rollback Reversible.
