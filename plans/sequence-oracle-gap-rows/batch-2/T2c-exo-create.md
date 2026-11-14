# T2c: `**` on an exo arrow

**Row:** `kikate-70-xevi302` (16 diffs). Source: `-> a **`. The jar draws `a`'s lifeline group with a `<title>a</title>`
and the transparent hit rect (`fill="#000" fill-opacity="0"`, `x=30.5 y=39 width=8 height=32`). Ours draws no title
and a white stroked rect at `y=47`, 24 high.

## Java to read

- `sequencediagram/command/CommandExoArrowAny.java:103-106`: an ACTIVATION starting with `*` calls
  `diagram.activate(p, LifeEventType.CREATE, null)`. Read the rest of the activation spec handling after it (`**` has
  a second character).
- `SequenceDiagram#activate` and how a CREATE before the message is attached to it.
- `teoz/LivingSpace.java`, `teoz/LiveBoxes.java`, `teoz/CommunicationExoTile.java`: how a created participant's head
  and lifeline are placed for an exo message.

## Steps

1. The parse already records CREATE (`command-exo-arrow.ts:411-414`). Find where tiles or the renderer lose it, and
   write the mechanism in the journal.
2. Red: assert the jar's lifeline group (title, rect attributes) and the head position.
3. Port. Then pin the row.
4. Push-forward: `<- a **`, `->]` forms, and `**` with a colour, if the diff shows the branch is shared.

## Acceptance
- Given `kikate-70-xevi302`, then it is at 0 diffs and pinned.
- Given the pinned rows with exo arrows, then they are unchanged.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
