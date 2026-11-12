/**
 * What the four `EntityImageChen*` images share. Upstream repeats these members verbatim in each class
 * (`hasStereotype`, `getStyle*`, `applyColor`, the title block, the `ID` group and URL frame of `drawU`); this
 * port writes each once and each image keeps the Java name on a one-line delegate.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageChenEntity.java:85-87, 98-106, 122-124, 140-144, 147-161
 */
import { ColorType } from '../../abel/ColorType.js';
import type { Entity } from '../../abel/Entity.js';
import type { SName } from '../../style/SName.js';
import { bridgeFontConfiguration } from '../../klimt/font/FontConfigurationBridge.js';
import { HorizontalAlignment } from '../../klimt/geom/HorizontalAlignment.js';
import { CreoleMode } from '../../klimt/creole/CreoleMode.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { FontStyle, type FontConfiguration } from '../../klimt/shape/UText.js';
import { UGroup, UGroupType } from '../../klimt/shape/UGroup.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import type { UStroke } from '../../klimt/UStroke.js';
import type { Style } from '../../style/Style.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import type { Url } from '../../url/Url.js';
import type { LeafImageSkinParam } from './AbstractEntityImage.js';
import { applyBack, applyFore, asPaintColor, mergedStyleOf, styleColor } from './leaf-image-support.js';

/** The `startUrl`/`closeUrl` surface of concrete UGraphics, outside the scoped `UGraphic` interface. */
type UGraphicWithUrl = UGraphic & Partial<{ startUrl(url: Url): void; closeUrl(): void }>;
/** The `startGroup`/`closeGroup` surface of concrete UGraphics. */
type UGraphicWithGroup = UGraphic & Partial<{ startGroup(group: UGroup): void; closeGroup(): void }>;

/** The four leaf names under `root/element/chenEerDiagram`. @see EntityImageChen*.java `getStyleSignature` */
export type ChenLeafName = Extract<SName, 'chenEntity' | 'chenRelationship' | 'chenAttribute' | 'circle'>;

/**
 * `getEntity().getStereotype() != null && getEntity().getStereotype().toString().contains(stereotype)`: a substring
 * test, so `<<weak>>` combined with `<<big>>` still matches (D8).
 * @see EntityImageChenEntity.java:85-87
 */
export function hasStereotype(entity: Entity, stereotype: string): boolean {
  const stereo = entity.getStereotype();
  return stereo !== undefined && stereo.toString().includes(stereotype);
}

/**
 * `StyleSignatureBasic.of(root, element, chenEerDiagram, <leaf>[, title]).withTOBECHANGED(stereotype)
 * .getMergedStyle(skinParam.getCurrentStyleBuilder())`.
 * @see EntityImageChenEntity.java:98-106
 */
export function getChenStyle(leaf: ChenLeafName, entity: Entity, skinParam: LeafImageSkinParam, title: boolean): Style {
  const names: SName[] = ['root', 'element', 'chenEerDiagram', leaf];
  if (title) names.push('title');
  const signature = StyleSignatureBasic.of(...names).withTOBECHANGED(entity.getStereotype());
  return mergedStyleOf(signature, skinParam.getCurrentStyleBuilder());
}

/**
 * `FontConfiguration#underline()` is `add(FontStyle.UNDERLINE)`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/font/FontConfiguration.java:327-329
 */
function underline(fc: FontConfiguration): FontConfiguration {
  return { ...fc, styles: new Set(fc.styles).add(FontStyle.UNDERLINE) };
}

/**
 * The `title` field every constructor builds: the title style's font configuration (with the entity's colours),
 * underlined for `<<key>>` on an attribute or circle, `create8(.., CENTER, FULL, <main style>.wrapWidth())`.
 * @see EntityImageChenAttribute.java:77-94
 */
export function createChenTitle(
  entity: Entity,
  skinParam: LeafImageSkinParam,
  titleStyle: Style,
  mainStyle: Style,
  underlined: boolean,
): TextBlock {
  const base = bridgeFontConfiguration(
    titleStyle.getFontConfiguration(skinParam.getIHtmlColorSet(), entity.getColors()),
  );
  const fontConfiguration = underlined ? underline(base) : base;
  return entity
    .getDisplay()
    .create8(
      { fontConfiguration, spriteContainer: skinParam, atomOps: skinParam.atomOps },
      HorizontalAlignment.CENTER,
      CreoleMode.FULL,
      mainStyle.wrapWidth(),
    );
}

/**
 * `style.getStroke(colors)`: the entity's own line stroke, else the style's.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/Style.java:322-328
 */
export function getStroke(style: Style, entity: Entity): UStroke {
  return entity.getColors().getSpecificLineStroke() ?? style.getStroke();
}

/**
 * `applyColor`: the entity's LINE colour else the style's `LineColor`, then its BACK colour else `BackGroundColor`.
 * @see EntityImageChenEntity.java:147-161
 */
export function applyChenColor(ug: UGraphic, entity: Entity, style: Style, skinParam: LeafImageSkinParam): UGraphic {
  const colors = entity.getColors();
  const set = skinParam.getIHtmlColorSet();

  const line = colors.getColor(ColorType.LINE);
  const border = line === undefined ? styleColor(style, 'LineColor', set) : asPaintColor(line);

  const back = colors.getColor(ColorType.BACK);
  const backcolor = back === undefined ? styleColor(style, 'BackGroundColor', set) : asPaintColor(back);

  return applyBack(applyFore(ug, border), backcolor);
}

/**
 * The head of every `drawU`: `ug.startGroup(UGroup.singletonMap(UGroupType.ID, quark.toStringPoint()))`, then
 * `startUrl` when `getUrl99()` is set. No Chen command sets a URL today, so the URL branch is not reached.
 * @see EntityImageChenEntity.java:122-124
 */
export function startChenGroup(ug: UGraphic, entity: Entity, url: Url | undefined): void {
  const grouped = ug as UGraphicWithGroup;
  if (grouped.startGroup === undefined || grouped.closeGroup === undefined)
    throw new Error('EntityImageChen: ug does not support startGroup/closeGroup (see UGraphicSvg)');
  grouped.startGroup(UGroup.singletonMap(UGroupType.ID, entity.getQuark().toStringPoint()));
  if (url !== undefined) (ug as UGraphicWithUrl).startUrl?.(url);
}

/**
 * The tail of every `drawU`: `closeUrl` when there is a URL, then `closeGroup`.
 * @see EntityImageChenEntity.java:140-144
 */
export function closeChenGroup(ug: UGraphic, url: Url | undefined): void {
  if (url !== undefined) (ug as UGraphicWithUrl).closeUrl?.();
  (ug as UGraphicWithGroup).closeGroup?.();
}
