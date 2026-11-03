# dss T3b — class and object readers

## Observation: the flat class cascades are order-blind, the `class` / `class.header` buckets are not
- **Context**: `class__x-theme-gradient` (`!theme cerulean`), probes `ord-*`.
- **Finding**: `classCascade*` (one StyleMap, skinparam apart) loses declaration order. `skinparam classBorderColor X` after `<style> root { LineColor Y }` is X in the jar, Y in the flat cascade. `elements['class']` and `elements['class.header']` (T2a) hold the merged value. The readers now consult them above the cascade (`renderer-classifier-scoped-colors.ts`).
- **Impact**: any theme mixing `skinparam class { ... }` with a `<style> root { ... }` (most `!theme` files) drew the wrong class colour.
- **Confidence**: High (rows `class__x-order-*`).

## Observation: class hard-coded `CucaDiagram`'s margins; ported (second commit)
- **Context**: `class__d3-theme-*` height 68 vs 84; the first hand-back left two ratchet rises (90 -> 92).
- **Finding**: `TextBlockExporter.Builder#calculateMargin` (`:510-516`) takes the merged `{root, document}` style's `Margin` when it `hasValue`, else `getDefaultMargins()` (`CucaDiagram.java:741-745` `(0, 5, 5, 0)`; `TitledDiagram.java:275` `same(10)` is overridden). The exporter translates by `(left, top)` (`:173`) and sizes with all four (`:199-203`). Class now routes through `theme.diagramMargin` at every site: `layout-ink-extent.ts` (dims, svek shift), `layout.ts` (empty), `class-geo-builders*.ts` (degenerate leaf shifted, dims), `class-elk-layout.ts` + `renderer-elk.ts` (translate and minDim), `core/TextBlockExporter.ts#applyCucaDocumentMargin` (optional margin), `core/assemble-svg.ts` border rect (`documentMarginOf(fragment)`), `RenderFragment.documentMargin` for chrome. A mainframe keeps today's placement (not applied).
- **Impact**: d3-theme rows 0; two corpus fixtures with `!theme` + `root { Margin }` moved toward the jar.
- **Confidence**: High (10 margin rows, ELK probe 0 diffs).

## Observation: `Member.java:133` calls `isVisibilityCharacter`, which is false for two characters or fewer
- **Context**: `class__kinds-none` baseline `text[3]` x/textLength.
- **Finding**: `+x` is the text "+x" with no icon. `class-member-parser.ts#stripVisibility` had its own glyph test without the length gate. Ported predicate `core/skin/VisibilityModifier.ts#isVisibilityCharacter` now used.
- **Impact**: any one-character member behind a visibility char. No corpus fixture moved.
- **Confidence**: High (jar probes mem-a..g).

## Observation: a stereotype label is drawn from the legacy skinparam chain, never a style
- **Context**: `class__kinds-font-*` site 6.
- **Finding**: `EntityImageClassHeader.java:131`, `EntityImageObject.java:105-106`: `FontConfiguration.create(skinParam, FontParam.<KIND>_STEREOTYPE, stereotype)` -> `SkinParam#getFontHtmlColor` (`<kind>stereotypefontcolor`, `defaultfontcolor`, `black`). `root { FontColor }` in a `<style>` leaves the label black; `skinparam defaultFontColor` tints it. `theme.colors.text` cannot tell the two apart (a root style writes it too), so `src/core/legacy-stereotype-font.ts` reads `preprocessed.skinparam` into two buckets, `class.stereotype` / `object.stereotype`. `skinparam classStereotypeFontColor` was unsupported before.
- **Impact**: build-theme stage 3e, class documents only.
- **Confidence**: High.

## Observation: object / class leakage through `classBackground`
- **Context**: `object__cascade-*-diag`, probes `ob-*`.
- **Finding**: `classCascade*` is built from `CLASS_SNAMES` (`classdiagram`, `class`); an object's signature holds neither. Also `graph.classBackground` is written by `skinparam classBackgroundColor` and by a `class { BackgroundColor }` style, both class-signed; objects drew them (jar `#F1F1F1`). Fixed in `objectDefaultBackground` (explicit-marker or `elements.class.background` => skin default).
- **Confidence**: High.

## Observation: `SPOT_SNAMES` named `spotclass`
- **Context**: `class__probe-spot-own`.
- **Finding**: `style-cascade-class-snames.ts` `SPOT_SNAMES = [root, element, spot, spotclass]` fed `spotCascade*` for every kind, so `spotClass { LineColor }` tinted an interface's spot. The kind's own value is in `elements['spot<kind>']`.
- **Confidence**: High.

## Observation: `package { LineColor }` reached a `folder` frame; fixed
- **Finding**: `Cluster.java:290-293,387`: only `USymbols.PACKAGE` is signed `package_`. `style-element-scope.ts#heldByFlat` now also counts the flat `package` bucket as held for every non-package `group.<symbol>` row (`flatPeers`), so the merged value is written over the flat one the reader falls through to.
- **Confidence**: High (`class__x-pkg-line-on-folder`).

## Observation: dark mode plus explicit `classBackgroundColor` plus object
- **Finding**: jar keeps the object at root's dark fill `#313139`; `graph.classBackground` holds the explicit value and `objectDefaultBackground` fell to the light default. `core/object-skin-default.ts` writes the dark default into `object.default`.
- **Confidence**: High (`object__x-dark-class-background`).
