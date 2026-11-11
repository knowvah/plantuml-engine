/**
 * The regex engine's `SkinParam`, and the style its tiles freeze in `PSystemRegex`'s constructor.
 *
 * **The class is ebnf's**, re-exported: every tile `PSystemRegex.java` builds (`ETileBox`, `ETileRegexGroup`,
 * `ETileZeroOrMore`, …) takes `ebnf-skin-param.ts#SkinParam` by its nominal class type, and a copy with private
 * fields would not be assignable to it. Upstream hands both engines the same `skin/SkinParam`, so one port of the
 * slice serves both (rep D2, amended in the journal).
 *
 * **The tile style** is upstream's constructor order (rep D3): `new StyleExtractor(source.iterator2())`, then
 * `applyStyles(skinParam)` — the default skin, the `skin` line and every `<style>` block, theme's included — and
 * only then `ETile.getStyleSignature().getMergedStyle(…)`. No `skinparam` command has run yet, so none reaches a
 * tile; the document still reads the full builder later (`TitledDiagram#calculateBackColor`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regexdiagram/PSystemRegex.java:82-97
 */
import type { UmlSource } from '../../core/block-extractor.js';
import type { StyleBuilder } from '../../core/style/StyleBuilder.js';
import { applyStyles } from '../json/StyleExtractor.js';

export { SkinParam, type SkinParamSource } from '../ebnf/ebnf-skin-param.js';

/**
 * The builder `PSystemRegex`'s constructor reads: `applyStyles` over the source's `skin` and `<style>` blocks. Its
 * `StyleParsingException` is printed and dropped upstream (`e.printStackTrace()`), so it is dropped here.
 * @see PSystemRegex.java:84-93
 */
export function tileStyleBuilder(source: Pick<UmlSource, 'styleSource' | 'stylePositions'>): StyleBuilder {
  return applyStyles(source).style.getCurrentStyleBuilder();
}
