# Chart port to a720bdd (agent "chart")

## Observation: the a720bdd re-pin left crash-page oracles stale
- **Context**: four chart rows failed after the cartesian port although the port matched the new jar.
- **Finding**: the re-pin (8f3997d3a) did not re-capture authored fixtures whose oracle was a crash page (their bytes change every run, QuoteUtils shuffle). cov-zero-grouped, cov-zero-horizontal, cov-zero-stacked and cov-span-ticks still held the old jar's crash (`BarRenderer.java:280`, old line numbers); at a720bdd the jar draws all four. Re-rendered with `scripts/oracle-render.sh` in 88a7e3c95.
- **Impact**: other engines' crash-page oracles may be stale the same way; a crash page whose stack trace names old line numbers is the tell.
- **Confidence**: High

## Observation: the port's chart was at 97a5992201a plus five cherry-picks
- **Context**: porting the named commits of 97a5992201a..a720bdd.
- **Finding**: every cartesian chart commit in the range was missing (missing values, interpolate, connect, index categories, pairs without range, spread values, LineThickness, fitted axis, source order, unquoted names, horizontal series, lenient/keyed data, list items); they had to be ported together (c4b0b86e0). Pie and radar (e8ef39dd55c, 66c9c180697) were ported afterwards (008b9361f, user ruling); the utxt/atxt outputs (08e8486ba27, chart/txt/) are not, see below.
- **Impact**: upstream's vega/chart fixtures are all authored rows now (vega-*), cartesian and polar.
- **Confidence**: High

## Observation: the jar hangs on a non-finite automatic value axis
- **Context**: cov-inf-bar (`bar [Infinity]`), empty oracle.
- **Finding**: `ChartAxis#withNiceRange` (ChartAxis.java:145-162) loops forever when a bound is Infinity or NaN. The port throws `ChartAxis.withNiceRange does not terminate on [...]` instead. No repo convention covers an authored row whose jar never finishes (oracle/no-oracle-reasons.json is for manifest rows only), so the row is left failing for a user ruling.
- **Impact**: cov-inf-bar fails the chart diff-baseline gate until ruled.
- **Confidence**: High

## Observation: the chart text outputs have no path to land on
- **Context**: porting 08e8486ba27 (chart/txt: ChartTxt, CartesianTxt, ValueTableTxt, CharGrid, TxtCharset) and the text-error half of 5ee1a051948.
- **Finding**: the port is SVG-only. `UgDiagram.ts` documents `exportTxt` as having no consumer, `CucaDiagramBase2.exportTxt` is an unported stub, and `GanttDiagram.ts` records that no engine ports `exportTxt`. Neither `src/` nor docs/catalog.md has a utxt/atxt output path, so the chart txt output was not built.
- **Impact**: utxt/atxt for any diagram needs a text-output seam first; that is a design decision, not a chart port.
- **Confidence**: High

## Observation: the YAML header commit only touches the TeaVM builders
- **Context**: 9c5968c6e43 (Read the YAML header in the browser and native editions).
- **Finding**: the change is in PSystemBuilderJs/PSystemBuilderC, which bypass BlockUml. The port's single entry already strips the header like BlockUml (`BlockUmlBuilder.ts` removeYamlHeader/getYamlHeader); the header's only reader is the Python preprocessor (`puml.metadata`, #214), which the port lacks, so vega/python/metadata/chart_pie_from_header cannot be added.
- **Impact**: nothing to port until the Python preprocessor exists.
- **Confidence**: High

## Observation: a stock upstream jar is not an oracle, even with deterministic text
- **Context**: rendering oracles for the plantuml/plantuml#3030 fix (efe6d85e5f3).
- **Finding**: `chart-hang/plantuml-fixed.jar` is built from upstream master without the fork's seams (0002-0005: deterministic text, svg property, space width, png bounder). Against a720bdd oracles of unaffected rows it differs in every text-derived number (cov-zero-single 16 diffs, cov-legend-top 73). A clone of `~/git/plantuml` `dot-output` (the oracle build) with the patch applied, `./gradlew jar -x test --offline` (about 10 s), reproduces them at 0 diffs.
- **Impact**: an oracle for an unreleased upstream fix must be built on the fork's dot-output branch, never taken from a stock build.
- **Confidence**: High

## Observation: javaDoubleToString writes Double.MIN_VALUE as 5.0E-324
- **Context**: the withNiceRange IllegalArgumentException message for a range of 4.9E-324.
- **Finding**: Java's `Double.toString(4.9E-324)` is "4.9E-324" (the jar prints it in the fixed build's message); `src/core/java-number-format.ts` `javaDoubleToString` answers "5.0E-324", the shortest round trip. Only subnormal extremes differ.
- **Impact**: fixed in d8e3d3e71: a one-digit shortest gives way to the closest two-digit decimal (JDK 19+ spec), checked against JDK 21 for twelve values.
- **Confidence**: High
