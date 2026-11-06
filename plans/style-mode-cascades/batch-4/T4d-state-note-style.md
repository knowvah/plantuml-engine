# T4d — State notes read `<style>` `FontSize`; state property residues

**State at planning:** a `<style>` holding only `note { FontSize 12 }` gives 33 diffs on state
(`state__casc-control-plain`). The note path sits 0.28 px left and 0.5 px off in y, the canvas 1 px wider: the note
is sized with another font or stroke than the jar's. The same block is conformant in activity, class, component and
sequence. Every state `casc-*` row starts from it, and `state__mode-dark-style` (41) carries it too (T2c).

**Read:** `EntityImageNote.java` (constructor: the style signature, `getFontConfiguration`, stroke, margins),
`SkinParam`'s note font reads for state, and `state-composite-geo.ts` and `buildFlatNoteGeos` (dss D7) on our side,
with the state note sizer and renderer.

**Do:** per D7. Red with the control row's note path values. Find which property the state note sizer reads flat,
probably font size or stroke, and read the merged note style. Then re-measure every state row and fix what remains
above its control, each with its quote: `fontsize-rose` 46, the `-after` rows, `roundcorner-theme` 60,
`shadow-theme` 103.

**Measure:** `rows.mts` prefix `state__`; the state survey.

## Acceptance
- Given `state__casc-control-plain`, then it is conformant.
- Given every state `casc-*` row and `state__mode-dark-style`, then each is at 0, or journaled with its mechanism and
  an owner per D10.
- Given the state survey, then 0 lost.

Observability N/A. Rollback Reversible.
