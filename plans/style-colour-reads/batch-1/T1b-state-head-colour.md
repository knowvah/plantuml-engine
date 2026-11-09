# T1b — state arrow heads read `HeadColor` from the merged arrow style

**State at planning:** `arrow { HeadColor #FF0000 }`, `element { HeadColor #FF0000 }` and
`skinparam ArrowHeadColor #FF0000` leave both state arrow heads `#181818`; the jar paints them `#F00`
(`state__head-arrow`, `-element`, `-skinparam`, 4 each: fill and stroke of two polygons).
`arrow { HeadColor transparent }` draws a polygon where the jar draws a line (`-transparent` 1).
`stateDiagram { arrow { HeadColor } }` and an inline `-[#0000FF]->` are at 0 (`-diagram`, `-inline`). Class,
component and usecase are at 0 on all three.

**Read:** `SvekEdge.java:873-892` (`Rainbow.build(styleLine, …)`; a link colour replaces line and head),
`Rainbow.java:84-94` (no `HeadColor` means the line colour; null means transparent), `SvekEdge.java:1108-1135`
(`drawRainbow`: with a transparent head, an `ExtremityArrow` draws `drawLineIfTransparent` in the line colour),
`ExtremityArrow#drawLineIfTransparent`, and `FromSkinparamToStyle.java:153` (`arrowHeadColor` → `arrow { HeadColor }`).
Ours: `state-link-style.ts:96`, `state-render-colors.ts:308-330` (`resolveStateArrowHeadColor`), and how the class
renderer reads `HeadColor` (find it with `grep -rn "HeadColor" src/diagrams/class src/core`).

**Do:** per D3. Red with the four rows' oracle values. Take the head colour from the merged style the state arrow's
`LineColor` comes from, and port the transparent branch. Keep `theme.colors.graph.stateArrowHeadColor` on the type
(D7); it may stop being the only source.

**Measure:** `rows.mts` prefixes `state__head-`, `state__d3a-`; the state survey (11 cached sources set `HeadColor`).

## Acceptance
- Given the six `state__head-*` rows and the `state__d3a-arrow-*` guards, then each is at 0.
- Given the state survey, then 0 lost.

Observability N/A. Rollback Reversible.
