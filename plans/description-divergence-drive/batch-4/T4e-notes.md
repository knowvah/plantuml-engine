# T4e — notes

Commit: `fix(description): read note colours and stereotypes`.

## Context
`note left of A1 #green: note green`, `note as N1 #blue`, `note "x" as N2 #666666` (`zodiro-57`, `#FEFFDD` against `#00F`); `note left <<x>>` with `skinparam note { BackgroundColor<<x>> #black }` (`tinizu-50`); `note bottom of C1 <<legendnote>>` (`jegure-48`), with `skinparam shadowing<<legendnote>> false`. `CommandFactoryNoteOnEntity.java:122-146`, `EntityImageNote.java` (*lead*): the note's own signature and `getColors`.

Note on link: `note.link` is unread by `renderer-cluster-note.ts#drawKermorGroupNote` (`planning/next-missions.md` item 17, the open half of #122, D6). `povuju-56`, `usecase/fogiku`, `jafuke`, `dikexa`, `tujica`, `josoxo` were codd's list, so check which are still open: `dikexa`, `tujica` and `josoxo` may have closed. State fixed its half with `CucaNote.build(display, position, colors)` (`CommandFactoryNoteOnLink.java:217-218`): read how before writing.

`larevi-66` is `skinparam roundCorner 10` on a file with a note, in T4a's list; take it here if the note is the path that moves.

## Rows
`zodiro-57`, `tinizu-50`, `jegure-48`, `povuju-56`.

## Acceptance
- Given `zodiro-57`, when rendered, then each note has the jar's fill, with zero diffs.
- Given a `note on link #blue;line:red;text:x` on a component diagram (authored fixture, jar oracle), then fill, line and text match.

Observability: N/A — no new observable operations. Rollback: Reversible.
