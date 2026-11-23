# T1: the authored gate holds the 30 activity rows

Follow [task-contract.md](../task-contract.md). Decision: [D3](../decisions.md#d3-hold-the-rows-in-the-existing-authored-gate-with-a-neutral-kind).

## Task

1. Copy the 30 `plans/activity-unknown-colour/measurements/probes/*.puml` into `tests/fixtures/unresolved-colour/`.
   Regenerate each jar `.svg` beside it with
   `scripts/oracle-render.sh "$PWD/tests/fixtures/unresolved-colour" tests/fixtures/unresolved-colour/act-<name>.puml …`
   (render only the new rows; never re-render the existing 28). Delete any `svek-N.dot` left behind. Each new `.svg`
   must equal the planning copy in `measurements/probes/jar/` byte for byte; if one does not, journal it and use the
   fresh one.
2. In `tests/oracle/svg-conformance/unresolved-colour.authored.test.ts`:
   - add the 13 guard rows to `ZERO`, under a dated comment (`// 2026-11-22 auc T1: activity guards, #189`);
   - add `NEUTRAL` per D3 with the 17 rows. `pending` is `'T2a'` for the 12 arrow and link rows, `'T2b'` for
     `act-swimlane`, `'T2c'` for both notes; `act-circlespot` and `act-partition-back` carry none. `jar` is
     `'Syntax Error?'` for `act-partition-back`, else `'No such color'`;
   - extend the manifest test so `ZERO`, `OPEN` and `NEUTRAL` keys together equal the files on disk, each once;
   - add a manifest test that every `pending` names a task id of this mission (`/^T2[abc]$/`);
   - update the header comment with one bullet for the `NEUTRAL` kind, citing `HColorSet.java:69-76`,
     `SingleLineCommand2.java:176-177` and the #143 ruling.
3. Add the error-page signal as the survey does: `setErrorPageObserver` from `src/core/error/error-renderer.ts`, set
   before the render, cleared in a `finally`.

## Write-set
`tests/fixtures/unresolved-colour/act-*.{puml,svg}` (create, 60 files),
`tests/oracle/svg-conformance/unresolved-colour.authored.test.ts` (modify).

## Read-set
`unresolved-colour.authored.test.ts` (whole file, 144 lines); `state-note-embed.authored.test.ts:1-60` (an `ERROR`
kind for comparison); `src/core/error/error-renderer.ts:35-47`; `src/core/klimt/color/HColorSet.ts:360-377`.

## Acceptance
- Given the 30 new fixtures, when `npm test` runs the gate, then the manifest test passes with 58 rows, and every row
  passes.
- Given a `NEUTRAL` row with `pending: 'T2a'`, when ours already paints `#D3D3D3`, then that row fails (stale flag).
- Given `act-circlespot`, when the gate runs, then it asserts the jar page says `No such color`, ours draws, ours emits
  no invalid colour, and ours contains `UNKNOWN_COLOR_NEUTRAL`.
- Given `act-arrow-empty`, when the gate runs, then it is at 0 diffs.

Observability: N/A. Rollback: Reversible.
