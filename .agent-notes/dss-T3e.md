## Observation: a state link's inline label was never drawn when a note sat on the same link
- **Context**: dss T3e, row `state__flatnote-none` (`A --> B : l` + `note on link : k`), `lnk4/text[2]` in audit section 8.
- **Finding**: `SvekEdge.java:307-325` merges the `EntityImageNoteLink` block with the label block and `:950-954` draws both at `labelXY`. Ours drew the note only (`buildTransitionLabelMarkup` replaced the label with the note) and put the note at the merged block's corner, so the note was also 15 px high. The reservation (`computeMergedLabelBox`) was already right. The label offsets are `TextBlockVertical#drawU` / `TextBlockHorizontal#drawU`; four positions authored and conformant (`state__linknote-label-{top,left,right,bottom}`).
- **Impact**: any state link with both a label and a note moves toward the jar: corpus `jaxuxe-73-sije305` 42 to 0, `kupexa-94-dude266` 25 to 0, `xupefu-98-roni234` 12 to 2. All three have no `<style>` and no skin (D8, jar-ward).
- **Confidence**: High (rows plus corpus oracles).

## Observation: `TransitionGeo.label` x/y shifters move only x/y, not the rest
- **Context**: placing the label beside a note on a link.
- **Finding**: `layout.ts#shiftStateTransition`, `state-composite-geo-shift.ts`, `state-composite-autonom.ts`, `state-composite-concurrent.ts` copy `{ ...label, x: x + dx, y: y + dy }`: any absolute coordinate added to `label` beyond x/y does not shift (`inkBox` is one, already). `linkLabel` is stored as `dx`/`dy` from the note corner for that reason.
- **Impact**: do not add absolute coordinates to `TransitionGeo.label`.
- **Confidence**: High.

## Observation: link ids carry `__zaent_` when an endpoint is a cluster composite
- **Context**: row `state__cluster-*` (1 diff each, `__zaent_A-to-z` vs jar `A-to-z`).
- **Finding**: not a colour path. `state-composite-classify.ts#resolveEndpoint` swaps a cluster composite for its DOT point `__zaent_<id>` and `state-renderer-transitions.ts#svgEndpointId` writes that into `<path id>` (`Link.idCommentForSvg` uses `getEntity1().getName()`, the real entity). Corpus: 57 of 273 state fixtures print a `__zaent_` id. `data-entity-1` carries it too (`__zaent_A`, jar `ent0001`). Left alone: not bg/line/font.
- **Impact**: a tracked state follow-on; a one-line strip in `svgEndpointId` plus the uid resolution, measured against 57 fixtures.
- **Confidence**: High.

## Observation: `hist-*` 43-49 diffs are a border-point cluster, not history
- **Context**: `state__hist-none` 43 diffs (T's width 133 vs jar 125).
- **Finding**: a composite with `<<entryPoint>>`/`<<exitPoint>>` plus any link to or from the composite (`S --> T`, `x --> T`, `T --> x`) is 8 px wider in ours. Without the link only `childCount` differs (the jar draws the border points outside the cluster group). History is not involved: a source with no `[H]` gives the same 43. 8 px is the width of the `ee` title table (`WIDTH="8"` in the jar's svek dot, ours `titleTableWidth` 8.575). Layout side (`portAnchorId`, `borderPointAncestorWrap`), outside T3e.
- **Impact**: history colours are done (49/48/49/45 to 47/46/47/43); remaining 43 is this.
- **Confidence**: Medium (reproduced and localised by rows; the exact dot-engine step not traced).

## Observation: a literal `\n` in a one-line state note is not split
- **Context**: probing a multi-line `note on link : multi\nline`.
- **Finding**: `note left of A : multi\nline` 36 diffs, `note on link : multi\nline` 30 vs the jar (width 185 vs 154): `Display.getWithNewlines` splits the escape, `state-note-layout.ts#measureNote` splits on a real newline only.
- **Impact**: separate state-notes defect; authored rows use the `end note` form.
- **Confidence**: High.

## Observation: D3a arrow hole did not reproduce
- **Context**: spec asked for a flat `stateArrowColor` then a last declaration equal to the default.
- **Finding**: ten variants (`skinparam stateArrowColor`/`ArrowColor` then `arrow`/`root`/`element`/`stateDiagram` `LineColor #181818`; two `arrow { LineColor }` declarations; `HeadColor`) are all 0 diffs against the jar. Two rows kept as guards: `state__d3a-arrow-flat-then-default`, `state__d3a-arrow-style-then-default`.
- **Impact**: nothing to fix on this tree.
- **Confidence**: High.
