## Observation: a chen (cheneer) edge cannot carry creole
- **Context**: eea push-forward, "a cheneer edge with an emoji".
- **Finding**: `CommandAssociate.java:72` takes the edge's `CARDINALITY` as `([%pLN]+|\([%pLN]+,[%s]*[%pLN]+\))`, letters and digits only. `A -<:rocket:>- R` is a syntax error in the jar for that reason, and no other spelling puts text on a chen edge.
- **Impact**: chen edge labels need no atom resolver; skip chen when sweeping creole-on-edge gaps.
- **Confidence**: High (read the regex; planning probe errors in the jar).

## Observation: legacy activity sizes its edge label through the real Display#create
- **Context**: eea T1d.
- **Finding**: `activity-legacy-edge-text.ts:177` measures the label with `Display.getWithNewlines(…).create(…)` on the skin param, so sprites already sized it; only the draw (`SvekEdge` → `buildTextBlock`) lacked the resolver, which made a sprite label 4 px narrower in the canvas and left the sprite undrawn.
- **Impact**: in legacy activity, a label/quantifier sizing gap is a draw-side wiring gap first; the quantifiers are pre-built `Display` blocks (`end.block`) and need nothing.
- **Confidence**: High (probe `legacy-activity-edge-sprite` 4→0).
