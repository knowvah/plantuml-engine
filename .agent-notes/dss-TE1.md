# dss-TE1 observations

## Observation: a merge's in-connectors follow `arrow` only because a box carries its own rainbow
- **Context**: `fork ... end merge`, jar probes with `root { LineColor #0A0 } arrow { LineColor #00A }` (35 probes, 24 differing at b0).
- **Finding**: `ParallelBuilderMerge.java:80-82` reads `getStyleSignature()` (activity) for `def`, but `tmp.getInLinkRendering().getRainbow(def)` (`LinkRendering.java:77-82`) returns the tile's own rainbow when non-empty. `FtileBox.java:158` (also `FtileBoxOld:160`, `FtileBoxEmoji:117`) sets `inRendering = Rainbow.build(arrow style)`, so a branch starting with `:a;` draws its in-connector in `arrow`. Every other tile inherits `AbstractFtile.java:84-86` (`none`), so an `if`/`while`/`repeat`/label/empty first tile gets `activity`. `FtileKilled` (`InstructionSimple.java:111-113`, an `AbstractFtile`) forwards nothing, so a killed box gets `activity` too. An inline arrow ahead of the first instruction wraps it in `FtileDecorateIn` (`InstructionList.java:150-151`): a colour wins, a label-only arrow leaves an empty rainbow so `activity` applies. Out-connectors: the box has no out rendering, so only a trailing inline colour (`FtileDecorateOut`) beats `activity`.
- **Impact**: the brief's "route all connectors through activity" would have recoloured the in-connectors the jar draws in `arrow`. Fork and split are unchanged (their `def` is `arrow`, same as the box rainbow).
- **Confidence**: High (29 rows and the 35 original probes at 0 diffs; 37 tail probes at 0 colour diffs).

## Observation: snake merging dropped a signature tag
- **Context**: an empty branch / `label` branch kept `arrow` after the fix.
- **Finding**: `layout/snake-merge.ts#joinOrdered` rebuilds the merged edge from explicit fields. `lineSName` must be carried from the head (`Snake.java:318` keeps `this.color`, the whole `Rainbow`).
- **Impact**: any new per-edge field has to be copied there or it vanishes on a zero-length weld.
- **Confidence**: High (rows `merge-first-empty`, `merge-first-label` red before the copy).

## Observation: `-> label;` before a merge branch draws a different layout, not a different colour
- **Context**: probes `-> hello;` before the first box, and `-> done;` before `end merge`.
- **Finding**: colours match the jar; 90 / 44 layout diffs (width +10 to +11 px) remain. Not caused by TE1 (colour-only change), not authored as rows (non-conformant).
- **Impact**: open, a merge-specific label-width port gap.
- **Confidence**: Medium (colour part High; layout cause not diagnosed).
