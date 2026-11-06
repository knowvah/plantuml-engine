# Batch 3 — links

Nothing here should change `dotEqual` except T3a's shield, T3c's quantifiers and T3e's labels, which feed the DOT. `core/svek/SvekEdge.ts` is shared: `verdict-diff` at every task.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3a | Middle decor | orchestrator | `core/svek/extremity/`, `class/renderer-arrowhead-middle.ts`, `class-layout-edge-labels.ts`, `link-edge-attrs.ts`, `renderer-edge.ts` | T2e | [x] |
| T3b | Magnetic border on line ends | orchestrator | `core/svek/SvekEdge.ts`, `renderer-edge.ts`, `core/decoration/symbol/USymbolFolder.ts` | T3a | [x] |
| T3c | Quantifier and role text | orchestrator | `link-edge-attrs.ts`, `renderer-edge.ts` | T3a | [x] |
| T3d | Arrow style and rainbow | orchestrator | `core/style-cascade-description.ts`, `renderer-edge.ts`, `link-colors.ts` | T3a | [x] |
| T3e | Link labels | orchestrator | `link-edge-attrs.ts`, `core/edge-label-box.ts`, `class/class-magic-arrow.ts` move | T3d | [x] |

Close: [task-contract.md](../task-contract.md).
