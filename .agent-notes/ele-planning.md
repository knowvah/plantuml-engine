# ele planning observations (issue #144, 2026-11-14)

## Observation: the xetase note's sizes predate oracle seam #3
- **Context**: Planning #144 from `.agent-notes/xetase-embedded-diagram-label.md`.
- **Finding**: The note says the jar reserves 54x54 (42x42 catch arm + 2·6). The current oracle
  (`test-results/dot-cache/state/xetase-70-zaza808/svek-1.dot`, re-captured 2026-10-09) reserves
  `WIDTH="544" HEIGHT="239"`: the 532x227 Welcome page of an empty embedded `@startuml` plus 2·6.
- **Impact**: Do not target 42x42 for an unterminated `{{`; the SVG arm (`EmbeddedDiagram.java:129-133`) is taken.
- **Confidence**: High

## Observation: class already embeds in edge labels; state, description, legacy activity do not
- **Context**: Planning probes, `plans/edge-label-embed/measurements/probes/`.
- **Finding**: A well-formed `{{\nclass X\n}}` class edge label is at 0 diffs (`class-edge-label-embed.ts`).
  State, component, usecase and legacy activity (`-->[…]`) draw no `<image>`. Class/object with an unterminated
  `{{` draw the right 532x227 image but a different layout (canvas 555x247 vs 576x407).
- **Impact**: Issue #144's "every engine uses the flat seam" is stale for class.
- **Confidence**: High

## Observation: compareSvg undercounts a missing child element
- **Context**: Probe `actleg2` shows only 3 diffs although our SVG has no `<image>`.
- **Finding**: `compareSvg` reports `g[3][childCount] 5 vs 3` and stops descending into that group.
- **Impact**: Low diff counts do not mean "nearly conformant"; assert element presence explicitly.
- **Confidence**: High

## Observation: legacy activity `"a" --> "b" : {{` renders a dedication Welcome page in the jar
- **Context**: Probe `actleg-open`.
- **Finding**: The jar's whole document is a Welcome page with an "Add your own dedication" banner and a 93x93
  PNG; ours renders the Welcome page without the banner (canvas 532x298 vs 532x390). Our top-level empty
  `@startuml/@enduml` is at 0 diffs, so the banner comes from a different code path. Not investigated.
- **Impact**: Separate from #144; T4 files it after reading the Java.
- **Confidence**: Medium (mechanism unknown)
