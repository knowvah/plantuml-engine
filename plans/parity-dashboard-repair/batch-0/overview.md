# Batch 0 — branch

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief on the work branch, record the start time | orchestrator | this brief | — | [x] |

## T0

```sh
git status --porcelain   # only plans/parity-dashboard-repair/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/parity-dashboard-repair
git commit -m "docs(pdg): add the parity-dashboard-repair brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start, for check-fresh.mjs
```

**Acceptance:** given the driver has checked out `feature/parity-queue`, when T0
finishes, then `git log -1` is the brief commit on it and journal row 1 holds the start
time.

Observability: N/A — no new observable operations. Rollback: Reversible.
