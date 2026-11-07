# T1c — state notes take `skinparam noteBackgroundColor`

**State at planning:** `skinparam noteBackgroundColor #BBBBBB` leaves a state note `#FEFFDD`; the jar paints `#BBB`.
This holds for an attached note (`state__noteskin-bg` 2), a floating `note "n" as N` (`-bg-floating` 2) and a
`note on link` (`-bg-link` 2). The same skinparam with a later `<style>` that sets only the font is at 0
(`-bg-style`), and so are `noteBorderColor`, `noteFontColor` and `defaultFontColor`. Every other engine's row is at 0.
Not yet traced.

**Read:** `FromSkinparamToStyle.java:125` (the skinparam becomes `note { BackGroundColor }`), `EntityImageNote` (the
attached and floating note's fill read; quote it), `EntityImageNoteLink.java:61-65` (the link note), and how
`-bg-style` reaches the right fill when the plain row does not. That contrast is the lead: the reader may take the
merged value only when a `<style>` block exists (dss D3's gate). Ours: the state note fill readers
(`grep -rn "noteBackground" src/diagrams/state`).

**Do:** per D4. Red with the three rows' oracle fills. Fix where the state reader leaves the merged note style, for
all three note kinds.

**Measure:** `rows.mts` prefixes `state__noteskin-`, `state__notes-`, `state__probe-note`; the state survey
(9 cached sources set the skinparam).

## Acceptance
- Given the four `state__noteskin-*` rows, then each is at 0.
- Given every other `state__` dss row and the state survey, then 0 lost.

Observability N/A. Rollback Reversible.
