# Re-pin to a720bdd, agent A (chart, bpm, factories, utility, extensions)

## Observation: the new jar loops forever on a chart value of Infinity
- **Context**: re-capturing tests/fixtures/chart/cov-inf-bar (`bar [Infinity]`); the re-pin left an empty .svg.
- **Finding**: `ChartAxis#withNiceRange` (ChartAxis.java:151-161, upstream 2117ccb43cd) computes magnitude = Infinity, step = Infinity, start = 0 * Infinity = NaN, so `start + 5 * step >= hi` is never true; the jar spins at 100% CPU past a 120 s timeout.
- **Impact**: the row has no oracle at a720bdd; any NaN/Infinity chart source hangs the jar.
- **Confidence**: High

## Observation: the formula changes in aa79d2d80ee are not all KaTeX-forced
- **Context**: classifying factories rows after the JLaTeXMath glyph-path change.
- **Finding**: besides glyph paths, the jar now (1) draws a formula's rollback as monospace text (ScientificEquationSafe.java:122-127, :158-160) where the port still draws the old rollback image, and (2) exports @startmath/@startlatex through TextBlockExporter with the formula scale applied (:164-173) where the port writes Batik's envelope and ignores scale in SVG (cov-math-upper: jar 56x54, port 27x26).
- **Impact**: those rows stay failing until ScientificEquationSafe's drawU/export are re-ported; only creole formula-only rows are the accepted divergence.
- **Confidence**: High

## Observation: RegexResult#getLazzy order changed upstream
- **Context**: diagram-style-scope component__x-leading-colour (`rectangle #pink "Both" as b #green`).
- **Finding**: e2659a157bf replaced the HashMap scan with a positional one (RegexResult.java:128-150), so `getLazzy("COLOR")` in CommandCreateElementFull now finds COLOR2 (the leading colour) first: the jar paints pink, the port green.
- **Impact**: any command with two keys sharing a prefix may now resolve to the earlier one.
- **Confidence**: High (Java read; port side not traced)
