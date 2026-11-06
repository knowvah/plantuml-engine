# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/chart-engine-port/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/chart-engine-port
git commit -m "docs(cep): add the chart-engine-port brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/cep-b0
git show <base>:tests/oracle/svg-conformance/parity-chart.json > /tmp/cep-b0/parity-chart.json
npx jiti plans/chart-engine-port/measurements/row-diffs.mts /tmp/cep-b0/parity-chart.json /tmp/cep-b0/diffs.json
```

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and journal row 1 holds the start time.
- Given `row-diffs`, then it prints `rows 29`, and the journal records each row's diff count.

Observability: N/A — no new observable operations. Rollback: Reversible.
