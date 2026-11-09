# T2b — Labels around `fork`, `split`, `merge`; a note after `end split` (items 9, 10)

**State at planning:**

- Item 9: `InstructionSplit.java:155-158`, `addNote` returns `getLast().addNote(...)`: a note after `end split`
  belongs to the last branch's last instruction. Ours lays it out below the split. dss `activity__loops-*` 10 rows
  at 311-313; authored `activity__splitnote-floating` 73, `-attached` 62, `-then-box` 78 (ours 152 tall, jar 109).
- Item 10: `-> label;` before a merge branch, `end merge`, or a box and note. Authored `activity__mergelabel-first`
  67, `-end` 15, `-both` 83, `-box-note` 27, `-box-note-left` 29, `-split` 32, `-fork-end` 14. dss TE1 found it is
  layout, not colour (`.agent-notes/dss-TE1.md`, "`-> label;` before a merge branch draws a different layout").
- Corpus, 11 rows Σ 868: `cajexu-16` 25, `vejori-69` 29 (`-> missing arrow label;` before `end merge`), `kimobe-21`
  32, `pitifi-09` 51, `nisigo-68` 73, `vakibi-34` 74, `zuledo-15` 80, `dacato-89` 99, `lucoke-82` 104,
  `tinupo-67` 105 (a note in a fork branch, swimlanes), `zitefu-56` 196.

**Read (leads):** `InstructionSplit.java` (`addNote`, `getInLinkRendering`, how `end split`'s out rendering is
kept), `InstructionFork.java` (the same for fork and merge), `FtileFactoryDelegatorCreateParallel.java`,
`ParallelBuilderFork.java`, `ParallelBuilderMerge.java`, `ParallelBuilderSplit.java` (where each branch's in and
out labels become height, and the bars' positions), and `FtileWithNoteOpale.java` for the note. Ours: the parallel
builders and the activity note attachment (`docs/catalog.md`).

**Do:** item 9 first (one mechanism, 13 rows), then the merge labels. Red with an authored row's jar values.

**Measure:** the rows above, `rows.mts ... activity__loops activity__splitnote activity__mergelabel`; activity
survey.

## Acceptance
- Given the 10 `loops-*` rows and the three `splitnote-*` rows, then each is 0, or lowered and journaled with its
  remaining mechanism and owner.
- Given the seven `mergelabel-*` rows and the 11 corpus rows, then each is conformant (corpus pinned) or journaled.
- Given the activity survey, then 0 lost.

Observability N/A. Rollback Reversible.
