# T2c: class `<style>` colour values (M3)

**Probes:**
- `style-class-bg` (1 diff), `style-root-bg` (2: box and spot fill), `style-root-font` (2: spot glyph and name text):
  we emit raw `zzblue` where the jar draws `#FFF`;
- `style-arrow-line` (`arrow { LineColor zzblue }`, 3 diffs): we draw the default `#181818` where the jar draws `#FFF`.

**Upstream.** `ValueImpl.java:92-108`: `none` and `transparent` become transparent; anything else goes through
`set.getColorOrWhite(value1)`, so an unparseable value is white. `HColorSet.java:78-120#parseColor` resolves more than
`parseSimpleColor` does: `?a:b` schemes, `a-b`/`a|b`/`a\b`/`a/b` gradients, `automatic`, `background`.

**Port sites.**
- `src/core/style-cascade-class.ts#cascadeHex` (lines 91-105) returns `undefined` when `parseSimpleColor` fails. That
  is the undocumented "N36" guard (D4). It covers `style-arrow-line`.
- `style-class-bg`, `style-root-bg` and `style-root-font` do not go through `cascadeHex`, because they leak the raw
  value. Trace them from the theme fields the class renderer reads (`style-map-theme.ts:42-60`,
  `theme-graph-colors-a.ts`, `theme-graph-colors-b.ts`, `renderer-classifier-colors.ts`) to the resolver that passes
  the token through. `core/style/style-reads.ts#stylePaint`, which description uses and which is at 0, is the faithful
  reference.

**Measure before you change `cascadeHex`.** Its doc says the guard was added in N36 because a raw token in `fill` was
worse than the default, "for every conditional-color fixture sampled". So list the class and object corpus rows whose
cascade hits the guard today: instrument `cascadeHex` temporarily, run the class and object surveys, and record each
row's token and its jar colour. A token the jar resolves (a scheme or gradient) must keep the jar's colour; only a
token `getColorOrNull` rejects becomes white. Journal the list.

## Acceptance
- Given `<style> classDiagram { class { BackgroundColor zzblue } }`, when rendered, then the box fill is `#FFF`.
- Given `<style> root { BackgroundColor zzblue } </style>` on a class, then the box and spot fills are `#FFF`; given
  `root { FontColor zzblue }`, then the spot glyph and the name text are `#FFF`.
- Given `<style> arrow { LineColor zzblue }`, then the link path and arrowhead are `#FFF`.
- Given every class and object row the instrumented run listed, when the survey runs, then none loses conformance.
