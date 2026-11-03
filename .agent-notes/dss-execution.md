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

## Observation: chart prints the theme background raw
- **Context**: Reading T1a's document background results across engines.
- **Finding**: `src/diagrams/chart/layout.ts:169` prints `theme.colors.background` as written, so `skinparam backgroundColor white` gives `background:white` where the jar gives `#FFFFFF`. Pre-existing.
- **Impact**: File at exit; any row with a named colour on chart keeps this diff.
- **Confidence**: High.

## Observation: the complexity hook skips Bash edits
- **Context**: T1a's hand-back.
- **Finding**: `lizard` was absent in T1a's environment and edits made through Bash do not trigger the Write/Edit hook, so the 500-line and function limits went unchecked for it.
- **Impact**: Check limits on merge with `~/.claude/hooks/.venv/bin/lizard` rather than relying on the hook.
- **Confidence**: Medium.

## Observation: the exit probe found two defect families behind 532 conformant rows
- **Context**: Probing past the rows after batch 4, at 532/605 with every engine's rows green.
- **Finding**: `fork … end merge` read the wrong signature (24 of 35 probes) and gradient values were dropped, flattened, written raw or left as a `url()` with no def (45 of 90). No row or corpus fixture exercised either: a gradient `LineColor` has 0 corpus sources.
- **Impact**: Value kinds (gradient, transparent) need their own probe axis, alongside selectors and chrome.
- **Confidence**: High.

## Observation: the state ratchet harness had no seed
- **Context**: `state/kujuzo-76` conformant in the survey, 5 diffs through `renderFixtureState`, all gradient ids.
- **Finding**: `render-fixture-state.ts` called `assembleSvg` with no seed. Activity's and class's harnesses pass it. No pinned state fixture had a def before.
- **Impact**: A survey-conformant row that fails the pin check by id only points at a harness, not a defect.
- **Confidence**: High.
