# ubt-T2a — sprite in a group title

## Observation: activity text blocks lose the jar's ensureVisible fold
- **Context**: jutesi-96 canvas 526 vs the jar's 712 after the frame was sized right.
- **Finding**: `SvgGraphics#ensureVisible` asks an arc for end point + radii (`SvgGraphics.java:854`); activity draws each text block into a throwaway `UGraphicSvg` and splices the markup, so the fold was lost. Fixed by reporting each throwaway's viewBox to a per-render sink (`activity-draw-extent.ts`) and carrying it as `RenderFragment.drawnMaxX/Y` (the sequence fold), consumed in `finalizeActivityFragment`.
- **Impact**: any engine that splices throwaway graphics has the same gap; activity shapes drawn as strings (not through a graphic) still report nothing.
- **Confidence**: High

## Observation: sprite primitives are resolved before the ug exists
- **Context**: the group stroke did not reach the sprite circle although the title ug carried it.
- **Finding**: `makeAtomImageResolverFor` bakes each SVG sprite's stroke at resolution time (`SpritePrimitiveCollector`, seeded `UStroke.simple()`); the ambient stroke must be passed in (`chromeAtomOps(..., ambientStroke)`), applying it to the ug is not enough.
- **Impact**: every caller drawing a sprite under a non-default stroke needs the ambient seam.
- **Confidence**: High

## Observation: `partition <$x>` with no bracket and no body is a legacy activity diagram
- **Context**: authored probe drew an svek folder polygon in the jar, no bracket warning.
- **Finding**: `PSystemBuilder.java:137` tries the legacy `ActivityDiagramFactory` first; we route to activity3. Owned by #123 (comment posted).
- **Impact**: do not author bracketless empty partitions as activity3 fixtures.
- **Confidence**: High
