# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T6 | Verify the done-when list, then close out | orchestrator | README status, memory | T5 | [x] |

## T6

```sh
# <base> is the mission base sha named in the execution prompt
node plans/parity-dashboard-repair/measurements/check-fresh.mjs <mission-start-from-journal-row-1>
node plans/parity-dashboard-repair/measurements/verdict-diff.mjs <base>
node plans/parity-dashboard-repair/measurements/pins-vs-census.mjs
git diff --stat <base> HEAD -- src/   # must be empty
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
```

Mark the README status and done-when list. File a status memory and its `MEMORY.md` line.
Commit `docs(pdg): close out`, recording the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0, and the `src/` diff is empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
