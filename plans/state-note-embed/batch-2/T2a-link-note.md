# T2a: size and draw a `note on link` embed

**Writes:** `src/diagrams/state/state-transition-label.ts` (`noteBoxFields` and the box measure that feeds it),
`src/diagrams/state/renderer-note.ts` (`renderNoteOnLink`, `renderNoteOnLinkTextLines`),
`src/diagrams/state/state-renderer-transitions.ts` (`buildLinkNoteMarkup`), `state-transition-geo-types.ts` if the
label geo needs a stripes field, the DOT label-box callers if the reserved size changes (`state-dot-graph.ts`,
`state-composite-edge-label.ts`: change both or neither, D1 lockstep in `state-note-layout.ts:162-180`),
`tests/fixtures/state-note-embed/link.{puml,svg}`, the authored gate.
**Reads:** `EntityImageNoteLink.java:61-77`, the Rose note component it builds (`skin.createComponentNote`, grep
`ComponentRoseNote`), `src/core/svek/image/EntityImageNoteLink.ts` (`measureLinkNoteDim`, its `pureText` strategy),
`state-note-layout.ts#measureNotePureText`.

## What

Planning measured `link` at 27 diffs, canvas 114x240 against the jar's 134x269, no `<image>`. Find where the link
note's size comes from before changing it: `EntityImageNoteLink.ts`'s naive default measures text, and
`state-note-layout.ts:162-180` records why state never wired `measureNotePureText` into it. Read the Rose note
component's `getPureTextWidth`/margins in the Java, then:

1. size the link note's body through the embed-aware path (`measureNotePureText`, or the component's own body if the
   Java differs), in both the flat and composite callers;
2. draw it with T1a/T1b's stripes and the D3 draw function, offset by the Rose note's own padding
   (`ROSE_NOTE_PADDING`, cite its Java origin).

Embed-free link notes must stay byte-identical: the state ratchet holds `note on link` rows.

If the residual after the embed lands is a different mechanism (e.g. the DOT label box rule), it is separable (D1).

## Acceptance
- Given `link.puml`, when rendered, then the canvas is 134x269 and one `<image>` sits at the jar's x, y, width and
  height (read them from `measurements/probes/jar/link.svg` in the red test).
- Given every embed-free `note on link` row in the state ratchet, then it is unchanged.
- Given the authored gate, then `link` is a ZERO row, or an OPEN row whose `reason` names a filed issue.

Observability is N/A. Rollback is Reversible.
