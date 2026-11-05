# T2a — The header and the stereotyped fill read the merged style

**Rows:** `gubene-80-zume167` (`text[1]/@fill` `#00F` against `#F00`, `g[n][childCount]` one short: the jar draws the `#98FB98` header `path`). `tenalu-53-meri239` (`rect/@fill` `#F08080` against `#ADD8E6`).

**Read:** `EntityImageObject.java` `getStyle`, `getStyleHeader`, `drawU` (`headerBackcolor` and `backcolor.equals(headerBackcolor)`), the same in `EntityImageMap.java`, and `EntityImageJson.java:1-252` for whether it matches. On our side `object-kind-style.ts` (`resolveHeaderFontOverride`, `resolveObjectBodyFont`), `class-object-map-header.ts:70-95`, `renderer-classifier-colors.ts:257`, `renderer-classifier-box.ts:197,248`, and `currentStyleBuilderOf`.

**Do:** per D3. Style block and skinparam both flow into the jar's one builder, so read every property the Java reads from it: font, color and back color, on header and box, with the stereotype. Nested `object { header { } }` must stay as it is (`lisepi-64`).

**Red, authored grid under `tests/fixtures/odd-T2a/` with oracles:** top-level `header { }` with `object`, `map` and `json` leaves; `.Foo { header { } }`; `skinparam object { <<Foo>> { BackgroundColor } }` beside the same in `<style>`; a page `header` line with a top-level `header { }` style. Probe c of planning already shows the jar's `#ADD8E6` on the skinparam form. Render each and read before asserting: the grid may refute this file.

## Acceptance
- Given `gubene-80`, when compared, then conformant.
- Given each grid row, when compared with its oracle, then 0 diffs on the header and the fill.
- Given `tenalu-53`, then the `@fill` diff is gone.

Observability N/A. Rollback Reversible.
