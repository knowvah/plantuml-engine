# T1a: build a note's embed stripes beside its size

**Writes:** `src/diagrams/state/state-note-layout.ts` (`measureNote`, `NoteMeasurement`, `NoteSpec`, `noteSpecOf`),
`src/diagrams/state/renderer-note.ts` (`materializeNoteSpec` only), `src/diagrams/state/state-geo-types.ts`,
`tests/unit/state/sne-note-stripes.test.ts`.
**Reads:** `src/core/svek/edge-label-embed.ts`, `src/diagrams/state/state-label-style.ts:59-119` (`labelStripes`, the
shape to follow), `state-sizing-creole.ts#stateCreoleBlock`, `src/core/nested-diagram-registry.ts`, `src/index.ts`
(`prepareBlock`), `src/diagrams/class/class-nested-diagram-renderer.ts` (`guardedRender`).

## What

`measureNote` (`state-note-layout.ts:120`) keeps its `width`/`height` from `measureNotePureText` (jar-exact today).
When `splitEdgeLabelEmbeds(text.split('\n'))` finds an embed, it also returns `stripes`, built as `labelStripes` builds
a label's (D2): text segments through `stateCreoleBlock` with the note's font and `NOTE_TAB_SIZE_NB`, embeds through
`edgeLabelEmbedAtom(source, null)`, stacked by `stackEdgeLabelStripes(…, HorizontalAlignment.LEFT)`. `noteSpecOf`
copies them to `NoteSpec.noteStripes`; `materializeNoteSpec` copies them to `StateNodeGeo.noteStripes`.

Factor the stripe builder out of `labelStripes` if the two are the same walk with different fonts, rather than
writing it twice. Every state label pin must stay byte-identical.

Separator rule (`sep` probe): read `BodyEnhanced2.java:84-112` first. A `--` line ends a block and the next block is
decorated (`BodyEnhancedAbstract#decorate`). If the stacked stripes cannot reproduce that, carry the separator as its
own stripe built the way `stateCreoleBlock` already draws an HR line, and check the offsets against the jar's `sep`
oracle in T1b.

D7: check whether a state note's nested render goes through the slot `guardedRender` restores. Journal the answer
with `file:line`. If it does not, fix the slot and add a unit test for the restore.

## Acceptance
- Given `cov-embedded-state.puml`'s note text, when `measureNote` runs, then `stripes` holds one image stripe of
  157x115 at dx 0, dy 0, and `stripes.width/height` equal the note's pure size (157x115).
- Given `cov-embedded-state-note.puml` (`{{wire`), then one image stripe of 81x131.
- Given the `mixed` probe, then the stripes are text, image, text, with dy values that put each text baseline where
  the jar's `mixed.svg` draws it (subtract `marginY` 5 and the note's y).
- Given any embed-free note (e.g. the state ratchet's note rows), then `stripes` is absent and `lines` is unchanged.
- Given T1a's change, then `state.golden.ratchet` and `state-dot-parity` pass with the same counts.

Observability is N/A. Rollback is Reversible.
