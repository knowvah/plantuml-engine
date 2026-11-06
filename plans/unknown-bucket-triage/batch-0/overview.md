# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/unknown-bucket-triage/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/unknown-bucket-triage
git commit -m "docs(ubt): add the unknown-bucket-triage brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/ubt-b0
git show <base>:tests/oracle/svg-conformance/parity-unknown.json > /tmp/ubt-b0/parity-unknown.json
git show <base>:tests/oracle/svg-conformance/parity-activity.json > /tmp/ubt-b0/parity-activity.json
git show <base>:tests/oracle/svg-conformance/parity-state.json > /tmp/ubt-b0/parity-state.json
git show <base>:tests/oracle/svg-conformance/parity-sequence.json > /tmp/ubt-b0/parity-sequence.json
node plans/unknown-bucket-triage/measurements/scope.mjs /tmp/ubt-b0/parity-unknown.json --ubt
npx jiti plans/unknown-bucket-triage/measurements/row-diffs.mts /tmp/ubt-b0/parity-unknown.json /tmp/ubt-b0/diffs.json
```

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit
  and journal row 1 holds the start time.
- Given `scope.mjs --ubt`, then it lists 18 rows (`ubt ACTIVITY` 12, `HCL` 2, `SUDOKU` 2, `SEQUENCE` 1, `STATE` 1)
  and no `??` owner; the journal records that line.
- Given `row-diffs`, then it prints `rows 203`, and the journal records the diff count of each of the 14 rows
  batches 1 and 2 own.

Observability: N/A — no new observable operations. Rollback: Reversible.
