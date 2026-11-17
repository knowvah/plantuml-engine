# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2 | Final measure, d.ts check, next-missions, summary | orchestrator | gates, `planning/next-missions.md`, README | T1b | [x] |

## T2

1. Run `npm run build` and diff `dist/*.d.ts` against `/tmp/vb-base-dts/`. Any change is stop 5.
2. Confirm `git diff <base> -- oracle/accepted-divergences.json` adds exactly one entry and retires none.
3. Add a "version-builtin (vb)" section to `planning/next-missions.md`: what landed, and any issue filed during the
   mission.
4. Run the batch close. Then write the README's `## Summary` (tasks, gates, verdicts base → exit, the row before and
   after, d.ts, follow-ons, CI risk), following `plans/class-comment-bytes/README.md`.

## Acceptance
- Given `verdict-diff.mjs <base>`, when it runs, then it reports 0 lost in every engine.
- Given the d.ts snapshot, when diffed, then it is byte-identical.

Observability is N/A. Rollback is Reversible.
