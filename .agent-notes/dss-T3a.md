## Observation: `hexagon #pink "label"` folds the colour into the display
- **Context**: dss T3a drew the hexagon polygon; `unknown/{nejuge-86-duve357,vasuka-21-tugo253,xucura-15-fuxu925}` rose or held (14->22, 18->26, 19->19).
- **Finding**: `parseNameSection` (`src/diagrams/description/parse-helpers.ts`) takes only a trailing colour. `CommandCreateElementFull.java:85` puts `color2()` between SYMBOL and the name, and `:208-211` says COLOR2 is "currently ignored", yet the jar fills the polygon `#FFC0CB`, so another path reads it (not found). Ours renders `#pink "Very..."` as display text (creole `#` list) and fills `#F1F1F1`.
- **Impact**: the polygon is now drawn (tag mismatch weight 14 gone) but its fill, points and text lines are charged; the count rose with a correct draw.
- **Confidence**: High (diffs listed from the corpus), Medium on the missing Java path.

## Observation: `LineColor none` + `BackgroundColor transparent` stroked paths
- **Context**: `component__probe-transparent`.
- **Finding**: `DriverPathSvg.java:63-68` takes the no-stroke branch when `HColor.equals`; `HColorSimple#equals` is the XColor, so `none`, `transparent` and `#00000000` are one colour. The port's `paintsEqual` compared strings with `===` (`driver-path-svg.ts`).
- **Impact**: fixed in `isTransparentSpelling`; any engine passing two spellings now matches the jar.
- **Confidence**: High.

## Observation: root conditional `FontColor #?black:white` leaves a stale flat note font
- **Context**: `component__probe-cond-root` (1 diff).
- **Finding**: `style-element-scope.ts#writableColor` drops a conditional value, so `roleColor` writes nothing and the earlier `note { FontColor #111111 }` stays in the flat bucket; jar merges the later root declaration (`#?black:white` resolves to `#000` on a light note).
- **Impact**: needs a way to write a conditional (or delete a stale flat value); T2a's file.
- **Confidence**: High.

## Observation: `skin rose` and `skinparam` after `<style>` residues are not colours
- **Context**: `component__probe-skin-rose` (13), `component__probe-skinparam-after-style` (35).
- **Finding**: skin-rose: `rose.skin:8` root `HorizontalAlignment left` (cluster title x) and `:11,60` `LineThickness 1.0/1.5` (stroke widths); fills already match. skinparam-after-style: zero colour diffs; `note { FontSize 12 }` is lost (ours 13) when `skinparam componentBackgroundColor` follows the `<style>` (`noteBackgroundColor` does not drop it).
- **Impact**: HorizontalAlignment, LineThickness, FontSize cascades, out of scope by D8.
- **Confidence**: High (diff lists), Medium on the FontSize mechanism (reproduced, origin not traced).

## Observation: the cluster title signature is missing from `style-element-scope.ts`
- **Context**: `component__probe-title`, `-sym-title` (1 each), `unknown/cexoke-68-kici335` (1).
- **Finding**: `ClusterHeader.java:157-165` signs the title `R,E,<diagram>,<uSymbol SNames>,composite,title` (or `package_,title`, or `composite,title`); no row carries it, so `title { FontColor }` never reaches a cluster title. Leaf titles are fixed through `titleFont`.
- **Impact**: orchestrator adds the row between merges; `buildHeader` in `renderer-cluster.ts` then reads it.
- **Confidence**: High.

## Observation: dark mode text colour
- **Context**: `component__probe-dark-element` (2).
- **Finding**: `skinparam mode dark` alone paints leaf and note text `#000` where the jar paints `#FFF` (`usymbol-resolve.ts#textFontColor` falls to `JAR_DEFAULT_TEXT_COLOR`); fills are `#F1F1F1` where the jar paints `#313139`. No `<style>` needed.
- **Impact**: dark mode's other diffs, out of scope.
- **Confidence**: High.

## Observation: two copies of `hexagonPolygonPoints`
- **Context**: `diagrams/description` may not import `diagrams/class` (`tests/architecture/layering.test.ts` fails on it).
- **Finding**: `src/core/svek/hexagon-polygon.ts` (new) carries the function; `diagrams/class/class-hexagon-leaf.ts` still has its own, T3b's directory.
- **Impact**: class should delegate to the core copy in a later pass.
- **Confidence**: High.
