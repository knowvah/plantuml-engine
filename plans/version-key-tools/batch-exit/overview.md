# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Final measure, d.ts check, next-missions, summary, issue comment | orchestrator | gates, `planning/next-missions.md`, README | T2b | [x] |

## T3

1. Run `npm run build` and diff `dist/*.d.ts` against `/tmp/vkt-base-dts/`. Any change is stop 5.
2. Confirm `git diff <base> -- oracle/accepted-divergences.json` adds only `authored-utility/*` entries and retires
   none.
3. Add a "version-key-tools (vkt)" section to `planning/next-missions.md`: what landed, and any issue filed.
4. Run the batch close. Then write the README's `## Summary` (tasks, gates, verdicts base → exit, the rows and their
   scores, d.ts, follow-ons, CI risk), following `plans/version-builtin/README.md`.
5. Prepare the issue comment for the driver's morning report (post it with `gh issue comment 182` only if the
   execution prompt says so): the D5 texts as landed, for review; `cov-keydistributor`'s verdict; and the D7
   question, "should `version` adopt rulings 2-4 so both pages print the same Graphviz block, as upstream's do?"

## Acceptance
- Given `verdict-diff.mjs <base>`, when it runs, then it reports 0 lost in every engine.
- Given the d.ts snapshot, when diffed, then it is byte-identical.

Observability is N/A. Rollback is Reversible.
