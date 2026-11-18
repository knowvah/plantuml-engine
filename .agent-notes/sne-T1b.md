# sne T1b / T2b observations (issue #168, 2026-11-17)

## Observation: a titled block separator draws its rule AFTER the block, an untitled one BEFORE
- **Context**: Drawing a note's `-- title --` separator (`sep-title` probe).
- **Finding**: `TextBlockLineBefore#drawU` draws the rule first only when there is no title; with a title it draws
  the block, then the line halves around the title (`TextBlockLineBefore.java:81-95`, `UHorizontalLine.java:92-96`).
  The jar's SVG child order follows, so a port that always emits the rule first fails `compareSvg` on order.
- **Impact**: Any engine porting `BodyEnhancedAbstract#decorate` must keep that order.
- **Confidence**: High

## Observation: the state parser silently dropped a multi-line note that never closes
- **Context**: Porting the unterminated-`{{` syntax error (T2b).
- **Finding**: Before sne, `note right of S1` / `text` / `@enduml` rendered S1 with no note; the jar answers
  `Syntax Error?` at the note line, because `isMultilineCommandOk` runs out of lines (`PSystemCommandFactory.java:
  268-286`). Fixed for every state note kind by `state-note-multiline.ts#pendingNoteRefusal`.
- **Impact**: Other hand-rolled engine parsers with a pending-block state may have the same silent drop; check them
  against an oracle before assuming an unclosed block is recovered.
- **Confidence**: High (state); Medium (other engines, not checked)

## Observation: a `note on link` body is `BodyEnhanced2` too
- **Context**: Sizing a link note's embed (T2a).
- **Finding**: `ComponentRoseNote` passes `enhanced = true` (`ComponentRoseNote.java:68`), so
  `AbstractTextualComponent` builds its body with `BodyFactory.create3` (`:88-89`), not `Display#create0`. Separators
  split a link note into decorated blocks exactly as an entity note's.
- **Impact**: The core's naive `measureLinkNoteDim` default is wrong for any link note with creole blocks; state now
  uses the real body only when an embed is present.
- **Confidence**: High
