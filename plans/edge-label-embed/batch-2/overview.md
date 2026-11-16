# Batch 2: description and legacy activity

Both engines draw their edges through `src/core/svek/SvekEdge.ts` (`drawLabelBlock`, `:483-500`, which builds
`buildTextBlock`). T2a changes that shared draw site, so T2b runs after it.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-description.md) | Description (component, usecase): embed atom in the label box and the drawn block | typescript-pro | `link-edge-attrs.ts`, `description/renderer-edge.ts`, `core/svek/SvekEdge.ts`, fixtures, tests | batch 1 | [x] |
| [T2b](T2b-activity-legacy.md) | Legacy activity: the same, through `buildEdgeTexts` | typescript-pro | `activity-legacy-edge-text.ts`, `activity-legacy/renderer-edge.ts`, fixtures, tests | T2a | [x] |

**Close:** the task-contract batch close. `verdict-diff` must show 0 lost in every engine. Description has the
largest conformant set, so read its census attribute list closely.
