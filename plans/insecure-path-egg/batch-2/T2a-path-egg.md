# T2a — the path egg under INSECURE (D1, D2, D3)

## Context

`PSystemPathFactory extends PSystemSingleLineFactory` (`eggs/PSystemPathFactory.java`). Its pattern is
`^path[%s]+([0-9A-Za-z]+)$`, compiled `CASE_INSENSITIVE` (`Pattern2.java:114`), so `PATH ABC` matches. The jar wrote a
PNG for `cov-path-upper` at planning. `PSystemPath extends DirectOsDiagram` (`eggs/PSystemPath.java`), and its
`exportDiagramNow` is `GraphicsPath#writeImage` (java:60-63). `GraphicsPath` (`eggs/GraphicsPath.java:66-88`) draws a
50×50 white image with `UMotif#drawHorizontal(ug.apply(BLACK), 20, 20, 1)`. The port writes that as SVG (D2).

## Task

1. `src/diagrams/eggs/GraphicsPath.ts`: `GraphicsPath(colorMapper, path)`, and `writeImage(measurer): string` returning
   the SVG document.
   - Build a `UGraphicSvg` page of exactly 50×50 with a white background.
   - Construct `new UMotif(path)` inside `createImage`, where java:80 does. An invalid character must throw at export, not
     at parse (D3).
   - Draw with `ug.apply(HColors.BLACK)`.
   - Model the document build on `src/core/UgDiagram.ts`'s export (`UGraphicSvg.build(...)`, `basicSvgOption`), but with
     a fixed 50×50 size and no margin, because `GraphicsPath` is not a `TextBlockExporter`. If ensure-visible would grow
     the canvas for ink past 50, keep it at 50×50: `EmptyImageBuilder(null, 50, 50, …)` (java:74) is fixed.
2. `src/diagrams/eggs/PSystemPath.ts`: extend `DirectOsDiagram` (`src/core/DirectOsDiagram.ts`). `exportDiagramNow`
   returns `path.writeImage(...)`. `getDescription()` returns `(Path)` (java:65-67).
3. `src/diagrams/eggs/PSystemPathFactory.ts`: an `executeLine` with the pattern above. `[%s]` is the port's whitespace
   class, as in `PSystemColorsFactory.ts:25`, and the regex takes the `i` flag. It returns `undefined` on no match.
   - Export `pathPlugin = singleLinePlugin({...})` with `registeredOnlyUnder: SecurityProfile.INSECURE` (D1) and
     `render: (d, ctx) => ({ completeSvg: d.exportDiagram(0, ctx.measurer) })`.
   - If `singleLinePlugin`'s spec cannot carry the field, add it to `SingleLineSpec` and forward it. That file
     (`src/core/command/PSystemSingleLineFactory.ts`) then joins the write-set: journal it.
4. `src/registered-plugins.ts`: add `registry.register(pathPlugin); // java:178-179 (INSECURE only)` between `ripPlugin`
   and `charliePlugin`. Keep it to one call per line, because `scripts/parity-dashboard.ts` reads these lines.
5. `tests/unit/utility-registration.test.ts`: add `[pathPlugin, 179]` to `JAVA_LINE`, plus whatever the order assertion
   needs.

## Write-set

`src/diagrams/eggs/GraphicsPath.ts`, `PSystemPath.ts`, `PSystemPathFactory.ts` (new), `src/registered-plugins.ts`,
`tests/unit/eggs/GraphicsPath.test.ts`, `PSystemPath.test.ts`, `PSystemPathFactory.test.ts` (new),
`tests/unit/utility-registration.test.ts`. Possibly `src/core/command/PSystemSingleLineFactory.ts` (step 3).

## Read-set

`src/diagrams/eggs/PSystemRIPFactory.ts`, `src/diagrams/eggs/PSystemColorsFactory.ts:1-40`,
`src/diagrams/math/PSystemMath.ts`, `src/diagrams/math/PSystemMathFactory.ts:30-45`, `src/core/DirectOsDiagram.ts`,
`src/core/UgDiagram.ts:130-175`, `src/core/klimt/drawing/svg/driver-dot-path-svg.ts`,
`tests/unit/eggs/PSystemRIPFactory.test.ts`, `tests/unit/eggs/plugin-harness.ts`, `tests/unit/utility-registration.test.ts:80-170`,
`tests/fixtures/factories/cov-path-*.{puml,svg}`, `measurements/jar-insecure-path-*`.

## Acceptance (Given/When/Then)

- Given `renderSync('@startuml\npath ABCabc\n@enduml', { securityProfile: 'INSECURE' })`, then the root is 50×50
  (`width`/`height` 50px, `viewBox="0 0 50 50"`) with a white background. The page has exactly one `<path>`: no fill,
  black stroke, width 1, starting `M20,20`, with end points 17,17 · 15,14 · 14,11 · 16,11 · 19,11 · 16,12 (D2,
  `measurements/decode-motif.py`).
- Given `PATH ABC` under INSECURE, then the same kind of page, with end points 17,17 · 15,14 · 14,11. This is the jar's
  `jar-insecure-path-upper-ABC.png`.
- Given `path abc123` (and `path xyz`) under INSECURE, then the page is `errorSvg`'s page carrying
  `IllegalArgumentException`, not a drawing (D3, `jar-insecure-path-abc123-crash.svg`).
- Given each `cov-path-*.puml` with no options, and under `SANDBOX`, then the page is byte-identical to the one before
  this mission, and the factories ratchet keeps all three at weightedScore 5.
- Given a 30-character motif such as `path AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`, whose ink leaves the page, then the root is
  still 50×50.
- Given the registration test, then `pathPlugin` sits between `ripPlugin` and `charliePlugin` and maps to java:179.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
Commit: `feat(eggs): draw path as an svg page under the insecure profile` (`Refs: #178`).
