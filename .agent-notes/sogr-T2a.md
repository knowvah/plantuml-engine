## Observation: untitled `partition` crashes the jar
- **Context**: authoring `sogr-partition-untitled` (`partition` with no title, then `end`).
- **Finding**: the jar draws a "has crashed" page, NPE at `PartitionTile.titleBlock(PartitionTile.java:85)` ->
  `Display.create(null comment)` -> `CreoleParser.createSheetSlow`. The page is also non-deterministic across two
  renders (random quote line), so the row was dropped.
- **Impact**: our port renders a bare `partition` with an empty title; the jar has no oracle for it. Not a gate.
- **Confidence**: High

## Observation: partition's component draws in both passes
- **Context**: porting `PartitionTile`.
- **Finding**: its `getComponent()` is an anonymous `Component`, not an `AbstractComponent`, so `drawU` (title text +
  frame rect) runs in the background pass AND the foreground pass; the jar SVG has the title and rect twice. Background
  fill rect first (`stroke:none`).
- **Impact**: any future partition change must keep both passes (`renderer-frame-partition.ts`).
- **Confidence**: High

## Observation: `skinparam sequenceGroupBorderThickness`/`roundCorner` do not reach a partition
- **Context**: `sogr-partition-skinparam` oracle (border 3, roundCorner 12).
- **Finding**: the jar keeps stroke 1.5 and square corners; only `sequenceGroupBodyBackgroundColor` reaches the
  partition body fill. Port matches with no special case (style signature `partition`, `Grouping.java:59-63`).
- **Impact**: none; recorded so nobody "fixes" it.
- **Confidence**: High
