# T3: a bare `create` follows upstream's two commands

**Goal.** `create X <tail>` behaves as `CommandActivate` when its tail fits that grammar, and as `CommandParticipantA`
otherwise (decisions.md D5). Rows: `alr-create-move` (X moves last), `alr-create-red` and `alr-create-red-msg` (X keeps
its default fill).

**Write-set:** `src/diagrams/sequence/command-lifeline.ts`, `src/diagrams/sequence/command-participant.ts`
(`createCommand`), `src/diagrams/sequence/sequence-command-registry.ts`, a unit test beside the existing lifeline or
participant tests, the gate.
**Read-set:** `decisions.md#d5…`; `command-lifeline.ts:1-80`; `command-participant.ts:70-88`;
`sequence-command-registry.ts:100-150`; `sequence-life-state.ts:90-110`; upstream `CommandActivate.java:60-131`,
`SequenceDiagram.java:366-380`.

## Steps

1. **Red.** Unit tests:
   - `actor X\nactor Y\ncreate X #line:red` orders the participants Y, X;
   - `create X #red` leaves X's colour undefined and files a CREATE event;
   - `create X #line:red` (X new) refuses as T2 does;
   - `actor X\ncreate X` does not move X.
2. **Green.** Add the `CommandActivate` TYPE `create` rule to `command-lifeline.ts`. Its pattern is upstream's: WHO,
   optional `#\w+` BACK, optional whitespace and `#\w+` LINE, end (`CommandActivate.java:72-83`). It calls
   `ensureParticipant` with no colour, then `activate(..., 'CREATE')`, and its error becomes `state.executionError`.
   Register it with the lifeline group, before `createCommand`. In `createCommand`, a bare `create` now always moves an
   existing CODE (`moveExisting = true`): the lines it still sees are `CommandParticipantA`'s.
3. Handle the CREATE colours as D5 says: carry them if the life-event model has a place, else drop them and journal it.
4. Measure, then pin `alr-create-move`, `-create-red` and `-create-red-msg`. `alr-ctl-create-move`, `-create-existing`
   and `-create-actor-existing` must stay at 0.

## Acceptance
- Given `actor X`, `actor Y`, `create X #line:red`, when rendered, then ours equals the jar's: X is drawn after Y.
- Given `create X #red`, when rendered, then X's head uses the default participant fill, as the jar's does.
- Given `actor X`, `actor Y`, `create X #red`, then the row stays at 0 diffs.
- Given the sequence survey, then no conformant row is lost.

Observability: N/A. Rollback: Reversible (revert the T3 commit).
