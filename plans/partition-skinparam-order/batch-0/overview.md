# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, restore the planning oracles, snapshot the d.ts | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/partition-skinparam-order/ and .agent-notes/pso-planning.md may appear
git branch --show-current   # must print feature/parity-queue
dot -V   # must print 16.1.0
git config --worktree commit.gpgsign false
git add plans/partition-skinparam-order .agent-notes/pso-planning.md
git commit -m "docs(pso): add the partition-skinparam-order brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
```

If `/tmp/pso-plan/fx/` is gone, restore it as [task-contract.md](../task-contract.md#restoring-the-planning-oracles)
says. Then re-measure: `npx jiti plans/style-mode-cascades/measurements/rows.mts /tmp/pso-plan/fx` must print
`rows 43 open 14`.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`. `verdict-diff.mjs`
reads it from the ref, so T0 needs no survey. Snapshot the base `dist/*.d.ts` for T3: run `npm run build`, then copy
the files to `/tmp/pso-base-dts/`.

Batch 0 closes with the gates in the README. Typecheck, build and `format:check` were not run at planning, so this is
their first run on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit,
  and journal row 1 holds the start time.
- Given `/tmp/pso-plan/fx/`, then `rows.mts` measures 43 rows with 14 open.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
