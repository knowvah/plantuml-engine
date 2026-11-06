# Batch 4 — probes past the rows, then pins

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T4a](T4a-probes.md) | Authored C4 and DomainStory probes against the jar | orchestrator | `tests/fixtures/c4dd-T4a/`, whatever a defect needs | T3b | [x] |
| [T4b](T4b-pins.md) | Pin the `c4` rows in the ratchets that own them | orchestrator | ratchet tests, `description-eligibility.ts`, `oracle/goldens/`, `scripts/parity-dashboard*.ts` | T4a | [x] |

Close per [task-contract.md](../task-contract.md).
