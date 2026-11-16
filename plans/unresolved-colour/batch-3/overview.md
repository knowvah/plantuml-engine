# Batch 3: description

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3a | M1: link arrow-style colour token → `getColorOrWhite` | orchestrator or typescript-pro | `link-grammar.ts` | T2c | [x] |
| T3b | M2: entity and link `name:value` parts → `getColorOrNull` | orchestrator or typescript-pro | `renderer-color-override.ts`, `link-colors.ts` | T3a | [x] |

[T3a](T3a-desc-arrow.md) · [T3b](T3b-desc-name-value.md).

Every task runs `description.golden.ratchet.test.ts`, `description.diff-baseline.ratchet.test.ts` and
`tests/oracle/description-parity.ratchet.test.ts`, then the `component`, `usecase` and `unknown` surveys with `--out`.

Batch close: the task contract's batch close.

Observability is N/A for every task here (task contract). Rollback is Reversible: revert the task commit.
