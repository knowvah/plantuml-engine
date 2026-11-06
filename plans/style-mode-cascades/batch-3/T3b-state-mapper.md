# T3b — State gets the fragment mapper

**State at planning:** state applies no colour mapper. `state__mode-monorev` 17 diffs (background `#FFFFFF` against
`#000000`, fill `#F1F1F1` against `#0E0E0E`, stroke `#181818` against `#E7E7E7`), `-revdark` 18, `-revrbg` 17, and
`state__mode-mono-style` 4 (a `<style>` red `#F00` against the greyed `#4C4C4C`, note `#FEFFDD` against `#FAFAFA`). No
state corpus row uses monochrome or reverse colour, so the authored rows are the only evidence.

**Read:** `TitledDiagram.java:292-313`; how class wires `fragment-color-mapper.ts` at its single return point
(`src/diagrams/class/renderer-document.ts`, the module header), and how activity does it (`renderer.ts:415`). Then the
state renderer's return point and its background.

**Do:** per D6. Red: `state__mode-monorev` through `renderSync` gives the jar's background, fill and stroke. Apply
`colorMapperOf(theme)` to the finished state fragment and the root background, at one point as class does. Dark mode
wins first (`TitledDiagram.java:293-294`), which batch 2 already handles.

**Measure:** `rows.mts` prefix `state__mode-`; the state survey.

## Acceptance
- Given the four state `mode-monorev`, `-revdark`, `-revrbg` and `-mono-style` rows, then each is conformant, or
  journaled with its remaining mechanism.
- Given `state__mode-dark`, then it stays as T2c left it (the dark arm wins over the mapper).
- Given the state survey, then 0 lost.

Observability N/A. Rollback Reversible.
