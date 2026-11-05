# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/object-divergence-drive/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/object-divergence-drive
git commit -m "docs(odd): add the object-divergence-drive brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/odd-b0
git show <base>:tests/oracle/svg-conformance/parity-object.json > /tmp/odd-b0/parity-object.json
npx jiti plans/object-divergence-drive/measurements/row-diffs.mts /tmp/odd-b0/parity-object.json /tmp/odd-b0/diffs.json
```

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and journal row 1 holds the start time.
- Given `row-diffs`, then it prints `rows 16`, and the journal records the diff count of each row, which at planning read: `gatefi` 2, `gubene` 8, `lisepi` 2, `lunike` 205, `maxosa` 41, `nulixu` 13, `pikuba` 113, `satuco` 23, `sibika` 13, `sivapa` 16, `style-stereotype-on-arrow-7` 2, `tenalu` 22, `togixe` 71, `vocute` 13, `zicope` 24, `zuvila` 8.

Observability: N/A — no new observable operations. Rollback: Reversible.
