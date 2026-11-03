# diagram-style-scope execution notes

## Observation: class notes ignore skinparam noteBackgroundColor
- **Context**: Probing nested inheritance for T0c's D1 finding.
- **Finding**: `skinparam noteBackgroundColor #BBBBBB` + `class A` + `note left of A`: jar `#BBB`, ours `#FEFFDD`, with no `<style>`. `resolveNoteBackground` (`src/diagrams/class/renderer-note-background.ts`) reads `elements.note`, then `NOTE_FILL`; the skinparam lands in `theme.colors.noteBackground`. Sequence honours the same key. No class corpus row sets it.
- **Impact**: The survey cannot show it; needs an authored row.
- **Confidence**: High for the output; mechanism from reading the function, not from a fix.

## Observation: nested class diagrams draw an extra path
- **Context**: Same probe, decoding the embedded `image/svg+xml`.
- **Finding**: Nested `class B` + note: jar `rect path path`, ours `rect path:#000 path path`. The outer `class A` draws the `#000` path on both sides, so ours draws a glyph the nested jar output does not.
- **Impact**: `compareSvg` exempts image href bytes, so no row sees it. Mechanism not diagnosed.
- **Confidence**: High for the bytes; mechanism unknown.

## Observation: state's composite pipeline never draws notes
- **Context**: T0c section 3, reproduced by the orchestrator.
- **Finding**: `state-composite-geo.ts:403` materialises `specs` with no note while DOT holds it, so the canvas is 55 px short. Appending `buildFlatNoteGeos` takes `state__cascade-none` from 46 to 0.
- **Impact**: The "unrelated baseline" of 46 is this one omission, and it hid T3c's real bar. Composite-scoped notes are not covered by that experiment.
- **Confidence**: High.
