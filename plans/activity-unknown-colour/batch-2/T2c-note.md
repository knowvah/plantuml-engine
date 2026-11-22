# T2c: a note colour paints the neutral

Follow [task-contract.md](../task-contract.md). Decisions: D1, D2.

## Mechanism

`note right #zzblue` (`CommandNoteLong3.java:129`) and `note left #zzblue: n` (`CommandNote3.java:127`) build
`Colors` from the colour capture with `color().getColor(arg, set)`. `new Colors(...)` lowercases and strips `#`
(`Colors.java:96`), splits on `;`, and for a part with no `:` and no `.` calls the throwing `set.getColor(s)`
(`Colors.java:101-103`); a `name:value` part uses `getColorOrNull` (`:112`) instead, and the jar draws. Ours keeps the
raw token (`note-dispatch.ts#noteColorSpread`, `:23-27,92`) and emits `fill="#zzblue"`, an invalid value.

## Task

1. Red first: unit tests that a parsed note with `#zzblue` carries `#D3D3D3` and one with `#red` carries today's value;
   check both the single-line and multi-line forms.
2. Green: apply `colorOrNeutral` in `noteColorSpread` for a bare part, mirroring `Colors.java:101-103` exactly,
   including the `.` skip. If the capture regex (`dispatch-note-patterns.ts:38`, `#\w+[-\\|/]?\w+`) cannot carry `;` or
   `:`, say so in the comment with the regex line rather than porting unreachable branches. Cite
   `Colors.java:103` in a JSDoc `@see`.
3. Drop `pending: 'T2c'` from `act-note-multi` and `act-note-single`.

## Write-set
`src/diagrams/activity/note-dispatch.ts`, `tests/unit/activity/auc-T2c-note-neutral.test.ts`,
`tests/oracle/svg-conformance/unresolved-colour.authored.test.ts`.

## Read-set
`src/diagrams/activity/note-dispatch.ts:1-100`; `src/diagrams/activity/dispatch-note-patterns.ts:1-40`;
`src/core/stereo/StereotypeDecoration.ts` and `src/core/color-override.ts:80-90` (the other `colorOrNeutral` callers).

## Acceptance
- Given `act-note-multi` and `act-note-single`, when rendered, then the note body fill is `#D3D3D3`, ours is no error
  page, and `invalidColours` is `[]`.
- Given `note right #red`, when parsed, then the stored colour is unchanged from today.
- Given the activity ratchets and survey, when re-run, then no row loses conformance.

Observability: N/A. Rollback: Reversible.
