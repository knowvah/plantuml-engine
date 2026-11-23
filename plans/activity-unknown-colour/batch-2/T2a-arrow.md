# T2a: arrow and `link` colours paint the neutral

Follow [task-contract.md](../task-contract.md). Decisions: D1, D2.

## Mechanism

Every activity arrow colour reaches `Rainbow.build` (`Rainbow.java:109-118`), which splits on `;` and calls
`HtmlColorAndStyle.build` per member; that splits on `,`, skips `LinkStyle` keywords, and calls the throwing
`set.getColor(s)` (`HtmlColorAndStyle.java:100`). Callers: `CommandArrow3.java:106`, `CommandArrowLong3.java:114`,
`CommandRepeatWhile3.java:163`, `CommandBackward3.java:172` (shared by `CommandElse3.java:107`,
`CommandElseIf3.java:169-170`, `CommandElseIf2.java:157-158`). `link #c` calls `getColor` directly
(`CommandLink3.java:84`) and lowers to the same arrow-label node here (`dispatch-common-commands.ts#tryLink3`).

Ours resolves at render time: `activity-rainbow.ts#memberLook` runs `colorTokenHex(token) ?? line`, so an unknown
token keeps the default line colour. Per D1 it must be `colorOrNeutral(token)`, for both the line and the head (the
head colour is `null` upstream, so it is the arrow colour, `HtmlColorAndStyle.java:66`).

## Task

1. **First, `-[]->`.** The jar draws it at 0 diffs today, and our parser passes `style: ""`, so a naive swap paints it
   grey. Find why the jar draws (whether `CommandArrow3`'s `COLOR` capture reaches `Rainbow.build` as `""` or `null`,
   and what `parseColor("")` returns, `HColorSet.java:78-120`), quote the `file:line`, and mirror it. Do not special-case
   `""` without that quote.
2. Red: unit tests in `tests/unit/activity/auc-T2a-arrow-neutral.test.ts` for `planEdgeDraw` with `color: '#zzblue'`, `'#red;#zzblue'`,
   `'#zzblue,dashed'`, and `''`: the line/head values are `#D3D3D3`, `#F00` + `#D3D3D3`, `#D3D3D3` dashed, and today's
   value respectively; plus `'#blue'` unchanged.
3. Green: apply `colorOrNeutral` in `memberLook`'s colour branch. If `colorTokenHex`'s `undefined` return becomes
   unreachable, drop the fallback and quote the invariant (push-forward).
4. Drop `pending: 'T2a'` from the 12 rows.

## Write-set
`src/diagrams/activity/activity-rainbow.ts`, a new `tests/unit/activity/auc-T2a-arrow-neutral.test.ts` (model:
`tests/unit/activity/aar-T3b-rainbow.test.ts`), `tests/oracle/svg-conformance/unresolved-colour.authored.test.ts`.

## Read-set
`src/diagrams/activity/activity-rainbow.ts:36-66,151-160`; `src/diagrams/activity/dispatch-support.ts:262-300`
(`ARROW_HEAD`, `RE_ARROW_LABEL`); `src/diagrams/activity/node-dispatch.ts:282-297`;
`src/diagrams/activity/dispatch-common-commands.ts:144-157`; `src/core/klimt/color/HColorSet.ts:360-377,427-445`.

## Acceptance
- Given `act-arrow` (`-[#zzblue]->`), when rendered, then the edge's path and polygon use `#D3D3D3`, ours is no error
  page, and no invalid colour is emitted.
- Given `act-arrow-rainbow` (`-[#red;#zzblue]->`), when rendered, then one copy is `#F00` and the other `#D3D3D3`.
- Given the 12 arrow and link rows, when the gate runs without their `pending` flag, then all pass.
- Given `act-arrow-empty`, `-bold`, `-named`, `-transparent`, `-gradient`, `-valid`, when rendered, then each stays at
  0 diffs, and the journal quotes why the jar draws `-[]->`.
- Given the activity ratchets and survey, when re-run, then no row loses conformance, and `duluve-89-mati167`'s two
  arrows are `#D3D3D3`.

Observability: N/A. Rollback: Reversible.
