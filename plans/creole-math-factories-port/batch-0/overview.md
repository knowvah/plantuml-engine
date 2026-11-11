# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/creole-math-factories-port/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/creole-math-factories-port
git commit -m "docs(cmf): add the creole-math-factories-port brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/cmf-b0
git show <base>:tests/oracle/svg-conformance/parity-unknown.json > /tmp/cmf-b0/parity-unknown.json
node plans/creole-math-factories-port/measurements/factory-rows.mjs /tmp/cmf-b0 --json /tmp/cmf-b0/rows.json
mkdir -p /tmp/cmf-plan/oracle
scripts/oracle-render.sh /tmp/cmf-plan/oracle plans/creole-math-factories-port/probes/*.puml
```

The last line restores the planning probe oracles if `/tmp` was cleared. The jar exits non-zero because some probes are jar
error pages, which is expected. It records capture-clock rows only for `tests/fixtures/` and the corpus cache, so it writes
nothing for `plans/` probes.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and journal
  row 1 holds the start time.
- Given `factory-rows.mjs`, then it prints `rows 41` with `creole` 21, `math` 11, `help` 5, `latex` 2, `def` 2, all diverged, and
  the journal records it. A different count means the cache moved since planning: journal the delta and use the new rows.

Observability: N/A — no new observable operations. Rollback: Reversible.
