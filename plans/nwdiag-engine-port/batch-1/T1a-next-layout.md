# T1a — The layout half of `next/`

**Read:** `next/NStage.java`, `Staged.java`, `NBar.java`, `NBox.java`, `NTetris.java`, `BooleanGrid.java`,
`NPlayField.java`, `NwArray.java`; D1, D4.

**Do:**

1. `NStage.ts`, `Staged.ts` (an interface), `NBar.ts`: whole classes. `NBar#addStage` keeps `Objects.requireNonNull`
   as a thrown `Error`; `start`/`end` start null.
2. `BooleanGrid.ts`: `burned` a `Set<number>` keyed `x + (y << 16)` (JS `<<` is 32-bit like Java `int`); `burn` throws
   `Already present`; `check` throws on a negative or inverted rectangle.
3. `NTetris.ts`: generic over `Staged`; `add` scans `x` from 0 and throws past 100 (`IllegalStateException`);
   `getPositions` in insertion order; `getNWidth`.
4. `NBox.ts`: `bars` in add order, its own `NTetris<NBar>`; `getStart`/`getEnd` over the bars (throws on an empty box,
   as `bars.get(0)` does).
5. `NPlayField.ts`: `stages`, `boxes`, `getStage` growing the list, `getLast` null when empty, `createNewStage`,
   `addInPlayfield`, `doLayout`, `fixGroups`, `fixServerInGroup`. `fixGroups` takes `NwGroup` and `NServer` as
   type-only imports from `../core/` (T1b writes them); its test lands in T1b.
6. `NwArray.ts`: a `(NServerDraw | null)[][]` filled with null; `getNbCols` reads `data[0].length` (D4).

**Tests:** stage ordering; a bar spanning stages 0-2 and one on stage 1 pack into columns 0 and 1; two disjoint bars
share column 0; `BooleanGrid` throws on a double burn and on `check`'s three cases; `NTetris` throws past 100;
`doLayout` maps each bar to box position plus bar position. Journal any Java collection D4 missed.

## Acceptance
- Given bars on stages {0..2} and {1}, when added to an `NTetris`, then their positions are 0 and 1.
- Given bars on stages {0} and {2}, then both sit at position 0.
- Given `npm test`, then it passes with every new file at 90/90/90.

Observability N/A. Rollback Reversible.
