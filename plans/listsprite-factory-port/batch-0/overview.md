# Batch 0: brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, restore the planning oracles | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/listsprite-factory-port/ may appear
git branch --show-current   # must print feature/parity-queue
dot -V   # must print 16.1.0
git config --worktree commit.gpgsign false
git add plans/listsprite-factory-port
git commit -m "docs(lsp): add the listsprite-factory-port brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
```

If `/tmp/lsp-plan/po/` is gone, restore it as [task-contract.md](../task-contract.md#restoring-the-planning-oracles)
says.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`. `verdict-diff.mjs`
reads it from the ref, so T0 needs no survey. Snapshot the base `dist/*.d.ts` (`npm run build`, copy to
`/tmp/lsp-base-dts/`) for T4.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given `/tmp/lsp-plan/po/`, then it holds 29 directories, and 24 of the SVGs carry `data-diagram-type="HELP"`.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
