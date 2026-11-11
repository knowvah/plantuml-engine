# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/wire-engine-port/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/wire-engine-port
git commit -m "docs(wrp): add the wire-engine-port brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/wrp-b0
git show <base>:tests/oracle/svg-conformance/parity-wire.json > /tmp/wrp-b0/parity-wire.json
node plans/wire-engine-port/measurements/wire-rows.mjs /tmp/wrp-b0 --json /tmp/wrp-b0/rows.json
mkdir -p /tmp/wrp-plan/oracle
scripts/oracle-render.sh /tmp/wrp-plan/oracle plans/wire-engine-port/probes/*.puml
```

The last line restores the planning probe oracles if `/tmp` was cleared; the jar exits non-zero because some probes are
jar error pages, which is expected. It records capture-clock rows only for `tests/fixtures/` and the corpus cache, so it
writes nothing for `plans/` probes.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given `wire-rows.mjs`, then it prints `rows 18 {"wire":{"diverged":18}}`, and the journal records it. A different
  count means the cache moved since planning: journal the delta and use the new rows.

Observability: N/A — no new observable operations. Rollback: Reversible.
