# Batch 0 — brief and pins

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |
| T0b | Pin the conformant rows #109 captured | orchestrator | `oracle/goldens/svg-description/`, gate baselines | T0 | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/description-divergence-drive/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/description-divergence-drive
git commit -m "docs(ddd): add the description-divergence-drive brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/ddd-b0
git show <base>:tests/oracle/svg-conformance/parity-component.json > /tmp/ddd-b0/parity-component.json
git show <base>:tests/oracle/svg-conformance/parity-usecase.json > /tmp/ddd-b0/parity-usecase.json
git show <base>:tests/oracle/svg-conformance/parity-unknown.json > /tmp/ddd-b0/parity-unknown.json
npx jiti plans/description-divergence-drive/measurements/row-diffs.mts /tmp/ddd-b0 /tmp/ddd-b0-diffs.json
```

**Acceptance:** given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit
and journal row 1 holds the start time; given `row-diffs`, then it prints `rows 208`.

## T0b

```sh
npx jiti plans/description-divergence-drive/measurements/pin-description.mts tests/oracle/svg-conformance b0   # read it
npx jiti plans/description-divergence-drive/measurements/pin-description.mts tests/oracle/svg-conformance b0 --write
npx vitest run tests/oracle/svg-conformance/description.golden.ratchet.test.ts   # read the collected count
```

The planned count is in README "Starting state". A skip line names its reason: journal any skip that is not an error page or an `ourType` a later task flips.
Commit `test(description): pin the rows #109 captured`.

**Acceptance:** given the pins, when the ratchet and the routing and refusal gates run, then they pass with the larger collected count, and no existing pin rose.

Batch close: [task-contract.md](../task-contract.md). Observability: N/A — no new observable operations. Rollback: Reversible.
