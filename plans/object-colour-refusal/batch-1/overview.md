# Batch 1: gate

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1 | Fixtures + the object-colour-refusal authored gate, green on the base | orchestrator or `typescript-pro` | `tests/fixtures/object-colour-refusal/`, `tests/oracle/svg-conformance/object-colour-refusal.authored.test.ts` | T0 | [x] |

Spec: [T1-gate.md](T1-gate.md). Close with the task contract's "Batch close". This batch has no `src/` change. When
load is high you may skip the survey, journal that, and let batch 2's close cover it.
