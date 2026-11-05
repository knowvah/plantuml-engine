/**
 * `RoundCorner` of a chrome box, off the merged style.
 *
 * `skinparam roundcorner` is `root { RoundCorner }` (`FromSkinparamToStyle.java:164`), and every chrome signature holds
 * `root`, so it competes with `legendBorderRoundCorner` (`:175`), `titleBorderRoundCorner` (`:169`) and `<style>` on the
 * one declaration counter: the last declaration wins whichever selector it names (jar grid,
 * `tests/fixtures/c4dd-T2a`). The per-element overlay in `style.ts` has no `root` step for it, and folding one in would
 * re-derive that merge, so this reads the merge itself. Only under `skinparam roundcorner`: every other source keeps
 * the overlay's answer, as ddd D2's "new reads only" has it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/FromSkinparamToStyle.java:164
 */
import { currentStyleBuilderOf } from '../document-back-color.js';
import type { SName } from '../style/SName.js';
import type { StyleBuilder } from '../style/StyleBuilder.js';
import { StyleParsingException } from '../style/parser/StyleParser.js';
import { StyleSignatureBasic } from '../style/StyleSignatureBasic.js';
import type { StyleSkinparamSource } from '../style-skinparam-segments.js';
import type { AnnotationElement } from './annotation-style-types.js';

/** `SkinParam#getValue`'s lowercased key for `FromSkinparamToStyle.java:164`. */
const ROOT_ROUND_CORNER_KEY = 'roundcorner';

/** The corner of one element, `undefined` where the overlay stands. */
export type MergedRoundCorner = (element: AnnotationElement, styleName: SName | undefined) => number | undefined;

const NO_MERGED_ROUND_CORNER: MergedRoundCorner = () => undefined;

/**
 * Each element's signature: `DiagramChromeFactory.java:284,368,388,414,425`; the legend's
 * `EntityImageLegend.java:49-51`, with no style name for the diagram-agnostic one (`style.ts#resolveAnnotationStyles`).
 */
function signatureOf(element: AnnotationElement, styleName: SName | undefined): StyleSignatureBasic {
  if (element !== 'legend') return StyleSignatureBasic.of('root', 'document', element);
  return styleName === undefined
    ? StyleSignatureBasic.of('root', 'root', 'document', 'legend')
    : StyleSignatureBasic.of('root', 'root', 'document', styleName, 'legend');
}

/** `CommandStyleMultilinesCSS.java:92-93`: a `<style>` the parser rejects leaves the document's style as it was. */
function tryBuilder(source: StyleSkinparamSource): StyleBuilder | undefined {
  try {
    return currentStyleBuilderOf(source);
  } catch (e) {
    if (e instanceof StyleParsingException) return undefined;
    throw e;
  }
}

/** One builder per call, built on the first element that asks. */
export function mergedRoundCornerReader(
  declarations: ReadonlyMap<string, string> | StyleSkinparamSource,
): MergedRoundCorner {
  const source: StyleSkinparamSource =
    'styles' in declarations ? declarations : { skinparam: declarations, styles: [] };
  if (!source.skinparam.has(ROOT_ROUND_CORNER_KEY)) return NO_MERGED_ROUND_CORNER;
  let builder: StyleBuilder | undefined;
  let built = false;
  return (element, styleName) => {
    if (!built) {
      builder = tryBuilder(source);
      built = true;
    }
    if (builder === undefined) return undefined;
    return signatureOf(element, styleName).getMergedStyle(builder)?.value('RoundCorner').asDouble();
  };
}
