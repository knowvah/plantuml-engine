# Batch 1 — the ratchet test (D4)

TDD for the whole mission: the test lands first, green, with every current offender in `PENDING`. Each batch-2
task shrinks `PENDING`; T8 deletes it.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1](T1-legacy-name-ratchet.md) | `tests/architecture/legacy-name.test.ts` with `ALLOWED` + `PENDING` | executor | `tests/architecture/legacy-name.test.ts` | T0 | [ ] |

Close: full gate set green.
