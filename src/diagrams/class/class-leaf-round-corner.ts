/**
 * The `RoundCorner` a description leaf's ink walk is built with. `EntityImageDescription.java:171`
 * `styleTitle.value(PName.RoundCorner)` reaches `Fashion.withCorner`, and `USymbolFile#drawFile`
 * (`USymbolFile.java:62-86`) draws a `UPolygon` when it is 0 (`LimitFinder#drawUPolygon` widens it by
 * `HACK_X_FOR_POLYGON`) and a `UPath` otherwise. The sizing construction hardcodes 0, so a rounded file's ink
 * grew 10 on each side that the jar's did not.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/decoration/symbol/USymbolFile.java:62-86
 */
import type { Classifier } from './ast.js';
import type { Theme } from '../../core/theme.js';
import type { USymbol } from '../../core/descriptive-keywords.js';
import { resolveStyleStereotypeTags } from './class-stereotype.js';
import { byStereo } from './class-package-style.js';
import { ELEMENT_ROUND_CORNER } from './renderer-usymbol-entity-style.js';

/** The leaf's `RoundCorner`: the `<sname><<label>>` tier over the skin's default (`resolveCorners`' twin, unscaled). */
export function leafRoundCorner(classifier: Classifier, theme: Pick<Theme, 'colors'>, symbol: USymbol): number {
  const own = theme.colors.elements?.[symbol];
  return byStereo(own?.roundCornerByStereo, resolveStyleStereotypeTags(classifier)) ?? ELEMENT_ROUND_CORNER;
}
