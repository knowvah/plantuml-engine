# T2c — `PSystemMath`, `PSystemLatex`, `DirectOsDiagram`

Read [D4](../decisions.md#d4--math-and-latex-a-batik-shaped-complete-document-with-a-katex-body),
[D5](../decisions.md#d5--a-math-or-math-document-failure-takes-the-rollback-path-not-an-error-box) and
[task-contract.md](../task-contract.md).

**Java:** `DirectOsDiagram.java`, `math/PSystemMath.java` and `math/PSystemLatex.java` (`doCommandLine`, `getColor`,
`exportDiagramNow`), `math/PSystemMathFactory.java`, `PSystemLatexFactory.java`, `math/ScientificEquationSafe.java:71-89, :91-115, :149`.

**Write:** `src/core/DirectOsDiagram.ts`, `src/diagrams/math/{PSystemMath,PSystemMathFactory,PSystemLatex,PSystemLatexFactory}.ts`,
`tests/unit/factories/PSystemMath.test.ts`.

`doCommandLine` is the parser. A line lower-cased and trimmed by `StringUtils.trin(StringUtils.goLowerCase(line))` is tested against
`color `, `backgroundcolor `, `scale `, `dpi `, but **the argument is `line.substring(n)` of the original, untrimmed line**: an
indented `  color red` passes the test and then reads `or red` as its colour (white). Mirror that, and author a fixture for it. A formula line
is stored untrimmed (`cov-math-trim`). Everything else
**replaces** `math` (last wins: `renice-72`, `cov-math-last-wins`). `getColor` uses `HColorSet.instance().getColorOrWhite`; a bad
name is white (`cov-math-color-bad`); `Float.parseFloat` failures are logged and ignored (`cov-math-scale-bad`, `cov-math-dpi-zero`),
and `scale` values are stored but do not reach SVG (`:149`).

The plugin returns a `CompleteSvg` via T1c's `mathDocument`: math goes through `AsciiMath` to TeX (`src/core/math/AsciiMath.ts`),
latex passes through `$`-stripped (`latex.ts#stripMathModeDollars`). An empty formula (`cov-math-only-directive`) is an 8×8 Batik
document. Do not implement the rollback here; T3c owns it, so its branch can be a clear `// T3c` placeholder that raises.

**Interface output** (consumed by T3a): `mathPlugin`, `latexPlugin`: `SyncPlugin`, each with `factoryBase: 'PSystemBasicFactory'`.

## Acceptance
- Given `caruta-83-deta919`, when rendered, then `compareSvg` reports no diff above the glyph `<g>`, and the canvas is 319×44 with
  a yellow background.
- Given `tijica-43-sesu519` (`scale 5`) and `geravi-79-nafu641` (`dpi 300`), then both are 439×68: no scale reaches SVG.
- Given `cov-math-color-bad`, then the page is drawn with a white background; given `cov-latex-color`, a gold one.
- Given `seluva-39-xebe172` (`$...$`), then 109×71 as `fajagi-98`.

Observability: N/A — no new observable operations. Rollback: Reversible.
