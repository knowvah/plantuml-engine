# T2b: a swimlane colour paints the neutral

Follow [task-contract.md](../task-contract.md). Decisions: D1, D2.

## Mechanism

`|#zzblue|L1|` is `CommandSwimlane`; its `executeArg` calls `getIHtmlColorSet().getColor(s)` on the `COLOR` group
(`CommandSwimlane.java:96-98`), which throws, and the jar errors. `CommandSwimlane2.java:103-105` does the same for
`swimlane L1 #c`. Ours stores the raw token in `ctx.swimlaneColors` (`dispatch-support.ts#setCurrentSwimlane`,
`:421-428`) and the layout reads it back (`layout/assign-coordinates-full.ts:246,296`, `withLaneBackgrounds`), where an
unparseable token draws no lane fill (21 diffs, no `#D3D3D3`).

## Task

1. Read the lane-fill path end to end (`withLaneBackgrounds` and the swimlane renderer) and find where the token is
   parsed. Apply `colorOrNeutral` where the other activity sites do: at the stored token, so the render path is
   untouched (`activity-scoped-colors.ts:26-27` is the model). Cite `CommandSwimlane.java:98` in a JSDoc `@see`.
2. Red first: a unit test that a parse of `|#zzblue|L1|` stores `#D3D3D3` for `L1`, and `|#red|L1|` stores today's
   value.
3. Drop `pending: 'T2b'` from `act-swimlane`.

`swimlane L1` itself is refused by our parser where the jar draws (D4). That is not this task: T3 files it.

## Write-set
`src/diagrams/activity/dispatch-support.ts` (or the swimlane dispatch that calls `setCurrentSwimlane`), `tests/unit/activity/auc-T2b-swimlane-neutral.test.ts`
(model: the `swimlaneColors` cases in `tests/unit/activity/parser.test.ts`), `tests/oracle/svg-conformance/unresolved-colour.authored.test.ts`.

## Read-set
`src/diagrams/activity/dispatch-support.ts:395-430`; `src/diagrams/activity/layout/assign-coordinates-full.ts:240-300`;
`grep -n 'setCurrentSwimlane' src/diagrams/activity/*.ts`.

## Acceptance
- Given `act-swimlane`, when rendered, then lane `L1`'s background is `#D3D3D3`, ours is no error page, and no invalid
  colour is emitted.
- Given `|#red|L1|`, when parsed, then the stored colour is unchanged from today.
- Given the activity ratchets and survey, when re-run, then no row loses conformance.

Observability: N/A. Rollback: Reversible.
