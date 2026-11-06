# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/packet-engine-port/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/packet-engine-port
git commit -m "docs(pep): add the packet-engine-port brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/pep-b0
git show <base>:tests/oracle/svg-conformance/parity-packet.json > /tmp/pep-b0/parity-packet.json
npx jiti plans/packet-engine-port/measurements/row-diffs.mts /tmp/pep-b0/parity-packet.json /tmp/pep-b0/diffs.json
```

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and journal row 1 holds the start time.
- Given `row-diffs`, then it prints `rows 6`, and the journal records each row's diff count.

Observability: N/A — no new observable operations. Rollback: Reversible.
