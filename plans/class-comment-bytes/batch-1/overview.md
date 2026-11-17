# Batch 1: gate, comment dispatch, hidden, names

Serial, in the main checkout, one commit per task. The order matters: T1c reuses T1b's predicate, and T1d/T1e change
names that T1c's hidden comments print.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-gate.md) | Byte gate in both ratchets, authored gate for the probes | orchestrator | ratchet tests, `comment-open.json` ×2, gate | T0 | [x] |
| [T1b](T1b-image-dispatch.md) | D1: comment only where the upstream image comments | orchestrator or `typescript-pro` | `renderer-leaf.ts`, `renderer-group.ts` | T1a | [x] |
| [T1c](T1c-hidden.md) | D2: hidden entity and link write their comment | orchestrator or `typescript-pro` | `renderer.ts`, `renderer-leaf.ts`, `class-relationship-ast.ts` | T1b | [x] |
| [T1d](T1d-entity-names.md) | D3: class and entity comment names are the quark name | orchestrator or `typescript-pro` | parser create sites, geo types/builders, `renderer-group.ts` | T1c | [x] |
| [T1e](T1e-cluster-names.md) | D3: cluster comment names are the quark name | orchestrator or `typescript-pro` | namespace AST/geo, `renderer.ts` | T1d | [x] |

Close with the task contract's batch close.
