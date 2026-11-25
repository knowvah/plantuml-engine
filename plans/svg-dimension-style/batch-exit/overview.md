# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Final measure, follow-on issue, d.ts check, ledger | orchestrator | gates, `planning/next-missions.md`, README | T4 | [x] |

## T5

1. Run the measurer: `rows 33 exact 33 dims 0 other 0` (more rows if push-forward probes joined; all `EXACT`). The
   gate's `OPEN` list is empty.
2. File the out-of-scope finding from D5 as a `queue:ready` + `parity` issue, after checking for a duplicate
   (`gh issue list --search "Welcome" --state all`; #263 is the nearest): the probe source, both outputs' first texts
   (jar: "Welcome to PlantUML!"; ours: class `A`), and the upstream `file:line` of the path that refuses it, once read.
   Then add `Blocked by #<N>.` to #136's body, as earlier missions did. Journal the number.
3. Run `npm run build` and diff `dist/*.d.ts` against `/tmp/sds-base-dts/`. Any change is stop 5.
4. Confirm `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged since `<base>` (D4).
5. Add an "svg-dimension-style (sds)" section to `planning/next-missions.md` naming the issue from step 2.
6. Run the batch close. Then write the README's `## Summary` (tasks, gates, verdicts base → exit, probes start → exit,
   d.ts, follow-ons), following `plans/usecase-title-style/README.md`.

## Acceptance
- Given the exit tree, when the authored gate runs, then every row is `EXACT`.
- Given `verdict-diff.mjs <base>`, when run, then it reports 0 lost in every engine.
- Given the d.ts snapshot, when diffed, then it is byte-identical.

Observability is N/A. Rollback is Reversible.
