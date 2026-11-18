# Batch 0 — brief and baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the baseline | orchestrator | `plans/insecure-path-egg/**` | — | [x] |

## T0

1. Check that `git status` is clean apart from this brief. Check that the branch is `feature/parity-queue`, at the base
   sha named in the execution prompt.
2. Check the reference jar: `md5 -q oracle/dist/plantuml-oracle.jar` must print `1e912cade94fbf96c06a22f4d44ef9b0`, the
   value recorded at planning.
3. Record the factories ratchet: `npm test -- tests/oracle/svg-conformance/factories` passes. Journal the three
   `cov-path-*` rows' weightedScore (5 each, `oracle/goldens/svg-factories/authored-baseline.json:1077-1121`).
4. Run `npm run typecheck && npm run build`. Planning ran only `npm test` and `npm run lint` (journal row 0). Journal the
   result. A red result here is pre-existing, so halt as blocked.
5. Commit `docs(ipe): add the insecure-path-egg mission brief` (`Refs: #178`).

## Acceptance

- Given the base sha, when T0 ends, then the brief is committed and journal row 1 holds the jar md5 and the three
  pins.
- Given the jar md5 differs, then stop: the oracle is not the one this brief was planned against.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
