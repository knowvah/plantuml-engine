# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Re-measure every engine, check the d.ts, regenerate reports, comment on #204 | orchestrator | reports, README, journal | T2c | [x] |

## T3

1. `npx tsx plans/hidden-note-host/measurements/measure.mts tests/fixtures/hidden-note-host /tmp/hnh-final.json`;
   copy the summary line and every nonzero row's reason into the README's "Mission summary".
2. `npm run build`, then `diff -r /tmp/hnh-base-dts dist` restricted to `*.d.ts`: it must be empty (D6).
3. `npm run svg:survey`, `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: 0 lost.
4. `npm run parity:dashboard`, `npm run catalog`; commit the reports.
5. For each side finding a push-forward fixed, comment on its issue with the commit and the rows. Leave it open; it
   closes when the branch merges.
6. Comment on #204 (`gh issue comment 204 --body-file <file>`): the rows and their final numbers, I1 to I7 with their
   numbers, D3 (three engines, not one) as the decision to review, and that the issue closes when the branch merges.
   Do not close it.
7. Tick the README's "Done when" and batch table; write "Mission summary"; run the README gates; commit.

## Acceptance
- Given the final tree, then the d.ts diff is empty, verdict-diff shows 0 lost, and the README gates pass.
- Given #204, then it carries the comment and is still open.

Observability is N/A. Rollback is Reversible.
