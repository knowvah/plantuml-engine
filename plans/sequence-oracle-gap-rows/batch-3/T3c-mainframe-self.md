# T3c: `mainframe`, `box` and `C -> C ++--`

**Row:** `teoz-ng-001-1` (18 diffs). Source: `mainframe **sd** Test`, a `box` holding B and C, `activate A`,
`A -> B ++`, `B -> C ++`, `C -> C ++--:A1`, `B <-- C --`, `A <<-- B --`. The diagram is 5 wider in the jar (223 /
218), one activation box is 67 high in the jar and 40 in ours, and a later one is 13 / 19 high at a different `y`.

## Java to read

- `sequencediagram/command/CommandArrow.java`: how `++--` on one message is split into an activate and a deactivate,
  and in which order they attach (`LifeEventType`, `SequenceDiagram#activate`).
- `teoz/CommunicationTileSelf.java`: its width and live-box contribution for a self message that both activates and
  deactivates.
- `teoz/LiveBoxes.java`, `teoz/Stairs.java`, `teoz/Step.java`: the live-box heights.
- `teoz/Dolls.java` and the mainframe drawing, only if the 5 px width difference survives the live-box fix.

## Steps

1. Write the mechanism with `file:line` in the journal. The width and heights may be two mechanisms: split the task if
   so (push-forward).
2. Red: assert the jar's live-box rects for C (`height=67`, then `height=13` at `y=173`) and the width 223.
3. Port. Then pin the row.

## Acceptance
- Given `teoz-ng-001-1`, then it is at 0 diffs and pinned.
- Given the pinned rows with `++`/`--` shortcuts and self messages, then they are unchanged.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
