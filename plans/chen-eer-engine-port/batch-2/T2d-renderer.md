# T2d: the renderer and the chrome route

**Java:** `svek/SvekResult.java`, `svek/SvekEdge.java#drawU`, `TitledDiagram`, `UmlDiagram` export; `DiagramType.java:234-296`.

**Read in the port:** `src/diagrams/activity-legacy/{renderer,renderer-svek-result,renderer-edge,renderer-document}.ts`,
`src/core/assemble-svg.ts` (laep D4 route).

**Do:**
1. Draw every leaf through the T2a images, and every edge through `SvekEdge` with its stroke (bold for `=`), its colour
   (`#line:` colours), its cardinality text and its middle decor (T2b).
2. Route the fragment so the root prints `data-diagram-type="CHEN_EER"` and the chrome follows the cuca path (D4).
3. Mirror the jar's draw order. Read the oracle's group order (`<g>` per leaf, links after leaves or interleaved) from
   `vega-chen-movieextended`.
4. Make `plugin.layoutSync` and `render` live in `index.ts`.

## Acceptance
- Given `cov-rel-link`, `cov-cardinality` and `cov-entity-colors`, when rendered through `chenPlugin` directly (still
  unregistered), then `compareSvg` against the planning oracle shows 0 diffs, or each remaining diff is journaled with
  its owner.
- Given `cov-title-chrome`, `cov-scale` and `cov-skinparam`, then the chrome, scale and background match.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
