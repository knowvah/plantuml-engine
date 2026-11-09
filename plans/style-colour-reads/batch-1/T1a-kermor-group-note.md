# T1a — the kermor group note reads `ComponentType.NOTE` and its own colour

**State at planning:** under `!pragma kermor on`, `note top|bottom of <group>` is drawn by
`renderer-cluster-note.ts#drawKermorGroupNote`. It reads the description `note` bucket through a probe node with no
colour (`PAINT_PROBE`). So `componentDiagram { note { BackgroundColor } }` fills it where the jar does not
(`component__kgn-style-comp` 2: ours `#AAA`, jar `#FEFFDD`), and `sequenceDiagram { note { … } }` does not where the
jar does (`-style-seq` 2, `-stereo-style` 2). `note bottom of C #pink` keeps the default fill where the jar paints
`#FFC0CB` (`-bottom-colour` 2). Plain `note { … }` and the skinparams are already at 0 (`-style-note`, `-skinparam`).

**Read:** `Cluster.java:393-399` (`getCucaNote` hands `note.getColors()`), `EntityImageNoteLink.java:61-65`,
`ComponentType.java:98-99`, `ComponentRoseNote` (the colour reads it makes from `Colors` and the style), and
`CommandFactoryNote`/`CucaNote` for how a group note's `#colour` is parsed. Ours: `link-note-block.ts` (reads
`LINK_NOTE_BUCKET` and a colour override, the model to follow), `layout-helpers.ts#KermorNoteGeo`, and where the
description parser stores a group note's colour. `!pragma kermor` corpus: `fojamu-08`, `zubujo-87`, `siseda-71`.

**Do:** per D2. Red with the four rows' oracle fills. Give `KermorNoteGeo` the note's parsed colour, and read
`LINK_NOTE_BUCKET` plus that colour the way `link-note-block.ts` does. Correct the `link-note-block.ts` header line that
says the group note "reads `note` … (follow-on, left as is)".

**Measure:** `rows.mts` prefix `component__kgn-`; surveys of component, class and usecase (the description family and
the three kermor corpus rows).

## Acceptance
- Given the six `component__kgn-*` rows, then each is at 0.
- Given `fojamu-08`, `zubujo-87`, `siseda-71` and every description-family survey row, then 0 lost.

Observability N/A. Rollback Reversible.
