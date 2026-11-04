# T5 — pin, install, wire the gate

One commit, so capture and pins land together:
`chore(oracle): capture 1016 fixtures that had no jar oracle`. Body: D1's mechanism in two sentences.

## Task

1. Pin each bucket from the stage, literally, for activity, class, dot, hcl, object, sequence, state, timing,
   unknown, yaml:
   `npx jiti scripts/pin-corpus-tree.ts <bucket> --tree test-results/ogc-stage/<bucket> --ledger tests/oracle/svg-conformance/unknown-ledger`
2. `git diff --numstat oracle/goldens/svg-conformance/`: 0 deletions apart from the `$comment` line, the
   additive proof. Stop condition 3 otherwise.
3. Install: `npx jiti scripts/capture-missing-oracles.ts --install test-results/ogc-stage`. Then
   `npx vitest run tests/oracle/svg-conformance/capture-clock.test.ts`, and read the collected count.
4. Add `tests/oracle/svg-conformance/oracle-coverage.test.ts`, on the real trees. Assert `missing` and
   `staleReasons` are both `[]`, with `oracled + reasoned` equal to the manifest row count. The failure
   message names `scripts/capture-missing-oracles.ts --stage` and `oracle/no-oracle-reasons.json`. Assert
   presence, never `skipIf` (the cache is committed).
5. Re-derive the hard-coded counts in `routing-conformance.test.ts` (8735, 8275, 374, 86 and neighbours) and
   `refusal-coverage.test.ts` (8735, 86, 217, 8518, 179 and neighbours), each with a derivation comment in the
   style already there. Prefer splitting an invariant over flattening it.
6. `npx vitest run tests/oracle/svg-conformance/routing-conformance.test.ts tests/oracle/svg-conformance/refusal-coverage.test.ts tests/oracle/svg-conformance/oracle-coverage.test.ts`:
   read the count. Record wall clock for routing and refusal against batch 1's, for T10.

## Write-set
`test-results/dot-cache/**`, `oracle/capture-clock.json` if a row is clock-dependent,
`oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, the two gate tests, the new coverage test.

## Read-set
[D3, D5](../decisions.md), `.claude/memory/new-corpus-tree-trips-two-gates.md`, commit `a8d6b3b70` for the shape.

## Interface contracts
Input: T3's stage and T4's fragments. Output to T6–T8: the installed cache, `oracle-coverage.test.ts`.

## Acceptance
- Given the pins, when `git diff --numstat` runs on both baselines, then deletions are only the `$comment` line.
- Given the install, when `oracle-coverage.test.ts` runs, then `missing` and `staleReasons` are `[]`.
- Given a manifest row with its cache dir renamed away, when the test runs, then it fails naming that row.
  Check by hand once, restore, journal it.
- Given routing and refusal, when they run, then both are green with every changed count carrying a derivation.

Observability: N/A — no new observable operations. Rollback: Reversible (revert; the capture is additive).
