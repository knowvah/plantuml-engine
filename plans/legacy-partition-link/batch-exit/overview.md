# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Every-engine measure, records, summary | orchestrator | reports, `planning/next-missions.md`, README | T2a | [x] |

## T3

1. Run the batch close, including `npm run svg:survey` (alone) and `verdict-diff.mjs <base>`. Activity may gain
   conformant rows; any row moving away from the jar is stop 1. Then `npm run parity:dashboard`: revert a
   `parity-*.json` whose only change is `generatedAt`; commit the rest with `docs/parity-report.md` and
   `docs-site/parity.md`.
2. `npm run catalog` (T1a exported from `Cluster.ts`); commit any drift.
3. Strike #157 in `plans/legacy-activity-engine-port/README.md:195` and in `planning/next-missions.md` where it is
   listed (`~~…~~ — **done by lpl (date, `legacy-partition-link/pre-squash`, #157)**`), and add a short
   "legacy-partition-link (lpl)" section: what landed and every issue filed.
4. Write the README's `## Summary` (tasks, gates, fixtures table with diffs, verdicts base → exit, DOT pins added,
   follow-ons, CI risk), following `plans/unread-theme-fields/README.md`.

## Acceptance
- Given `verdict-diff.mjs <base>`, when it runs, then it reports 0 losses in every engine.
- Given the README's "Done when", then every box is ticked with the journal row that proves it.

Observability is N/A. Rollback is Reversible.
