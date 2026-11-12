# Batch 2: turn on, fixtures, residuals

T2a makes the plugin reachable; from here every change is measured through `renderSync`. T2c splits into one task per
diff family that T2b's table shows (push-forward).

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | Export, plugin, registration at java:170, `@startsprites` tag, pinned lists | typescript-pro | see [T2a](T2a-turn-on.md) | T1b | [x] |
| T2b | 29 probes + authored fixtures into `tests/fixtures/factories/`, stability, family table | orchestrator | see [T2b](T2b-fixtures.md) | T2a | [x] |
| T2c | Residuals, one sub-task per family | typescript-pro | see [T2c](T2c-residuals.md) | T2b | [x] |

Close the batch as [task-contract.md](../task-contract.md#batch-close) says, survey included.
