# Batch 0: brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, restore the planning oracles | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/chen-eer-engine-port/ may appear
git branch --show-current   # must print feature/parity-queue
dot -V   # must print 16.1.0
git config --worktree commit.gpgsign false
git add plans/chen-eer-engine-port
git commit -m "docs(ceep): add the chen-eer-engine-port brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
```

If `/tmp/cee-plan/po/` is gone, restore it as [task-contract.md](../task-contract.md#restoring-the-planning-oracles)
says, one directory per probe so that each DOT is `svek-1.dot`. The 10 error probes make the jar exit non-zero. That is
expected.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`. `verdict-diff.mjs`
reads it from the ref, so T0 needs no survey.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given `/tmp/cee-plan/po/`, then it holds 48 directories, and 38 of the SVGs carry `data-diagram-type="CHEN_EER"`.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
