# Batch 1: gate, label, quantifier, legacy activity

Serial. T1b-T1d each pin rows in T1a's gate file. T1c and T1d build on T1b: without D1, a resolver handed to
`buildTextBlock` still draws the glyph.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T1a](T1a-gate.md) | Move the probes into an authored gate with the emoji store; control `ZERO`, the rest `OPEN` | orchestrator | `tests/fixtures/emoji-edge-artwork/`, `emoji-edge-artwork.authored.test.ts` | T0 | [x] |
| [T1b](T1b-label-artwork.md) | The resolver carries the artwork; `drawAtoms` draws it (D1); `issue-150` leaves `PENDING` | orchestrator or `typescript-pro` | `creole-atoms.ts`, `creole-atoms-image-resolver.ts`, `EntityImageDescriptionTextBlock.ts`, `c4dd-t1b-text-atoms.test.ts`, unit test, the gate | T1a | [x] |
| [T1c](T1c-quantifier.md) | The quantifier text gets the label's resolver, at its sizer and its draw (D2) | orchestrator or `typescript-pro` | `SvekEdge.ts`, `quantifier-block.ts`, `link-edge-attrs.ts`, `layout-geo-post.ts`, unit test, the gate | T1b | [x] |
| [T1d](T1d-legacy-activity.md) | Legacy activity's `SvekEdge` gets the registry resolver (D2) | orchestrator or `typescript-pro` | `activity-legacy/renderer-edge.ts` (and its label sizer if needed), unit test, the gate | T1b | [x] |

Close with the batch close in [task-contract.md](../task-contract.md).

Observability is N/A for every task. Rollback is Reversible (revert the task commit).
