# T3a — Activity and sequence: the root background and the participant head through the mapper

**State at planning:** activity maps its fragment (`renderer.ts:415`, add4-T3d) but not `svg/@background`.
`gigefo-15-cami497` (`skinparam reverseColor RBG`) is `#FFFFFF` against `#000000`, and `activity__mode-monorev` and
`-revrbg` show the same diff. `activity__mode-revdark` is `#FFFFFF` against `#010101`, with one more child in the
jar's `g` (`childCount` 12 against 13). Sequence shows the same background diff and maps no participant-head rect:
`#FFF` against `#000` under `monorev`, `#FEFFFF` against `#000` under `revdark`.

**Read:** `TitledDiagram.java:292-313`; `ColorMapper.java` (each arm); `SvgGraphics.java:175-192`: the background
is `backcolor.toSvg(option.getColorMapper())`, and a mapped colour other than `#00000000`, `#000000` or `#FFFFFF`
also paints a background rect (`paintBackcolor`). That is likely the extra child under `revdark` (`#010101`). The
root `style="background:…"` is written at `:800-806`;
`TextBlockExporter.java:395-425`. Ours: `toSvgPaint` in `ColorMapper.ts`, and how board, chart, gantt and salt pass
`calculateBackColor` through it (`src/diagrams/board/index.ts:122,184`); `fragment-color-mapper.ts` (`colorMapperOf`,
`COLOR_PROPERTY_RE`, which colours it rewrites and which it misses); the activity and sequence renderers' return
points.

**Do:** per D6. Red: `gigefo-15` through the activity harness gives `background="#000000"`, and
`sequence__mode-monorev` gives the jar's background and head fill. Map the root background with the same mapper as the
fragment. Then find why the sequence head fill escapes. The colour may be written in a form `COLOR_PROPERTY_RE` does
not match, or drawn outside the mapped fragment. Fix that at the origin. Confirm the extra child under `reversecolor dark`
is `paintBackcolor`'s rect, and find where our exporter mirrors that branch for an unmapped non-white background.

**Measure:** `rows.mts` prefixes `activity__mode-`, `sequence__mode-`; surveys of activity and sequence, and every
monochrome or reverse-colour corpus row (29 conformant at planning) must stay conformant.

## Acceptance
- Given `gigefo-15-cami497`, then it is conformant and pinned in the activity golden ratchet.
- Given the six activity and sequence `mode-monorev`, `-revdark` and `-revrbg` rows, then each is conformant, or
  journaled with its remaining mechanism.
- Given the activity and sequence surveys, then 0 lost.

Observability N/A. Rollback Reversible.
