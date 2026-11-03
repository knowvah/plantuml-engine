# dss-TE2 observations

## Observation: `gynbcc` is a dropped def, not a stray id
- **Context**: `url(#gynbcc)` with no `<defs>` on activity circles and on class spots.
- **Finding**: `gynbcc` is `'g' + hashString('#00AA00|#0000AA|-')`, `paint.ts#paintToSvg`'s content id. Three sites took `.fill`/`.value` and dropped `.def`: `activity-renderer-terminals.ts#circleColors` (`resolvePaint(...).value`), `class-badge.ts#resolveBadgeFill/Border/GlyphColor` (`paintToSvg(...).fill`). Those now return the `Paint`, so `ellipse()` writes the def. Ruled out: `svg-defs-seeded.ts` (it only renames defs it finds).
- **Impact**: any new reader must pass the `Paint`, never `resolvePaint(p).value`, to a shape.
- **Confidence**: High (hash computed, rows at 0).

## Observation: `resolveColor` flattened a gradient to its SECOND colour, and left three of four separators raw
- **Context**: `theme.colors.border`/`text` read `#00A` where the jar draws `#0A0` (state boxes, object text).
- **Finding**: `skinparam-key-normalize.ts#resolveColor` used a `-`-only regex keeping the end colour. Upstream a gradient's flat value is `color1`: `HColor#toSvg` is `toColor(mapper).toSvg()` (`HColor.java:74-79`), `HColorGradient#toColor` is `color1.toColor` (`HColorGradient.java:103-105`). `resolveColorToSvgHex` returned the raw token, which printed `fill="#0A0-#00A"` (activity root, `activity-text-style.ts#activityFontColor`). Both now follow the Java; `HColorSet.ts#splitGradientToken` is the one scan, `paint.ts#parseColor` delegates to it.
- **Impact**: a flat `string` Theme field holds `color1`; a reader that can draw the gradient takes `elements[bucket]`.
- **Confidence**: High.

## Observation: the driver rule has a seam for lines and for fonts, none for the rest
- **Context**: fix at the origin rather than a site at a time.
- **Finding**: `svg-shapes.ts#line` now does `noGradient` itself (`DriverLineSvg.java:76-82`), so a caller hands one `Paint` to its rect and its line. `FontColor` flattens where it is written: `style-element-scope.ts#roleColor`/`titleFontOf`, `cascadeHex`/`cascadeFontColorHex`, `style-map-element.ts`, the skinparam handlers. Every `font` reader draws text or a centred glyph (`DriverTextSvg.java:178`, `DriverCenteredCharacterSvg.java:79`), both `toSvg`.
- **Impact**: `font` in a bucket is never a gradient now, so `typeof font === 'string'` readers are right.
- **Confidence**: High.

## Observation: two gradients are never equal, which selects a different draw path
- **Context**: state box `childCount` 3 vs 6, canvas 196 vs 197; object `childCount` 3 vs 4.
- **Finding**: `EntityImageState.java:141` `northBackcolor.equals(southBackcolor)` and `EntityImageObject.java:199` `backcolor.equals(headerBackcolor)`. `HColorSimple.java:85` is the only `equals` in the colour classes, and `ValueImpl#asColor` (`:92-103`) parses a new `HColorGradient` per read, so identical stops still take `RoundedContainer` / the header split. `RoundedNorth.java:84` strokes the zone with its own colour, so the gradient also appears as a stroke. The 197: `RoundedSouth` draws a `UPath`, and `LimitFinder#drawUPath` has no `-1` inset where `drawRectangle` has (`LimitFinder.java:164-167,184-188`); `leafSouthZoneDrawn` already modelled it and needed only the zones to report a gradient.
- **Impact**: an inline back colour keeps one object (`EntityImageObject.java:174-177`), so that case does not split.
- **Confidence**: High (rows at 0).

## Observation: the jar crashes on a gradient `LineColor` reaching a signature whose skin value has a dark partner
- **Context**: `partition` under `root { LineColor #0A0-#00A }`, probe `aca-LineColor-root`.
- **Finding**: `UnsupportedOperationException` at `HColor.withDark(HColor.java:126)` from `ValueImpl.asColor(ValueImpl.java:106)` from `FtileGroup.<init>(FtileGroup.java:102)`: `asColor` calls `withDark` when `value2` is set, and `HColorGradient` does not implement it. Ours draws. No row authored (an error page is not a colour oracle).
- **Impact**: the error-page ruling (`docs/svg-conformance.md`) applies, signed per row, and needs the latest release jar.
- **Confidence**: High for the stack; the dark partner on `composite`'s `LineColor` is Medium, the stack names `value2` but the skin line was not traced.

## Observation: non-gradient gaps the probe surfaced (solid twins fail too)
- **Context**: each residual re-rendered with `#0A0` in place of the gradient.
- **Finding**: `skinparam defaultFontColor #0A0` leaves a state and a description box text `#000`, jar `#0A0` (`st-font`, `de-font`). `(X)` draws `<text>` where the jar draws a glyph `<path>` for that letter (`ac2`). `-> x;` followed by a note draws 19 px shorter than the jar (`i2`, the family TE1 noted).
- **Impact**: open, not in this task.
- **Confidence**: High that a solid twin fails; causes not diagnosed.

## Observation: `skinparam defaultFontColor` missed every text reader with no flat tier for it
- **Context**: state and description box and note text `#000` where the jar draws the colour; the `<style>` twin matched.
- **Finding**: `FromSkinparamToStyle.java:157` converts it to `root { FontColor }`, and each element reads its own merged style (`EntityImageStateCommon.java:75-76`, `EntityImageDescription.java:173`, `EntityImageNote.java:111`). Ours writes `colors.text` (`skinparam-key-handlers-table-a.ts`), which those readers never consult, and `document-back-color.ts#documentStyleBuilder` closes D3's gate for empty `styles` and no `skin`, so no bucket is written. `defaultFontStyleBuilder` opens the signature read for this one skinparam, font role only. Ruled out: class (its cascades take the root run, `build-theme.ts#withRootStyleRun`), arrow label (`arrowFontColorValue`), sequence (reads the builder directly).
- **Impact**: the block form `skinparam { default { font { color X } } }` lands on the same key, so a literal grep for `defaultFontColor` misses it (`unknown/sogeme-65-kate687`).
- **Confidence**: High.

## Observation: `skinparam mode dark` with no style leaves state and description boxes light
- **Context**: solid twin of the dark probe, `#F1F1F1` and `#000` where the jar draws `#313139` and `#FFF`; note `#FEFFDD` where it draws `#714137`.
- **Finding**: present at f2e13a63e, not caused here. Probably the same D3 gate, not diagnosed.
- **Impact**: open.
- **Confidence**: High that it fails; cause Low.

## Observation: `(X)` draws `<text>` because only four letters have a captured outline
- **Context**: `|S2|` ... `(X)`, jar a `<path>`, ours `<text>`.
- **Finding**: `activity-spot-glyph-data.ts#CAPTURED_SPOT_LETTERS` holds A, B, E, G; `spotGlyphPath` returns undefined for the rest and `renderSpot` takes the `<text>` fallback. Upstream `DriverCenteredCharacterSvg.java:72-81` draws the AWT outline; the `<text>` branch at `:64-69` is `SVG_DETERMINISTIC` only. Both print the same `textColor.toSvg`, so it is not a colour read.
- **Impact**: glyph data, for the platform-outline oracle seam.
- **Confidence**: High.
