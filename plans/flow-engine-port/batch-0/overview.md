# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/flow-engine-port/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/flow-engine-port
git commit -m "docs(flp): add the flow-engine-port brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/flp-b0
git show <base>:tests/oracle/svg-conformance/parity-unknown.json > /tmp/flp-b0/parity-unknown.json
node plans/flow-engine-port/measurements/flow-rows.mjs /tmp/flp-b0 --json /tmp/flp-b0/rows.json
mkdir -p /tmp/flp-plan/oracle
scripts/oracle-render.sh /tmp/flp-plan/oracle plans/flow-engine-port/probes/*.puml
```

The last line restores the planning probe oracles if `/tmp` was cleared. The jar exits non-zero (200) because 13 probes
are jar error pages; that is expected. A restored oracle of a multi-box probe can differ in box order from the planning
one (D4); that is expected too.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given `flow-rows.mjs`, then it prints `rows 1 {"unknown":{"diverged":1}}`, and the journal records it. A different
  count means the cache moved since planning: journal the delta and use the new rows.

Observability: N/A — no new observable operations. Rollback: Reversible.
