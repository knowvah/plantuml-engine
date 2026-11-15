# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Final measure, follow-on issues, d.ts check, ledger | orchestrator | gates, `planning/next-missions.md`, README | T3b | [x] |

## T4

1. Run both measurers. The authored gate must hold no `invalid: true` flag, and the corpus scan must print
   `scanned 5938 … invalid 0`.
2. File one `queue:ready` + `parity` issue per out-of-scope probe, each with the probe source, both outputs' key
   attributes, and the upstream `file:line`. Re-measure each first:
   - `act-arrow`: the jar errors (`No such color`); we draw the default instead of the #143 neutral. Find the activity-3
     arrow colour parse (`CommandArrow3` or its `LinkRendering` colour) and cite it;
   - `obj-line`: the jar errors for any `object O #line:<c>`; we draw with the raw value. Cite the object command's
     colour capture;
   - `class-arrow-multi` (`-[#zzblue;#red]->`): the jar errors with "Syntax Error?"; we draw. Check whether
     `-[#blue;#red]->` also errors in the jar before filing;
   - `uc-actor-line` (`actor X #line:red`): we route to sequence, the jar to description.
   `seq-declared-arrow` and `seq-participant-line` need no issue: both sides error, which is conformant under the
   2026-10-10 rule. Journal that.
3. Run `npm run build` and diff `dist/*.d.ts` against `/tmp/ucol-base-dts/`. Any change is stop 5.
4. Confirm `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged since `<base>` (D4).
5. Add a "unresolved-colour (ucol)" section to `planning/next-missions.md` naming the issues from step 2.
6. Run the batch close. Then write the README's `## Summary` (tasks, gates, verdicts base → exit, probes start → exit,
   d.ts, follow-ons, CI risk), following `plans/edge-label-embed/README.md`.

## Acceptance
- Given the exit tree, when the authored gate runs, then every row asserts no invalid colour, and every `OPEN` row
  names a filed issue.
- Given `verdict-diff.mjs <base>`, when run, then it reports 0 lost in every engine.
- Given the d.ts snapshot, when diffed, then it is byte-identical.

Observability is N/A. Rollback is Reversible.
