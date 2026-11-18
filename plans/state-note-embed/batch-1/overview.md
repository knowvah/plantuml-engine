# Batch 1: entity notes (the rows)

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T1a | Build a note's embed stripes beside its size | orchestrator or typescript-pro | `state-note-layout.ts`, `renderer-note.ts` (`materializeNoteSpec`), `state-geo-types.ts`, `tests/unit/state/sne-note-stripes.test.ts` | T0 | [x] |
| T1b | Draw the stripes, share the embed draw, pin the rows and probes | orchestrator or typescript-pro | `renderer-note.ts`, `state-renderer-transitions.ts`, `state-embed-draw.ts`, `tests/fixtures/state-note-embed/`, authored gate, timing/wire baselines | T1a | [x] |

Serial: T1b reads T1a's `noteStripes`. Both write `renderer-note.ts`.

## Interface contract (T1a → T1b)

```ts
// state-geo-types.ts, on StateNodeGeo; and on NoteSpec (state-note-layout.ts)
noteStripes?: StateLabelStripes; // state-label-style.ts: { width, height, items: StateLabelStripe[] }
// absent for every embed-free note (D2); items offsets are from the body's top-left, before (marginX1, marginY)
```

If `StateLabelStripes` cannot be imported into `state-geo-types.ts` without a cycle, move the type (not a copy) to a
module both import, and journal it.

Batch 1 closes per [the task contract](../task-contract.md#batch-close).
