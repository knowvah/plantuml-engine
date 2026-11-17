# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2 | Final measure, follow-on issues, d.ts check, ledger | orchestrator | gates, `planning/next-missions.md`, README | T1b | [x] |

## T2

1. Run the measurer. Every gate row is `ZERO`, or `OPEN` naming a filed issue (D2).
2. File one `queue:ready` + `parity` issue per separable residual, with the probe source, both outputs' key attributes
   and the upstream `file:line`. None is expected; journal "none" if so.
3. Run `npm run build` and diff `dist/*.d.ts` against `/tmp/uts-base-dts/`. Any change is stop 5.
4. Confirm `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged since `<base>` (D4).
5. Add a "usecase-title-style (uts)" section to `planning/next-missions.md` naming any issue from step 2, or saying
   there are none.
6. Run the batch close. Then write the README's `## Summary` (tasks, gates, verdicts base → exit, probes start → exit,
   d.ts, follow-ons, CI risk), following `plans/unresolved-colour/README.md`.

## Acceptance
- Given the exit tree, when the authored gate runs, then every `OPEN` row names a filed issue.
- Given `verdict-diff.mjs <base>`, when run, then it reports 0 lost in every engine.
- Given the d.ts snapshot, when diffed, then it is byte-identical.

Observability is N/A. Rollback is Reversible.
