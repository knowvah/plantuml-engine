# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/legacy-activity-engine-port/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/legacy-activity-engine-port
git commit -m "docs(laep): add the legacy-activity-engine-port brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/laep-b0
git show <base>:tests/oracle/svg-conformance/parity-activity.json > /tmp/laep-b0/parity-activity.json
git show <base>:tests/oracle/svg-conformance/parity-unknown.json > /tmp/laep-b0/parity-unknown.json
git show <base>:tests/oracle/svg-conformance/parity-network.json > /tmp/laep-b0/parity-network.json
node plans/legacy-activity-engine-port/measurements/legacy-rows.mjs /tmp/laep-b0
npm run build
mkdir -p /tmp/laep-b0/dts
cp dist/*.d.ts /tmp/laep-b0/dts/   # T5 compares the final d.ts against these
scripts/oracle-render.sh /tmp/laep-probes plans/legacy-activity-engine-port/probes/lap-basic.puml
```

The last line checks the jar still renders; T3c renders the rest one directory per source. If `<base>` is not
`2313f74e0`, rerun `legacy-rows.mjs` on the committed surveys and journal any count that moved since planning.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit
  and journal row 1 holds the start time.
- Given `legacy-rows.mjs /tmp/laep-b0`, then it prints `rows 124` with activity 118, unknown 4, network 2, all
  diverged, and the journal records it.

Observability: N/A — no new observable operations. Rollback: Reversible.
