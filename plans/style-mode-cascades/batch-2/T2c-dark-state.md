# T2c — State: boxes, notes, and the `mode-dark-style` row

**State at planning:** `state__mode-dark` 7 diffs (state fill `#F1F1F1` against `#313139`, text `#000` against
`#FFF`, the note). `state__mode-dark-style` 41: the same colours plus the note geometry, which is M7. A
`<style> note { FontSize 12 }` alone gives 33 diffs on state (`state__casc-control-plain`), and T4d owns that.

**Read:** `EntityImageState.java:120-170` (the style it applies, `ug.apply(stroke)` at `:130-132`),
`EntityImageNote.java`, and the state note path (`state-composite-geo.ts`, `buildFlatNoteGeos`, dss D7). Ours: the
state colour readers (`stateBorderStrokeAttrs` and its neighbours, from stdd T3b). T2a's shared path is the input.

**Do:** per D2. Red first with the oracle's values. Route the state fill, border, font and note colours through
T2a's mapped theme. Leave the note geometry to T4d: journal `state__mode-dark-style`'s remaining count as M7.

**Measure:** `rows.mts` prefix `state__`; the state survey (`state 298/0/1` at planning, from the committed file).

## Acceptance
- Given `state__mode-dark`, then it is conformant.
- Given `state__mode-dark-style`, then only M7's note-geometry diffs remain, journaled with T4d as owner.
- Given the state survey, then 0 lost.

Observability N/A. Rollback Reversible.
