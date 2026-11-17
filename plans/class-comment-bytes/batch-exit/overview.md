# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2 | File residues, final measure, d.ts check, ledger | orchestrator | gates, `planning/next-missions.md`, README | T1e | [x] |

## T2

1. **Residues.** Any open-list entry or gate row still above 0 is a mechanism outside D1-D3. Read the Java for it, then
   file a `queue:ready` + `parity` issue with the row, both comment sequences, and the upstream and our `file:line`.
   Check `gh issue list --state open --search "comment"` first, so you do not file a duplicate. Point the entry's
   `reason` at the issue.
2. Run the measurer. Every pin and gate row is equal, or names a filed issue.
3. Run `npm run build` and diff `dist/*.d.ts` against `/tmp/ccb-base-dts/`. Any change is stop 5.
4. Confirm `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged since `<base>` (D5).
5. Add a "class-comment-bytes (ccb)" section to `planning/next-missions.md`, naming any issue from step 1.
6. Run the batch close. Then write the README's `## Summary` (tasks, gates, verdicts base → exit, comment rows
   start → exit, d.ts, follow-ons, CI risk), following `plans/emoji-edge-artwork/README.md`.

## Acceptance
- Given the exit tree, when both ratchets run, then every open-list entry names a filed issue, or the lists are empty.
- Given `verdict-diff.mjs <base>`, when it runs, then it reports 0 lost in every engine.
- Given the d.ts snapshot, when diffed, then it is byte-identical.

Observability is N/A. Rollback is Reversible.
