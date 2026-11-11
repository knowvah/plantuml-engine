# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/timing-engine-port/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/timing-engine-port
git commit -m "docs(tep): add the timing-engine-port brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/tep-b0
git show <base>:tests/oracle/svg-conformance/parity-timing.json > /tmp/tep-b0/parity-timing.json
git show <base>:tests/oracle/svg-conformance/parity-unknown.json > /tmp/tep-b0/parity-unknown.json
node plans/timing-engine-port/measurements/timing-rows.mjs /tmp/tep-b0 --json /tmp/tep-b0/rows.json
mkdir -p /tmp/tdp-plan/oracle
scripts/oracle-render.sh /tmp/tdp-plan/oracle plans/timing-engine-port/probes/*.puml
```

The last line restores the planning probe oracles if `/tmp` was cleared; the jar exits non-zero because four probes
are jar error pages, which is expected. It also records capture-clock rows only for `tests/fixtures/` and the corpus
cache, so it writes nothing for `plans/` probes.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given `timing-rows.mjs`, then it prints
  `rows 158 {"timing":{"diverged":139,"conformant":6},"unknown":{"diverged":13}}`, and the journal records it. A
  different count means the cache moved since planning: journal the delta and use the new rows.

Observability: N/A — no new observable operations. Rollback: Reversible.
