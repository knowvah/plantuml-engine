# Batch 2 — tidying and the ruling

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T2a](T2a-tidy.md) | Item 22's stale citations, item 20b's verified seam artefact, and the `needs-ruling` issue for the unread `Theme` fields | orchestrator | `src/diagrams/state/renderer-box-zones.ts`, `DIVERGENCES.md`, a GitHub issue | T1d | [x] |

Close the batch with the task contract's "Batch close" list.

## Acceptance
- Given the batch close, then `dist/*.d.ts` is identical to the base build and the `needs-ruling` issue exists.
