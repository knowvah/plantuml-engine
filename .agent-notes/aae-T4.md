# aae T4 — activity-3 arrow-label sites with an embed (issue #188, 2026-11-22)

## Observation: compression maps each draw of a label block separately
- **Context**: probing `-> {{…}}\nhi;` and two stacked embeds in one arrow label.
- **Finding**: `UGraphicCompressOnXorY#draw` (`klimt/compress/UGraphicCompressOnXorY.java:107-116`) maps every draw
  call's own point through `ct()`. An embed image occupies no slot (`SlotFinder.java:84-109`), so an image inside a
  removed gap lands on the slot start while a following `UText` keeps its own slot; two stacked images land on one
  point. Ours moved a label as one rigid anchor. Now `ActivityEdgeGeo.labelShapeDeltas` carries per-draw offsets
  (`edge-label-anchor.ts#withLabelShapeDeltas`), consumed through `activity-title-compress-ug.ts#withTitleShapeDeltas`
  by the renderer, the ON_Y slot finder and the canvas ink.
- **Impact**: any consumer of a label's extent after compression must read it through `labelShapeDeltas`; the
  walk-time in-label reservation no longer feeds the canvas fold (lane width only).
- **Confidence**: High

## Observation: a leading arrow label relabels a branch only when an instruction follows it
- **Context**: `switch` case `-> label;` (jar replaces the case text) and pinned golden `gopori-87-tese064`.
- **Finding**: `Branch#getDisplayPositive` (`Branch.java:231-238`) reads the first tile's in-link display. A label in a
  branch with no instruction is still pending at the next `case`/`else`/`elseif`/`end…`, which makes it the branch's
  special (`InstructionSwitch.java:165-166`, `InstructionIf.java:165-167,183,196`). Ours now ports both halves in
  `conditional-builder-arrows.ts#leadingArrowLabel`, used by `if` and `switch`.
- **Impact**: before this, a switch case's leading label was dropped, and an empty `if` branch's label drew twice.
- **Confidence**: High

## Observation: `gh issue create` is denied in headless mission sessions
- **Context**: filing the switch-case finding as `queue:ready` per D1.
- **Finding**: the auto-mode permission classifier denied `gh issue create … --label queue:ready,parity`. Not worked
  around; the finding was small enough to fix in the mission instead.
- **Impact**: a later mission whose brief relies on filing issues should expect this and keep the issue text in its
  notes for the user.
- **Confidence**: High
