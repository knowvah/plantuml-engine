# Batch 0 — brief and pins

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start and the baseline | orchestrator | this brief | — | [x] |
| T0b | Pin the 11 conformant rows #109 captured | orchestrator | `oracle/goldens/svg-state/` | T0 | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/state-divergence-drive/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/state-divergence-drive
git commit -m "docs(stdd): add the state-divergence-drive brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
git show <base>:tests/oracle/svg-conformance/parity-state.json > /tmp/stdd-b0.json
npx jiti plans/state-divergence-drive/measurements/row-diffs.mts /tmp/stdd-b0.json /tmp/stdd-b0-diffs.json
```

**Acceptance:** given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit
and journal row 1 holds the start time; given `row-diffs`, then it prints `rows 174`.

## T0b

```sh
node plans/state-divergence-drive/measurements/pin-state.mjs 2026-11-04 --dry   # planned: added 11, refused 0
node plans/state-divergence-drive/measurements/pin-state.mjs 2026-11-04
npx vitest run tests/oracle/svg-conformance/state.golden.ratchet.test.ts   # read the collected count
```

Update the count in `oracle/goldens/svg-state/README.md` only if it states one. Commit `test(state): pin the 11 rows #109 captured`.

**Acceptance:** given the pins, when the ratchet runs, then it collects 121 AC1 fixtures and passes, and
`node plans/state-divergence-drive/measurements/pins-vs-census.mjs` exits 0.

Batch close: [task-contract.md](../task-contract.md). Observability: N/A — no new observable operations. Rollback: Reversible.
