# T2c — `teoz-ng-001-17`: the 3 px left of a top-level `note left`

**Row:** `teoz-ng-001-17`, classic sequence (no `!pragma teoz`): `opt test` around `ref over A, B`, then a
top-level `note left` with one long line. Structural-match, 46 diffs: `svg/@width` 602 against 605 and every
participant, lifeline, `opt` and `ref` x 3 px left of the jar's. The note's own geometry is what differs, so the
3 px is in how the note claims space at the left edge. Not diagnosed in planning.

**Read, as leads:** where a `note left` with no participant attaches (`CommandNote` in `sequencediagram/command/`,
`SequenceDiagram#addNote`), its `NoteTile` or `GraphicalElement` width and x, and the left margin the diagram
reserves (`DrawableSet`, `ParticipantRange`, `LivingSpace`). Ours: `src/diagrams/sequence/sequence-note-placement.ts`,
`sequence-note-anchor.ts`, `sequence-layout-note.ts`, `sequence-note-tile.ts`. Compare the jar and our SVG with
`row-diffs.mts`, and diff the note's `path/@d` first.

**Do:** diagnosis first (`~/.claude/rules/diagnosis.md`): mechanism, origin `file:line`, causal chain and what you
ruled out, in the journal, before any change. Then fix at the origin. If the mechanism is large and separable,
D7's last option applies.

**Red:** the row's jar values. Authored, with oracles: `note left` and `note right` at the top level with no
participant, after a group, after a `ref`, with short and long text.

**Measure:** `unknown`, `sequence`.

## Acceptance
- Given the diagnosis artifact in the journal, when T2c closes, then it names mechanism, origin and ruled-out
  evidence.
- Given `teoz-ng-001-17`, when re-read, then 0 diffs, or it is named per D7.
- Given `unknown` and `sequence` surveys, then 0 conformant lost against T0.

Observability N/A. Rollback Reversible.
