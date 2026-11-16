# T1c: the header stereo scales, formatted once

**Writes:** `src/diagrams/class/class-cluster-header.ts`, `src/diagrams/class/class-namespace-shape.ts`
(`placeHeaderStereo`), `src/diagrams/class/class-namespace-usymbol-shape.ts` (the splice), `src/diagrams/class/
class-scale-geo.ts` (the header note at `:85-87`, and the header's scale if it is applied there), a unit test for
`buildClusterHeaderStereo` / `clusterHeaderStereoTextBlock` (find it with
`grep -rln "clusterHeaderStereo\|buildClusterHeaderStereo" tests`), the T1a gate.
**Reads:** `src/core/svg-format.ts:120-200` (`withDeferredFormat` and the formatter it gates),
`src/core/TextBlockExporter.ts:197-290` (`scaleFragmentBody`, `formatScaledFragmentBody`, `scaleActivityBody`),
`class-geo-builders.ts:290-310` (where the header is built at layout time), `layout.ts` (where the scale factor is
known relative to the header build).

## The mechanism (verified at planning; re-read before acting)

- `ClusterHeader.java:173-220` (`getStereoBlock`): the header is a `TextBlock` drawn through the cluster's scaled
  `UGraphic`, so its numbers are multiplied and then formatted once (`SvgGraphics.java:467-474`).
- Ours builds the header at layout time as a 3-dp string (`class-cluster-header.ts:268-286`). It is spliced unscaled on
  the USymbol path (`:301-322`) and on the folder/rect paths (`class-namespace-shape.ts#placeHeaderStereo`).
- Rescaling the 3-dp string double-rounds. Measured at planning: `node-thick-dashed`'s `«Rectangle»` stereo prints
  `textLength="157.324"`, and the jar prints `157.325` (`svg-format.ts:142-143`).

## Steps

1. **Red.** Unit tests from the oracles:
   - `folder-stereo`: `«boxed»` at `font-size="28"`, `textLength="107.45"`, `x="40.275"`, `y="77.778"`;
   - `scale-rectangle-stereo`: the same on the USymbol path, `x="34.275"`, `y="39.778"`;
   - `node-thick-dashed`: `textLength="157.325"`.
2. **Green, per D2.** At `k ≠ 1`, build the header body with deferred numbers. Format it once at `k` where it is
   placed:
   - in the USymbol splice, at `(dx·k, dy·k)`;
   - in `placeHeaderStereo`, which also needs `width` and `height` times `k`, because those paths draw pre-scaled
     geometry.

   The scale factor is resolved after layout (`resolveScaleFactor` over the final document size). Find out whether the
   header can be built deferred with the factor still unknown: a deferred body only needs the factor at format time. If
   it can, keep both a raw and a formatted body; if it cannot, rebuild the header after the factor is known. Journal
   which one you chose and why.
3. Update the `class-scale-geo.ts:85-87` note: the header now scales.
4. **Measure** per the contract, step 5. Expect `rectangle-stereo`, `node-thick-dashed`, `folder-stereo` and
   `scale-component` at 0. A residual means diagnosis mode before any further edit.
5. **Pin** the rows at 0, each with a dated comment citing `ClusterHeader.java:173-220` and `SvgGraphics.java:467-474`.

## Acceptance
- Given `package P <<boxed>>` under `scale 2`, when it renders, then the `«boxed»` text matches the jar
  (`folder-stereo`, 0 diffs).
- Given `rectangle R <<boxed>>` under `scale 2`, when it renders, then `scale-rectangle-stereo` is at 0 diffs.
- Given `node-thick-dashed`, when it renders, then `textLength` is `157.325` and the row is at 0 diffs.
- Given any class diagram without `scale`, when it renders, then the header is byte-identical to the base.

Observability is N/A. Rollback is Reversible.
