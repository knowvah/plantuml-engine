# Batch 2: activity sites

Serial: every task drops `pending` flags in the same test file.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-arrow.md) | Arrow and `link` colours: neutral at `HtmlColorAndStyle.build`'s port | orchestrator or `typescript-pro` | `activity-rainbow.ts` + test, the gate | T1 | [x] |
| [T2b](T2b-swimlane.md) | Swimlane colour: neutral at `CommandSwimlane`'s port | orchestrator or `typescript-pro` | swimlane colour site + test, the gate | T2a | [x] |
| [T2c](T2c-note.md) | Note colour: neutral at the `Colors` bare-part port | orchestrator or `typescript-pro` | note colour site + test, the gate | T2b | [x] |

At close, the measurer over `tests/fixtures/unresolved-colour` must show all 17 `NEUTRAL` rows with `neutral true`,
no `invalid`, `ours draws`, and every `ZERO` row at 0. Then the [batch-close procedure](../task-contract.md#batch-close).
`unknown/duluve-89-mati167` stays `diverged` with `firstDiff: error-page`.
