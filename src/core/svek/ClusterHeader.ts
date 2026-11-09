/**
 * `ClusterHeader` — the title block of a group and the `(int)` size of the title table the DOT reserves for it
 * (`ClusterDotString` writes `getTitleAndAttributeWidth()` by `getTitleAndAttributeHeight() - 5`).
 *
 * Port notes (laep T2b): the legend (`DecorateEntityImage`), the visibility modifier and a non-empty state
 * description are branches no legacy activity group reaches (a partition has none of them), and throw
 * `unported:` rather than answer a guess. The `STATE` signature is not ported either: the group's diagram type
 * is read from the skin param by upstream, here the caller passes the style name.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/ClusterHeader.java:56-215
 */
import type { Entity } from '../abel/Entity.js';
import { GroupType } from '../abel/GroupType.js';
import type { PortionShower } from '../cucadiagram/PortionShower.js';
import { Display } from '../klimt/creole/Display.js';
import { bridgeFontConfiguration } from '../klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../klimt/geom/HorizontalAlignment.js';
import type { TextBlock } from '../klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../klimt/shape/TextBlockUtils.js';
import type { SName } from '../style/SName.js';
import type { Style } from '../style/Style.js';
import { StyleSignatureBasic } from '../style/StyleSignatureBasic.js';
import type { LeafImageSkinParam } from './image/AbstractEntityImage.js';

/** @see ClusterHeader.java:58-59 */
export interface ClusterHeaderResult {
  readonly titleAndAttributeWidth: number;
  readonly titleAndAttributeHeight: number;
  readonly title: TextBlock;
  readonly stereo: TextBlock;
}

/** `getSignature`, for a group with no `USymbol` (the legacy activity partition). @see ClusterHeader.java:121-136 */
function getSignature(styleName: SName, g: Entity): StyleSignatureBasic {
  if (g.getUSymbol() !== undefined) throw new Error('unported: ClusterHeader#getSignature for a USymbol group');
  if (g.getGroupType() === GroupType.PACKAGE)
    return StyleSignatureBasic.of('root', 'element', styleName, 'package_', 'title');

  return StyleSignatureBasic.of('root', 'element', styleName, 'composite', 'title');
}

/** @see ClusterHeader.java:113-119 */
function getStyle(styleName: SName, g: Entity, skinParam: LeafImageSkinParam): Style {
  const style = getSignature(styleName, g)
    .withTOBECHANGED(g.getStereotype())
    .with(g.getStereostyles())
    .getMergedStyle(skinParam.getCurrentStyleBuilder());
  if (style === undefined) throw new Error('NullPointerException: no title style merged for the group');
  return style;
}

/** `getTitleBlock`. @see ClusterHeader.java:85-111 */
function getTitleBlock(styleName: SName, g: Entity, skinParam: LeafImageSkinParam): TextBlock {
  const label = g.getDisplay();
  const style = getStyle(styleName, g, skinParam);
  const fontConfiguration = bridgeFontConfiguration(
    style.getFontConfiguration(skinParam.getIHtmlColorSet(), g.getColors()),
  );
  const alignment = style.getHorizontalAlignment() ?? HorizontalAlignment.LEFT;
  if (g.getVisibilityModifier() !== undefined) throw new Error('unported: ClusterHeader visibility modifier');

  return label.create({ fontConfiguration, spriteContainer: skinParam, atomOps: skinParam.atomOps }, alignment);
}

/** The labels `getStereoBlockWithoutLegend` draws, none when the block is empty. @see ClusterHeader.java:160-176 */
function drawnStereotypeLabels(
  g: Entity,
  skinParam: LeafImageSkinParam,
  portionShower: PortionShower,
): readonly string[] {
  const stereotype = g.getStereotype();
  if (stereotype === undefined) return [];

  if (stereotype.getSprite(undefined) !== undefined) throw new Error('unported: ClusterHeader stereotype sprite');

  if (stereotype.getLabels(skinParam.guillemet()).length === 0) return [];

  return portionShower.getVisibleStereotypeLabels(g) ?? [];
}

/** `getStereoBlockWithoutLegend`. @see ClusterHeader.java:152-190 */
function getStereoBlock(
  styleName: SName,
  g: Entity,
  skinParam: LeafImageSkinParam,
  portionShower: PortionShower,
): TextBlock {
  const legend = g.getLegend();
  if (legend !== undefined && !legend.isNull()) throw new Error('unported: ClusterHeader legend');

  const visibleStereotypes = drawnStereotypeLabels(g, skinParam, portionShower);
  if (visibleStereotypes.length === 0) return TextBlockUtils.empty(0, 0);

  const style = StyleSignatureBasic.of('root', 'element', styleName, 'package_', 'group')
    .forStereotypeItself(g.getStereotype())
    .getMergedStyle(skinParam.getCurrentStyleBuilder());
  if (style === undefined) throw new Error('NullPointerException: no stereotype style merged for the group');

  const fontConfiguration = bridgeFontConfiguration(style.getFontConfiguration(skinParam.getIHtmlColorSet()));
  const horizontalAlignment = getStyle(styleName, g, skinParam).getHorizontalAlignment() ?? HorizontalAlignment.LEFT;
  return Display.create(visibleStereotypes).create(
    { fontConfiguration, spriteContainer: skinParam, atomOps: skinParam.atomOps },
    horizontalAlignment,
  );
}

/**
 * `g.getStateDescription(skinParam).calculateDimension(stringBounder)`. `Entity#getStateDescription` is a deferred
 * port (SI1/ADR-2: its style lookup throws), but with no body line upstream answers `new TextBlockEmpty()`
 * (Entity.java:615-617), a 0x0 block, which is every partition: that case is read directly here, a body is not.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/abel/Entity.java:610-633
 */
function stateDescriptionDim(
  g: Entity,
  skinParam: LeafImageSkinParam,
  stringBounder: StringBounder,
): { width: number; height: number } {
  if (g.getBodier().getRawBody().length === 0) return { width: 0, height: 0 };

  const dim = g.getStateDescription(skinParam).calculateDimension(stringBounder);
  return { width: dim.getWidth(), height: dim.getHeight() };
}

/**
 * The constructor: the merged stereotype-and-title block, and its `(int)` size when it has a width.
 * @see ClusterHeader.java:61-83
 */
export function createClusterHeader(
  g: Entity,
  styleName: SName,
  skinParam: LeafImageSkinParam,
  portionShower: PortionShower,
  stringBounder: StringBounder,
): ClusterHeaderResult {
  const title = getTitleBlock(styleName, g, skinParam);
  const stereo = getStereoBlock(styleName, g, skinParam, portionShower);
  const alignment = getStyle(styleName, g, skinParam).getHorizontalAlignment() ?? HorizontalAlignment.LEFT;
  const dimLabel = TextBlockUtils.mergeTB(stereo, title, alignment).calculateDimension(stringBounder);
  let titleAndAttributeWidth = 0;
  let titleAndAttributeHeight = 0;
  if (dimLabel.getWidth() > 0) {
    const dimAttribute = stateDescriptionDim(g, skinParam, stringBounder);
    if (g.getUSymbol() !== undefined) throw new Error('unported: ClusterHeader USymbol supplements');
    const marginForFields = dimAttribute.height > 0 ? MARGIN : 0;
    titleAndAttributeWidth = Math.trunc(Math.max(dimLabel.getWidth(), dimAttribute.width));
    titleAndAttributeHeight = Math.trunc(dimLabel.getHeight() + dimAttribute.height + marginForFields);
  }
  return { titleAndAttributeWidth, titleAndAttributeHeight, title, stereo };
}

/** `IEntityImage.MARGIN`. @see IEntityImage.java:45 */
const MARGIN = 5;
