# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2 | Final measure, d.ts check, next-missions, summary | orchestrator | gates, `planning/next-missions.md`, README | T1c | [x] |

## T2

1. Run `npm run build` and diff `dist/*.d.ts` against `/tmp/edp-base-dts/`. Any change is stop 5.
2. Confirm that `git diff <base> -- oracle/accepted-divergences.json DIVERGENCES.md` is empty (D1).
3. In `planning/next-missions.md`:
   - rewrite the class-oracle-gap-rows follow-on 1 (#185 `needs-ruling`) to say the rows conform since the
     `a720bdd` re-pin and are pinned by edp;
   - add an "embedded-diagram-preprocess (edp)" section at the top of the DONE list: what landed, D5's open banner
     question, and any issue filed during the mission.
4. Run the batch close. Then write the README's `## Summary` (tasks, gates, verdicts base → exit, the two rows before
   and after, d.ts, follow-ons, CI risk), following `plans/version-builtin/README.md`.

## Acceptance
- Given `verdict-diff.mjs <base>`, when it runs, then it reports 0 lost in every engine.
- Given the d.ts snapshot, when diffed, then it is byte-identical.

Observability is N/A. Rollback is Reversible.
