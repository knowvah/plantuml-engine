# Batch 2: note on link, unterminated `{{`

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T2a | Size and draw a `note on link` embed | orchestrator or typescript-pro | `state-transition-label.ts`, `renderer-note.ts#renderNoteOnLink`, `state-renderer-transitions.ts`, DOT label-box callers, authored gate row `link` | batch 1 | [x] |
| T2b | An unterminated `{{` in a state note is a syntax error, as in the jar | orchestrator or typescript-pro | `state-notes.ts`, `parser.ts` (note accumulation), a unit test, authored gate row `open` | batch 1 | [x] |

Serial, T2a then T2b: both add rows to `state-note-embed.authored.test.ts`. Their source write-sets are disjoint.

Batch 2 closes per [the task contract](../task-contract.md#batch-close).
