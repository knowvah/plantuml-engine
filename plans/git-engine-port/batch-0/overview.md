# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/git-engine-port/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/git-engine-port
git commit -m "docs(gip): add the git-engine-port brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/gip-b0
git show <base>:tests/oracle/svg-conformance/parity-unknown.json > /tmp/gip-b0/parity-unknown.json
node plans/git-engine-port/measurements/git-rows.mjs /tmp/gip-b0 --json /tmp/gip-b0/rows.json
mkdir -p /tmp/gip-plan/oracle
scripts/oracle-render.sh /tmp/gip-plan/oracle plans/git-engine-port/probes/*.puml
```

The last line restores the planning probe oracles if `/tmp` was cleared. The jar exits non-zero because 4 probes are
jar crash pages; that is expected.

Then read every adapted tool under `measurements/` once. They were produced at planning by substituting `bpm`→`git`,
and only `git-rows.mjs` was run. Fix and journal anything that still assumes bpm: row counts, a `BPM` type string, or
`svg-bpm` paths.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given `git-rows.mjs`, then it prints `rows 4 {"unknown":{"diverged":4}}`, and the journal records it. A different
  count means the cache moved since planning: journal the delta and use the new rows.

Observability: N/A — no new observable operations. Rollback: Reversible.
