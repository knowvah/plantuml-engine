# smc-T2b/T2c — dark mode in the theme-reading engines

## Observation: dark seeds in `elements` replaced the whole `<style>` bucket map
- **Context**: `component__probe-dark` kept a 1-2 px size delta after the colours were fixed.
- **Finding**: `skinparam mode dark` declared after a `<style>` made `applyDarkModeDefaults` seed `acc.elements.{spotclass,activity,diamond}`; `buildColorsOverride` then set `colors.elements`, which `deepMergeTheme` replaces whole, so `database { FontSize 12 }` (flat `elements.database.fontSize`) was lost: text 14 not 12.
- **Impact**: any `elements` seed in a skinparam-derived partial can erase `<style>` buckets. The seeds are removed; builder reads (`style-element-scope.ts`) replace them.
- **Confidence**: High

## Observation: stale dss D3 dark exception encoded in a unit test
- **Finding**: `style-element-scope.test.ts` asserted dark keeps `theme-dark` for an untouched default; smc D2 supersedes it. Rewritten.
- **Confidence**: High
