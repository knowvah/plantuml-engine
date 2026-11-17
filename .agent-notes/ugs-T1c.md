# ugs-T1c — the cluster header stereo scales, formatted once

## Observation: the header is built twice per drawn cluster
- **Context**: D2, deferring the header's number format until the class scale factor is known.
- **Finding**: `buildDrawnClusterHeaderStereo` (`class-cluster-header.ts`) builds the header body normally AND inside
  `withDeferredFormat(true, …)` for every header-bearing namespace, scaled or not. The factor is resolved after layout
  (`layout.ts#layoutClass`), and a page AST (`newpage`) need not carry the `scale` directive, so gating on
  `isExportScaled(ast.scale, …)` at the namespace build was unreliable. The unscaled draw never reads `deferredBody`.
- **Impact**: a header builder that ever gains a stateful counter (ids) would advance twice; today the builders are
  pure (gradient ids are content-hashed by `withContentGradientIds`).
- **Confidence**: High

## Observation: the header's attribute order differs from the jar's
- **Context**: exact-string unit tests on the scaled `«boxed»` text.
- **Finding**: ours emits `x y font-size font-style fill textLength`, the jar `x y fill font-size textLength
  font-style`. `compareSvg` ignores attribute order, so no survey sees it. Pre-existing, unscaled too.
- **Impact**: assert header attributes as a map, not a string.
- **Confidence**: High
