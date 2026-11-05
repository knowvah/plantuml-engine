# Batch 4 — probes past the rows, then pins

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T4a](T4a-probes.md) | Authored object, map and json probes against the jar | orchestrator | `tests/fixtures/odd-T4a/`, one test, fixes | T3d | [x] |
| [T4b](T4b-pins.md) | Pin every conformant row in the `svg-object` ratchet | orchestrator | ratchet test, goldens, baselines | T4a | [x] |

Close per [task-contract.md](../task-contract.md).
