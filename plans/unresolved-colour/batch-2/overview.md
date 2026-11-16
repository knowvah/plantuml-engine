# Batch 2: class

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | M1: link arrow-style colour token → `getColorOrWhite` | orchestrator or typescript-pro | `class-arrow-grammar.ts` | T1a | [x] |
| T2b | M2: `name:value` parts → `getColorOrNull`, and the link's trailing colour grammar | orchestrator or typescript-pro | class colour parsers, `core/color-override.ts` | T2a | [x] |
| T2c | M3: class `<style>` colour values → `ValueImpl.asColor` | orchestrator or typescript-pro | `core/style-cascade-class*.ts`, theme | T2b | [x] |

[T2a](T2a-class-arrow.md) · [T2b](T2b-class-name-value.md) · [T2c](T2c-class-style.md).

The tasks run serially: T2b and T2c may share `class-relationship-colors.ts` and the theme readers. Every task runs the
class and object ratchets (`class.golden.ratchet.test.ts`, `tests/oracle/class-dot-parity.test.ts`,
`object-dot-parity.test.ts`) and the class survey after its `src/` change.

Batch close: the task contract's batch close.

Observability is N/A for every task here (task contract). Rollback is Reversible: revert the task commit.
