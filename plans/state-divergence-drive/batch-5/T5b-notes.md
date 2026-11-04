# T5b — notes

Commit: `fix(state): note endpoints, literals, colours and ids`.

## Context
dss follow-on 14, unproved in planning, so trace each: a one-line note's literal `\n`; `B --> N` to a note making a bogus state; an implicit second note's link id `__note_0` where the jar has `GMN2`
(`state-note-layout.ts:299,360` has a `GMN` port; find the path that misses it); our error page citing the previous line. Also `note on link #red` (`fotigo-12`): path fill `#FEFFDD` against `#F00`, and dss 17 names
description's `renderer-cluster-note.ts#drawKermorGroupNote` for the same read, `note` rather than `note.link`: fix state's path here, and leave description's for its own issue. Grep the corpus for rows; author oracles where it has none (task contract, step 2).

## Read
`command/note/CommandFactoryNoteOnEntity.java:327`; `CommandFactoryNoteOnLink.java`; `svek/image/EntityImageNoteLink.java`; `state-commands-notes.ts`; `state-link-note-merge.ts`.

## Acceptance
- Given `fotigo-12-gufu949`, when rendered, then it is conformant.
- Given an authored fixture for each of the four dss items, when compared against its oracle, then it is zero-diff or the row is named by D9.

Observability: N/A — no new observable operations. Rollback: Reversible.
