# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/ebnf-engine-port/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/ebnf-engine-port
git commit -m "docs(eep): add the ebnf-engine-port brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/eep-b0
git show <base>:tests/oracle/svg-conformance/parity-ebnf.json > /tmp/eep-b0/parity-ebnf.json
node plans/ebnf-engine-port/measurements/ebnf-rows.mjs /tmp/eep-b0 --json /tmp/eep-b0/rows.json
mkdir -p /tmp/eep-plan/oracle
scripts/oracle-render.sh /tmp/eep-plan/oracle plans/ebnf-engine-port/probes/*.puml
```

The last line restores the planning probe oracles if `/tmp` was cleared; the jar exits non-zero because four probes are
jar error pages, which is expected.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given `ebnf-rows.mjs`, then it prints `rows 44 {"ebnf":{"diverged":44}}`, and the journal records it. A different
  count means the cache moved since planning: journal the delta and use the new rows.

Observability: N/A — no new observable operations. Rollback: Reversible.
