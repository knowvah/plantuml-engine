# T4c — `!theme` with a `<style>` block keeps the theme's merged style

**State at planning:** `!theme cerulean` plus a `<style>` block draws the activity box with rx 13.021, where the jar
draws 4.167, and 33.333 tall against 25 (`activity/finadu-74-duvi890` 50; #119's comment on #120).
`activity__casc-control-theme` is 72, class 14 (note corner 0 against 4.167), state 98 (the state box corner 13.021
against 4.167). Component and sequence are conformant on every theme row. Activity, class and state property rows sit
at or near their control.

**Read:** `src/main/resources/themes/puml-theme-cerulean.puml` (what it declares, as skinparams and as `<style>`), the `!theme`
handling (`TitledDiagram`, `ThemeUtils` or the preprocessor's `!theme`), `FtileBox.java:146-171` (the box's merged
style: round corner, padding, font), and `EntityImageState.java` and `EntityImageNote.java` for the corner reads. Ours:
how `!theme` reaches the builder, and why a source with a `<style>` reads the flat tier for these properties. Read
ubt T1b's `activity-box-style.ts`, which builds the merged box style for stereotyped boxes.

**Do:** per D7. Red with `finadu-74`'s `rx="4.167"`. Find the reader that takes the flat theme value for corner and
padding once a `<style>` exists, and read the merged style there. Then the class note corner and the state box corner,
each with its quote.

**Measure:** `rows.mts` prefixes `*__casc-control-theme`, `*__casc-*-theme`; surveys of activity, class, state, and
every bucket with a `!theme` corpus source.

## Acceptance
- Given `finadu-74-duvi890`, then it is conformant and pinned in the activity golden ratchet.
- Given the control-theme rows of activity, class and state, then each is at 0, or journaled with its remaining
  mechanism and owner (state note geometry: T4d).
- Given every `!theme` corpus row, then 0 lost.

Observability N/A. Rollback Reversible.
