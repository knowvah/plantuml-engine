# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/nwdiag-engine-port/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/nwdiag-engine-port
git commit -m "docs(nwp): add the nwdiag-engine-port brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/nwp-b0
git show <base>:tests/oracle/svg-conformance/parity-unknown.json > /tmp/nwp-b0/parity-unknown.json
node plans/nwdiag-engine-port/measurements/nwdiag-rows.mjs /tmp/nwp-b0 --json /tmp/nwp-b0/rows.json
```

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given `nwdiag-rows.mjs`, then it prints `rows 68 {"unknown":{"diverged":68}}`, and the journal records it. A different
  count means the cache moved since planning: journal the delta and use the new rows.

Observability: N/A — no new observable operations. Rollback: Reversible.
