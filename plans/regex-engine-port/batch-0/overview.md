# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/regex-engine-port/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/regex-engine-port
git commit -m "docs(rep): add the regex-engine-port brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/rep-b0
git show <base>:tests/oracle/svg-conformance/parity-regex.json > /tmp/rep-b0/parity-regex.json
node plans/regex-engine-port/measurements/regex-rows.mjs /tmp/rep-b0 --json /tmp/rep-b0/rows.json
mkdir -p /tmp/rep-plan/oracle
scripts/oracle-render.sh /tmp/rep-plan/oracle plans/regex-engine-port/probes/*.puml
```

The last line restores the planning probe oracles if `/tmp` was cleared; the jar exits non-zero because 12 probes are
jar error pages, which is expected.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given `regex-rows.mjs`, then it prints `rows 46 {"regex":{"diverged":46}}`, and the journal records it. A different
  count means the cache moved since planning: journal the delta and use the new rows.

Observability: N/A — no new observable operations. Rollback: Reversible.
