# T2e: `skinparam svgDimensionStyle false` on class

**Row:** `bofebi-14-gano257`.

The only diffs are on the root `<svg>`. Ours carries the `background`, `height` and `width` the comparator reads, and
the jar's root has none of them (it keeps `viewBox="0 0 68 169"` and `preserveAspectRatio="none"`).

## Lead (verify before acting)

`TextBlockExporter.java:308`: `option = option.withSvgDimensionStyle(skinParam.svgDimensionStyle())`
(`SkinParam.java:1196`). Description already ports it (`src/diagrams/description/renderer.ts:313-314`,
`svgDimensionStyle: theme.svgDimensionStyle !== false`). Find where class builds its `SvgOption` and thread the same
skinparam through. Reuse description's path; never redeclare it.

## Acceptance
- Given `bofebi-14-gano257`, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T2e.test.ts`, then a class source with `skinparam svgDimensionStyle
  false` renders a root `<svg>` with the jar's attributes (no `width`/`height`/`background`), and one without it keeps
  them.

Observability is N/A. Rollback is Reversible.
