## Observation: a sequence colour refusal must be gated on a NEW CODE, not on the command's move flag
- **Context**: alr T2, adding `badColor()` to `declareParticipant` (`src/diagrams/sequence/command-participant.ts`).
- **Finding**: the bare `create X` path used to call `declareParticipant` with `moveExisting = false`, which skipped the exists branch, so a refusal placed after that branch fired on an existing X (`alr-create-existing` 0 -> 5). Upstream reaches `getColor` only for a new CODE (`CommandParticipant.java:145-149` before `:183-185`), and `CommandActivate` never colours at all.
- **Impact**: any future colour or validation check in the participant family belongs after a plain `participantIndex.has(id)` test, not after a flag-dependent one.
- **Confidence**: High

## Observation: a CREATE life event's colours are never drawn upstream
- **Context**: alr T3, porting `CommandActivate` TYPE `create`.
- **Finding**: `create X #red #blue` stores `Fashion(back, line)` on the CREATE `LifeEvent` (`SequenceDiagram.java:374`), but only an ACTIVATE event's `getSpecificColors()` is read (`teoz/LiveBoxes.java:236-258`; nothing under `sequencediagram/graphic/`). The port drops them (`createLifelineCommand`).
- **Impact**: no need to model a CREATE colour; a `create X #c` that paints X is a routing bug, not a missing feature.
- **Confidence**: High

## Observation: description sizes an entity at the style-cascade thickness, ignoring its `#line.<style>` stroke
- **Context**: alr T4, the `alr-dashed` residual.
- **Finding**: `layout-dot-tree.ts:216` passes `ctx.lineThicknessFor(node.symbol)` to sizing (`leaf-sizing-entity.ts:193`), while `renderer-entity.ts:227` draws with `lineStyleStroke(override.lineStyle)`. Upstream sizes with `styleTitle.getStroke(colors)` (`EntityImageDescription.java:168`, `Style.java:339-345`), and `ActorStickMan` adds `2 * thickness` (`ActorStickMan.java:112-121`). Gap `2 x (t - 0.5)`: dashed/dotted 1px, bold 3px. Filed #294.
- **Impact**: any description entity with `#line.dashed|dotted|bold` whose size folds in the stroke is off until #294.
- **Confidence**: High for actor; other symbols not measured.
