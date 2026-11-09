## Observation: WithLinkType stores a bare ResolvedColor
- **Context**: Rendering `(*) -[#red]-> x` in the legacy activity engine (laep T2c).
- **Finding**: `core/decoration/WithLinkType.ts:17-19` builds the link colour with `parseSimpleColor`, which answers a plain `{r,g,b,a}`, not the `HColorSimple` `HColorSet#getColor` answers. `link.getColors().getColor(...)` therefore fails `instanceof HColorSimple`.
- **Impact**: any engine reading a link colour as an `HColor` throws `ClassCastException`; `activity-legacy/renderer-edge.ts#paintOf` wraps it. Changing the origin touches `core/elk` readers.
- **Confidence**: High

## Observation: quantifier labels sit at the table corner after manageCollision
- **Context**: 17 legacy rows had `if` conditions / `[label]` text 8-12 px off in x.
- **Finding**: Java draws `endHeadText` at `centre - (int)table/2` moved by `SvekEdge#manageCollision` against all nodes (`SvekEdge.java:1205-1218`); `layoutGraph` returns the centre only.
- **Impact**: any svek engine drawing quantifiers from `headLabelX/Y` needs the collision step (`core/svek/quantifier-collision.ts`).
- **Confidence**: High
