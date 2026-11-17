# T1d: legacy activity's edge gets the registry resolver (D2)

**Writes:** `src/diagrams/activity-legacy/renderer-edge.ts`, `src/diagrams/activity-legacy/activity-legacy-edge-text.ts`
if the label sizer measures with `buildTextBlock`, a unit test beside them, the gate.
**Reads:** `activity-legacy-skin-param.ts:89-111` (`sprites`, `getSprites`), `description/renderer-edge.ts:175-186`
(`labelFields`, the precedent), `SvekEdge.java:286-299`.

## Steps

1. **Read first.** Find how `renderer-edge.ts:278` builds its `SvekEdgeInput`, and how the label's DOT table is sized
   (`activity-legacy-edge-text.ts`). The sizer and the drawer must see the same atoms.
2. **Red.** Assert `legacy-activity-edge-emoji`'s label group child count from its oracle.
3. **Green.** Add `resolveAtomImage: makeAtomImageResolverFor(<the skin param's registry>)` to the input. If the label
   sizer builds a `buildTextBlock`, pass it the resolver for the label font as well. That changes sprite sizing too,
   which upstream does through the same `skinParam`.
4. **Push-forward.** Author a probe of a legacy activity edge label with a defined sprite, with its oracle, and add it
   to the gate.
5. **Measure** (task contract step 5, `activity` survey included). Pin `legacy-activity-edge-emoji` as `ZERO`.

## Acceptance
- Given `legacy-activity-edge-emoji` and the emoji store, when the authored gate runs, then it reports 0 diffs.
- Given the `activity` survey, when `verdict-diff.mjs <base>` runs, then it reports 0 lost.

Observability is N/A. Rollback is Reversible.
