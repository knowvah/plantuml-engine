# T2a — Builder colours through `DARK_MODE` in `buildTheme`; sequence

**State at planning:** `sequence__mode-dark` 22 diffs with no `<style>` at all (lifeline `#181818` against
`#E7E7E7`, participant `#E2E2F0` against `#222`, text `#000` against `#FFF`), and the five dss `sequence__scope-dark-*`
rows 17 each. `theme-dark.ts` seeds 5 literal defaults (`skinparam-theme-builder.ts:261-330`), and its header says the
port has no `@media` parser. That is stale: `StyleParser.ts:188,241` and `ValueImpl.ts:138` pair the partners.
Under a `<style>`, `style-element-scope.ts:467` keeps the default for dark (`keepDefault: … || isDark(pre)`), which is
dss D3's dark exception.

**Read:** `TitledDiagram.java:292-294`, `ColorMapper.java:68-72`, `HColorSimple.java:236-239` (`darkSchemeTheme`),
`SkinParam.java:114-116`, `src/main/resources/skin/plantuml.skin`'s `@media` block (`theme-dark.ts` cites `:563-776`; check
it). The sequence participant, lifeline, arrow and note `getStyleSignature` sites, starting from
`sequencediagram/skin/` and `skin/rose/`. Ours: `activity-circle-style.ts:59-107` (`paintOf` already applies
`darkSchemeTheme()` under `isDark`, which is the pattern), `document-back-color.ts:153-160` (`isDark`),
`build-theme.ts`, `style-element-scope.ts`, `theme-dark.ts`, `skinparam-theme-builder.ts`.

**Do:** per D2.
1. Red: `sequence__mode-dark` and `sequence__scope-dark-style` through `renderSync` give the jar's participant fill,
   lifeline stroke and text fill (values from their oracles).
2. Under `isDark`, resolve each element colour `buildTheme` writes from the builder at its signature (dss D4's
   table) and map it with `darkSchemeTheme()`, for every source. A colour with no partner is unchanged, so explicit
   skinparam and plain `<style>` colours keep themselves. Retire `style-element-scope.ts`'s dark `keepDefault` arm if
   it no longer holds.
3. Replace each `DARK_MODE_DEFAULTS` literal with the builder read where a signature exists. Keep a literal only
   where no signature reaches the reader, and cite its `plantuml.skin` line. Correct `theme-dark.ts`'s header.
4. Fix the sequence readers that skip the theme bucket, one at a time, each with its Java quote.

**Measure:** `rows.mts` prefixes `sequence__`, `component__probe-dark`, `*__mode-dark`; surveys of sequence, class and
activity (the three corpus dark rows), plus every bucket `verdict-diff` names.

## Acceptance
- Given the six dss sequence dark rows and `sequence__mode-dark`, `sequence__mode-dark-style`, then each is
  conformant, or journaled with the mechanism that remains and its owner.
- Given `sequence__scope-dark-skinparam-white`, then the skinparam's white stays white, as the jar draws it.
- Given the three corpus dark-mode rows, then each stays conformant.

Observability N/A. Rollback Reversible.
