# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/c4-divergence-drive/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/c4-divergence-drive
git commit -m "docs(c4dd): add the c4-divergence-drive brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/c4dd-b0
git show <base>:tests/oracle/svg-conformance/parity-c4.json > /tmp/c4dd-b0/parity-c4.json
npx jiti plans/c4-divergence-drive/measurements/row-diffs.mts /tmp/c4dd-b0/parity-c4.json /tmp/c4dd-b0/diffs.json
```

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and journal row 1 holds the start time.
- Given `row-diffs`, then it prints `rows 4`, and the journal records the diff counts 3, 6, 22 and 21.

Observability: N/A — no new observable operations. Rollback: Reversible.
