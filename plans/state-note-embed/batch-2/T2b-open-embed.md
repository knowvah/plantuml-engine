# T2b: an unterminated `{{` in a state note is a syntax error

**Writes:** `src/diagrams/state/state-notes.ts` (the block accumulator, `isNoteCloser` at `:82`),
`src/diagrams/state/parser.ts` (`:87-91`, the note swallow), a unit test under `tests/unit/state/`,
`tests/fixtures/state-note-embed/open.{puml,svg}`, the authored gate.
**Reads:** `command/PSystemCommandFactory.java:230-290` (`isMultilineCommandOk`), `BodyEnhanced2.java:121-134`
(`addOneSingleLineManageEmbedded2`), `src/core/command/multiline-candidate.ts` (the port, used by the timing, ebnf
and legacy-activity factories), the state note command factory in the Java (`CommandFactoryNoteOnEntity`,
`CommandFactoryNote`).

## What

The jar renders `open.puml` (`note right of S1` / `text` / `{{` / `end note`) as `Syntax Error?` at line 3: the
multiline reader counts `{{` as one nesting level, so `end note` is read as body and the lines run out with no
block (`PSystemCommandFactory.java:268-286`). Ours closes the note at `end note` and draws a 660x271 diagram.

Make state's note accumulation consume an embedded block as one line, nesting included, as
`multiline-candidate.ts` does, so a note with an unterminated `{{` never closes and the diagram errors at the jar's
line. Prefer calling `multiline-candidate.ts` over a second copy of the nesting walk. Apply it to every multi-line
note form the state parser accumulates (`note … of`, `note as N`, `note on link`), since all of them go through
`isMultilineCommandOk` upstream; check each against an oracle you render.

A well-formed `{{ … }}` containing a line `end note` is the opposite case: the jar keeps it inside the embed. Author
that probe too (`embed-endnote.puml`) and hold it.

## Acceptance
- Given `open.puml`, when rendered, then we draw an error page whose error line is 3, as the jar's `open.svg` does;
  the authored gate holds it as an ERROR row (D5).
- Given `embed-endnote.puml` (`{{` / `class X` / `end note` / `}}` / `end note` inside a state note), then our
  output matches the jar's oracle (0 diffs, or an error pair).
- Given every state ratchet row, then it is unchanged (no well-formed note changes parse).

Observability is N/A. Rollback is Reversible.
