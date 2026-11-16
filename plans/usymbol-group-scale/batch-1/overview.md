# Batch 1: gate, group draw, header

Serial: T1b and T1c depend on T1a's gate file. T1c depends on T1b, because both edit
`class-namespace-usymbol-shape.ts` and T1c's splice relies on T1b's layout-unit draw.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-gate.md) | Move the probes into an authored gate; controls `ZERO`, the rest `OPEN` | orchestrator | `tests/fixtures/usymbol-group-scale/`, `usymbol-group-scale.authored.test.ts` | T0 | [x] |
| [T1b](T1b-group-draw.md) | Draw a USymbol group in layout units with `SvgOption.scale` (D1) | orchestrator or `typescript-pro` | `class-namespace-usymbol-shape.ts`, `renderer.ts`, unit test, the gate | T1a | [x] |
| [T1c](T1c-header-stereo.md) | Build the header stereo with deferred numbers, format once at `k` (D2) | orchestrator or `typescript-pro` | `class-cluster-header.ts`, `class-namespace-shape.ts`, `class-namespace-usymbol-shape.ts`, `class-scale-geo.ts`, unit test, the gate | T1b | [x] |

Close with the batch close in [task-contract.md](../task-contract.md).

Observability is N/A for every task. Rollback is Reversible (revert the task commit).
