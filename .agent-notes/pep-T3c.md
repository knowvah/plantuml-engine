## Observation: CreoleParser ignored its creole mode when classifying a stripe
- **Context**: pep T3c probe `cov-label-cut-creole` (packet label `**Acknowledgment**` cut to `**Acknow...`)
- **Finding**: `CreoleParser.ts` called `classifyStripeLine(line)` with the default FULL mode, where Java passes `creoleMode` (`CreoleParser.java:113`). Under SIMPLE_LINE a leading `**` became a bullet list item (a 3.5px rect) instead of literal text. `classifyStripeLine` also lacked Java's NO_CREOLE early return (`CreoleStripeSimpleParser.java:86-90`). Both fixed at the origin.
- **Impact**: every engine that builds a SIMPLE_LINE or NO_CREOLE sheet through the shared `CreoleParser` now classifies as upstream does; the pep batch-3 verdict-diff measures what moved.
- **Confidence**: High

## Observation: chart's sprite registry carries no emoji store
- **Context**: pep T3c probe `cov-label-emoji`: packet measured the emoji but drew no outline
- **Finding**: klimt engines built on chart's factory shape call `createSpriteRegistry()` with no Twemoji store, so `<:emoji:>` atoms size correctly and draw nothing. Packet now takes the store from `options.assetStore` as `gantt/index.ts` does. `chart/ChartDiagramFactory.ts:290` still passes none.
- **Impact**: a chart label with an emoji likely draws without its outline; unmeasured (no chart fixture has one).
- **Confidence**: Medium (packet measured; chart inferred from the same code shape)
