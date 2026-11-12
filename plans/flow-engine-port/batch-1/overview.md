# Batch 1 — golem, activity box

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | Port the reachable `golem` classes | orchestrator or typescript-pro | `src/core/golem/**`, `tests/unit/golem/**` | T0 | [x] |
| T1b | Port `ActivityBox` | orchestrator or typescript-pro | `src/diagrams/flow/ActivityBox.ts`, `tests/unit/flow/ActivityBox.test.ts` | T0 | [x] |

The two write-sets are disjoint, but run them serially in the main checkout (D9).

## Batch close
Gates from the README (no survey yet: nothing is reachable from `renderSync`). Tick, journal, `chore(flp): close batch 1`.
