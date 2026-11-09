# T1d — sequence `FontColor transparent`: measure the text, draw none

**State at planning:** `element { FontColor transparent }` and `note { FontColor transparent }` make ours throw
`note style resolved no FontColor` (`sequence-note-width.ts:99`) and draw our error page where the jar draws the
diagram (`sequence__transparent-font` 15, `-note` 39). With
`participant { … }` or `arrow { … }`, ours writes the `<text>` the jar omits (`-participant` 1, `-arrow` 1:
`childCount` only). Every other engine's row is at 0.

**Read:** `DriverTextSvg.java:87-94` (a transparent colour returns before any `<text>`), `ValueImpl#asColor` and
`HColors.transparent()` for what `transparent` parses to, and the sequence components that build a
`FontConfiguration` from a style (`ComponentRoseNote`, `ComponentRoseParticipant`, `ComponentRoseArrow`). Ours:
`sequence-note-width.ts:85-110`, `paintOf` (where `font.color` turns null), and `driver-text-svg.ts`'s `color === null`
guard (dss-T3d).

**Do:** per D5. Red with the four rows. Drop the throw; let a transparent font colour reach the driver as null; keep
the measured size. Check that no sequence sizing path reads the colour.

**Measure:** `rows.mts` prefixes `sequence__transparent-`, `sequence__scope-`; the sequence survey (5 cached sources
use `FontColor transparent`, all conformant).

## Acceptance
- Given the four `sequence__transparent-font*` rows, then each is at 0.
- Given the sequence survey and every other `sequence__` dss row, then 0 lost.

Observability N/A. Rollback Reversible.
