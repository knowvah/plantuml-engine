# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T10 | Verify the done-when list, then close out | orchestrator | README status, memory | T9 | [ ] |

## T10

```sh
# <base> is the mission base sha named in the execution prompt
node plans/oracle-gap-capture/measurements/verdict-diff.mjs <base>
node plans/oracle-gap-capture/measurements/pins-vs-census.mjs
git diff --stat <base> HEAD -- src/   # must be empty
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
```

Mark the README status and done-when list, and add a Summary section: tasks, gates with counts, measured against trial, and the routing
and refusal wall clock before and after. **Name the CI risk in that summary:** routing and refusal walk about 12% more, and activity adds
429 per-fixture tests, unmeasured on the runner until the first PR run. File a status memory at `.claude/memory/ogc-status.md` and its
`MEMORY.md` line, and note in `parity-issue-queue.md` that #109 added rows. Commit `docs(ogc): close out`, recording the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0, and the `src/` and accepted-divergences diffs are empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
