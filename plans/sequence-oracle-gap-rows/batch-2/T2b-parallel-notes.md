# T2b: `/ note` groups

**Rows:** `taduce-47-saka647` (36 diffs), `tenibi-81-sede977` (116). First diff: the jar puts A5 at `x=656.166`, ours at
`337.506`; the widths are 769 and 565.

## Java to read

- How a `/ note` line joins the previous note into one `Notes` event (`sequencediagram/command/CommandNote*`, the
  `/` prefix), and `sequencediagram/Notes.java`.
- `teoz/NotesTile.java:147-246`: `getX` for `OVER` and `OVER_SEVERAL` (`:152-175`), and `addConstraints`
  (`:202-226`): for each pair with different centres, the later note's `getX` must be at least the earlier note's
  `getX2`. The centres are compared with `getCurrentValue()` at constraint time.
- `real/RealUtils.java` (`middle`), `real/RealMiddle*.java`, and `ensureBiggerThan` on the reals involved, because
  the over-several note's `x` is a middle of two lifeline positions.

## Steps

1. Read how the port handles `Notes` today (`sequence-layout-note.ts`, `sequence-layout-parallel-disjoint.ts`,
   `sequence-note-tile.ts`) and find where it departs from `addConstraints`. Write the mechanism with `file:line` in
   the journal before changing anything.
2. Red: a test on `tenibi-81-sede977` asserting the jar's lifeline centres for A1 to A6, taken from its `in.svg`.
3. Port the constraint.
4. Pin both rows.

## Acceptance
- Given `taduce-47-saka647` and `tenibi-81-sede977`, then both are at 0 diffs and pinned.
- Given the pinned rows with `/ note` already in the ratchet, then they are unchanged.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
