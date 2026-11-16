/**
 * Style reads shared by every engine that draws through `SvekEdge` and the
 * description-family entity images: a `Style` value as this renderer's
 * `Paint`, its `FontConfiguration`, and the arrow / cardinality styles of one
 * link's builder. Moved here from `diagrams/description/description-entity-style.ts`
 * (cogr T4h2 gate fix) so that class reads them without a diagrams-to-diagrams
 * import (`tests/architecture/layering.test.ts`, rule 2).
 */
import { HColorGradient } from '../klimt/color/HColorGradient.js';
import { HColorSet } from '../klimt/color/HColorSet.js';
import { HColorSimple } from '../klimt/color/HColorSimple.js';
import { bridgeFontConfiguration } from '../klimt/font/FontConfigurationBridge.js';
import type { FontConfiguration } from '../klimt/shape/UText.js';
import type { Paint } from '../paint.js';
import type { Stereotype } from '../stereo/Stereotype.js';
import type { PName } from './PName.js';
import type { SName } from './SName.js';
import type { Style } from './Style.js';
import type { StyleBuilder } from './StyleBuilder.js';
import { StyleSignatureBasic } from './StyleSignatureBasic.js';

/** `style.value(name).asColor(set)`, as this renderer's `Paint`; `undefined` where the style has no colour value. */
export function stylePaint(style: Style | undefined, name: PName): Paint | undefined {
  if (style === undefined) return undefined;
  const value = style.value(name);
  if (value.asString() === '') return undefined;
  const color = value.asColor(HColorSet.instance());
  return color instanceof HColorSimple || color instanceof HColorGradient ? color.asPaint() : undefined;
}

/** `Style#getFontConfiguration(set)` as the renderer's and the sizer's one `FontConfiguration`. */
export function styleFont(style: Style | undefined): FontConfiguration | undefined {
  return style === undefined ? undefined : bridgeFontConfiguration(style.getFontConfiguration(HColorSet.instance()));
}

/**
 * `getDefaultStyleDefinition(stereotype).getMergedStyle(link.getStyleBuilder())` (`SvekEdge.java:816-821,874-875`) and
 * `getStyleArrowCardinality` (`GraphvizImageBuilder.java:124-130,237`) over one builder, for any diagram type that
 * draws its links through `SvekEdge` (`diagram` is its `getStyleName`).
 */
export function linkStylesOf(
  builder: StyleBuilder,
  stereotype: Stereotype | undefined,
  diagram: SName,
): { arrowStyle: Style | undefined; cardinalityStyle: Style | undefined } {
  const arrow = StyleSignatureBasic.of('root', 'element', diagram, 'arrow');
  const cardinality = StyleSignatureBasic.of('root', 'element', diagram, 'arrow', 'cardinality');
  return {
    arrowStyle: arrow.withTOBECHANGED(stereotype).getMergedStyle(builder),
    cardinalityStyle: cardinality.withTOBECHANGED(stereotype).getMergedStyle(builder),
  };
}
