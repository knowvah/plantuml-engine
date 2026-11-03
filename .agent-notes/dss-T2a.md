# dss-T2a observations

## Observation: a description leaf paints from its title style
- **Context**: Reading `EntityImageDescription` for T2a's signature table, which the T0c audit cites as `:111-112`.
- **Finding**: `forecolor` and `backcolor` read `styleTitle`, signature `...,<symbol>,title` (`EntityImageDescription.java:152-153,162-166`); only `fc` reads `style` (`:173`). Jar: bare `title { BackgroundColor; LineColor; FontColor }` fills `[C]` and `database E`, and paints the text of `[C]` but not of `component D as "dd d"`.
- **Impact**: A leaf's table row needs two signatures. `titleFont` is written where a `title` declaration parts it from `font`; no description reader takes it yet.
- **Confidence**: High.

## Observation: a conditional colour cannot go in a bucket
- **Context**: Seven conformant class rows went to 1 diff on the first cut (`root { FontColor #?black:white }`).
- **Finding**: `HColorScheme#getAppropriateColor(back)` answers per drawn element (`HColorScheme.java:52-63`), and readers print a bucket value raw, so `#?black:white` reached the SVG. `build-theme.ts#rootCascadeSkinparams` skips the same form for the same reason.
- **Impact**: The scope does not write one, so `note { FontColor #111 } root { FontColor #?black:white }` keeps a stale `#111` (jar `#000`). Fixing that needs a per-element resolve.
- **Confidence**: High.

## Observation: unit tests with exact-equal pins move on jar-ward fixes
- **Context**: `tests/unit/core/unwind2-s5-theme-order.test.ts` and `unwind2-s8-skins.test.ts` pin diff counts with `toEqual`/`toBe`.
- **Finding**: `merge-one.sh` runs the ratchets, `tests/architecture`, `tests/unit/oracle` and named files, not these two. They fail on an improvement as well as a regression.
- **Impact**: Run all of `tests/unit/core` before a merge, and tighten these pins when the removed diffs are all jar-ward.
- **Confidence**: High.
