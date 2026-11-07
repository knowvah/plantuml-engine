# scr batch 1 (style-colour-reads, #122) observations

## Observation: class arrow heads ignore HeadColor in the jar
- **Context**: T1b, looking for a class read of `HeadColor` to share with state (D3).
- **Finding**: `class__head-arrow` (`<style> arrow { HeadColor #FF0000 }`, `A --> B`) keeps a `#181818` head in the jar
  oracle. Description and state read `HeadColor` (`Rainbow.build`); class does not, so there is no class read to
  share.
- **Impact**: Do not "fix" class to read HeadColor; the jar does not.
- **Confidence**: High (oracle bytes, rendered 2026-11-06).

## Observation: Theme-shape changes leak into dist/*.d.ts; symbol keys do not
- **Context**: T1b needed a merged-style value on the theme without a d.ts change (D7, stop 4).
- **Finding**: `ElementColors` and `theme.colors.graph.*` are in `dist/plantuml-ts.d.ts`; a new field there changes
  the published types. `state-style-facts.ts` carries merged-style facts under a `unique symbol` key on the theme
  (`withStateNameFont`, now `withStateArrowHead`), which keeps the d.ts byte-identical.
- **Impact**: Use the symbol-key pattern for engine-internal style facts.
- **Confidence**: High (d.ts compared byte-for-byte at batch 1 close).

## Observation: the D3 gate leaves a skinparam-only colour on the flat theme field only
- **Context**: T1c, state notes under `skinparam noteBackgroundColor` with no `<style>` block.
- **Finding**: With no `<style>`, `elementScopeColors` writes only `FONT_ROLE`; the background lives on
  `theme.colors.noteBackground`. A reader whose fallback is a hard-coded constant instead of that flat field misses
  every skinparam-only colour.
- **Impact**: When a bucket read falls back, fall back to the flat theme field, not a literal.
- **Confidence**: High.

## Observation: sequence TextRun encoded transparent as "no colour"
- **Context**: T1d, `FontColor transparent` in sequence.
- **Finding**: `styleFieldsOf` omitted a null font colour, and `fontConfigurationOf` filled it from the ambient
  (`theme.colors.text`), so `driver-text-svg.ts`'s `color === null` skip never fired. Runs now carry
  `TRANSPARENT_SVG`, mapped to `null` at `fontConfigurationOf`.
- **Impact**: An absent run colour means "ambient"; transparency must be explicit on the run.
- **Confidence**: High.

## Observation: vitest swallows console output in unit tests
- **Context**: Probing rendered SVG from a throwaway test.
- **Finding**: `console.log` inside a vitest test printed nothing in this config; write probes to a `/tmp` file.
- **Impact**: Probe by file, not console.
- **Confidence**: Medium.
