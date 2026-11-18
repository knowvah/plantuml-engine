# T1b: draw the stripes, share the embed draw, pin the rows and probes

**Writes:** `src/diagrams/state/renderer-note.ts` (`renderNoteTextLines` and its callers), new
`src/diagrams/state/state-embed-draw.ts`, `src/diagrams/state/state-renderer-transitions.ts`
(`buildLabelStripesMarkup`), `tests/fixtures/state-note-embed/*.{puml,svg}`,
`tests/oracle/svg-conformance/state-note-embed.authored.test.ts`, `oracle/goldens/svg-timing/authored-baseline.json`,
`oracle/goldens/svg-wire/authored-baseline.json`, `tests/oracle/svg-conformance/timing.diff-baseline.ratchet.test.ts`,
`tests/oracle/svg-conformance/wire.diff-baseline.ratchet.test.ts`, `oracle/goldens/svg-timing/README.md`,
`scripts/parity-dashboard-notes.ts`.
**Reads:** `state-renderer-transitions.ts:215-245`, `tests/oracle/svg-conformance/edge-label-embed.authored.test.ts`
(the gate to copy), `Opale.java:105-127`, `EntityImageNote.java:280-290`.

## What

1. **D3.** Move the image branch of `buildLabelStripesMarkup` into `state-embed-draw.ts` as one exported function
   (block, x, y → markup). Labels call it; every state label pin and the `edge-label-embed` authored gate stay at 0.
2. **Draw.** When `node.noteStripes` is set, `renderNoteTextLines` draws each stripe at
   `(node.x + NOTE_MARGIN_X1 + dx, node.y + NOTE_MARGIN_Y + dy)` (`Opale.java:127`): a text stripe through the state
   text emitter at its own top (`renderStateTextLines` or `renderStateRuns`, whichever keeps tables), an image stripe
   through the D3 function. With no stripes, the path is byte-identical to today. This covers the Opale, plain and
   freestanding note draws, which all call `renderNoteTextLines`; confirm by reading `renderer-note.ts:263-350`.
3. **Pin (D5).**
   - Re-measure both held rows with their `build-authored-baseline.mts <HEAD> --write`; each row must reach 0 with no
     `reason`. Empty both `OPEN_ROWS` with a dated comment.
   - Move `composite`, `free`, `lr`, `mixed`, `sep`, `two` to `tests/fixtures/state-note-embed/` with their jar
     `.svg`, as ZERO rows in the new authored gate (copy of `edge-label-embed.authored.test.ts`). `link` and `open`
     join in batch 2; until then they stay in `measurements/probes/`.
   - Remove the "state note draws as text" wording from `oracle/goldens/svg-timing/README.md:36` and
     `scripts/parity-dashboard-notes.ts:90`.

A probe that stays nonzero after the draw lands is either this task's (same mechanism: fix it) or separable (D1:
file it, hold it as an OPEN row with its issue).

## Acceptance
- Given `timing/cov-embedded-state`, when rendered, then 0 diffs and one `<image width="157" height="115" x="98"
  y="11">`.
- Given `wire/cov-embedded-state-note`, then 0 diffs and one `<image width="81" height="131" x="98" y="11">`.
- Given the six moved probes, then each is at 0 diffs with the jar's `<image>` count (`two`: 2).
- Given the state ratchet, `state-dot-parity` and the `edge-label-embed` gate, then every count is unchanged.
- Given `measure-rows.mts`, then no row's diff count rose against `/tmp/sne-t0.json`.

Observability is N/A. Rollback is Reversible.
