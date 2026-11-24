# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Re-measure every engine, check the d.ts, regenerate reports, comment on #158 | orchestrator | reports, README, journal | T3b | [x] |

## T4

1. `npx tsx plans/legacy-activity-elk/measurements/measure.mts tests/fixtures/activity-legacy /tmp/lae-final.json`;
   copy the summary line and every nonzero row's reason into the README's "Mission summary".
2. `npm run build`, then `diff -r /tmp/lae-base-dts dist` restricted to `*.d.ts`: it must be empty (D7).
3. `npm run svg:survey`, `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: 0 lost.
4. `npm run parity:dashboard`, `npm run catalog`; commit the reports.
5. Check `docs/catalog.md` and `planning/mission-guide.md`: if the mission guide's ELK notes name the legacy engine as
   unported, update the line.
6. Comment on #158 (`gh issue comment 158 --body-file <file>`): the rows and their final scores, every filed issue,
   D1 and D3 as the two decisions to review, and that the issue closes when the branch merges. Do not close it.
7. Tick the README's "Done when" and batch table; write "Mission summary"; run the README gates; commit.

## Acceptance
- Given the final tree, then the d.ts diff is empty, verdict-diff shows 0 lost, and the README gates pass.
- Given #158, then it carries the comment and is still open.

Observability is N/A. Rollback is Reversible.
