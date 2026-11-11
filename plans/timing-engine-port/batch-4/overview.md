# Batch 4 — turn on, probes, residuals

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4a | Register the engine, drop `@starttiming`, wire the clock zone, first survey | orchestrator | see task file | T3c | [x] |
| T4b | Copy the planning probes, author the D11 probes, render oracles | orchestrator or typescript-pro | `tests/fixtures/timing/**`, `oracle/capture-clock.json` | T4a | [x] |
| T4c | Residuals on the 139 `timing`-bucket rows | orchestrator or typescript-pro | `src/diagrams/timing/**`, shared modules a residual reaches | T4a | [x] |
| T4d | Residuals on the 13 `unknown` rows, the fixtures, and `{{ }}` | orchestrator or typescript-pro | same as T4c | T4b, T4c | [x] |

Serial (D15). T4c and T4d may split by mechanism into T4c1, T4c2, … (push-forward); each split is its own commit and
journal line. Re-read rows with `row-diffs.mts` after every fix (task contract step 5).

## Batch close

The task contract's batch close, steps 1 to 4: the full survey, `verdict-diff` 0 lost in every engine, and the six
jar-error rows still conformant (D8).
