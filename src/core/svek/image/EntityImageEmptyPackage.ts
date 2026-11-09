/**
 * `EntityImageEmptyPackage` — a package with no content, drawn as one node: `ClusterDecoration` over the title block
 * (a partition that holds nothing is muted to `LeafType.EMPTY_PACKAGE`, `GraphvizImageBuilder.java:416-418`). No `<g>`
 * wraps it, as in the jar.
 *
 * Port-only: the stereotype block (`FontConfiguration.create(skinParam, FontParam.PACKAGE_STEREOTYPE, stereotype)`)
 * and the legend (`EntityImageLegend`) are not ported; an entity that would draw either throws `unported:`.
 * `getSkinParam().packageStyle()` and the two alignments are read through {@link EmptyPackageSkinParam}.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageEmptyPackage.java:70-193
 */
import type { Entity } from '../../abel/Entity.js';
import { EntityPortion } from '../../abel/EntityPortion.js';
import type { PortionShower } from '../../cucadiagram/PortionShower.js';
import type { HColorOrPaint } from '../../klimt/color/ColorMapper.js';
import { bridgeFontConfiguration } from '../../klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import { HorizontalAlignment, horizontalAlignmentFromString } from '../../klimt/geom/HorizontalAlignment.js';
import type { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../klimt/shape/TextBlockUtils.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import type { UStroke } from '../../klimt/UStroke.js';
import { ColorType } from '../../abel/ColorType.js';
import type { StyleSignature } from '../../style/StyleSignature.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import type { Url } from '../../url/Url.js';
import { ClusterDecoration } from '../ClusterDecoration.js';
import { PackageStyle, type PackageStyleName } from '../PackageStyle.js';
import { ShapeType } from '../ShapeType.js';
import { AbstractEntityImage, type LeafImageSkinParam } from './AbstractEntityImage.js';
import { asPaintColor } from './leaf-image-support.js';

/** The skin-param reads beyond {@link LeafImageSkinParam}: `packageStyle()`, `packageTitleAlignment`, `stereotypeAlignment`. */
export interface EmptyPackageSkinParam extends LeafImageSkinParam {
  getValue(key: string): string | null;
}

/** @see EntityImageEmptyPackage.java:78 */
const MARGIN = 10;

/** The `startUrl`/`closeUrl` surface of concrete UGraphics, outside the scoped `UGraphic` interface. */
type UGraphicWithUrl = UGraphic & Partial<{ startUrl(url: Url): void; closeUrl(): void }>;

/** `SkinParam#packageStyle`: `packageStyle`, else FOLDER. @see SkinParam.java:819-826 */
function packageStyleOf(skinParam: EmptyPackageSkinParam): PackageStyleName {
  const value = skinParam.getValue('packagestyle')?.trim().toUpperCase();
  return Object.values(PackageStyle).find((name) => name === value) ?? PackageStyle.FOLDER;
}

/** `getHorizontalAlignment(AlignmentParam.packageTitleAlignment, null, false, null)`: the value, else CENTER. @see SkinParam.java:716-727, AlignmentParam.java:44 */
function packageTitleAlignmentOf(skinParam: EmptyPackageSkinParam): HorizontalAlignment {
  return horizontalAlignmentFromString(skinParam.getValue('packagetitlealignment')) ?? HorizontalAlignment.CENTER;
}

/** `getStereotypeAlignment()`: the value, else CENTER. @see SkinParam.java:1090-1096 */
function stereotypeAlignmentOf(skinParam: EmptyPackageSkinParam): HorizontalAlignment {
  return horizontalAlignmentFromString(skinParam.getValue('stereotypealignment')) ?? HorizontalAlignment.CENTER;
}

/** What the constructor reads off the merged style. */
interface PackageLook {
  readonly borderColor: HColorOrPaint;
  readonly shadowing: number;
  readonly stroke: UStroke;
  readonly roundCorner: number;
  readonly diagonalCorner: number;
  readonly back: HColorOrPaint;
  readonly desc: TextBlock;
}

/** `getStyle()` then `style.eventuallyOverride(colors)`, and the colours, stroke and title built from it. @see EntityImageEmptyPackage.java:98-132 */
function readLook(entity: Entity, skinParam: EmptyPackageSkinParam, signature: StyleSignature): PackageLook {
  const colors = entity.getColors();
  const set = skinParam.getIHtmlColorSet();
  const merged = signature.withTOBECHANGED(entity.getStereotype()).getMergedStyle(skinParam.getCurrentStyleBuilder());
  if (merged === undefined) throw new Error('NullPointerException: no package title style merged');
  const style = merged.eventuallyOverride(colors);
  const fontConfiguration = bridgeFontConfiguration(style.getFontConfiguration(set));
  const alignment = style.getHorizontalAlignment() ?? HorizontalAlignment.LEFT;
  return {
    borderColor: asPaintColor(style.value('LineColor').asColor(set)),
    shadowing: style.getShadowing(),
    stroke: colors.getSpecificLineStroke() ?? style.getStroke(),
    roundCorner: style.value('RoundCorner').asDouble(),
    diagonalCorner: style.value('DiagonalCorner').asDouble(),
    back: asPaintColor(colors.getColor(ColorType.BACK) ?? style.value('BackGroundColor').asColor(set)),
    desc: entity
      .getDisplay()
      .create({ fontConfiguration, spriteContainer: skinParam, atomOps: skinParam.atomOps }, alignment),
  };
}

/** The legend and stereotype blocks of `EntityImageEmptyPackage.java:134-142` are not ported. */
function requireNoStereotypeOrLegend(
  entity: Entity,
  skinParam: EmptyPackageSkinParam,
  portionShower: PortionShower,
): void {
  if (entity.getLegend() !== undefined) throw new Error('unported: EntityImageLegend on an empty package');
  const stereotype = entity.getStereotype();
  if (
    stereotype !== undefined &&
    stereotype.getLabels(skinParam.guillemet()).length > 0 &&
    portionShower.showPortion(EntityPortion.STEREOTYPE, entity)
  )
    throw new Error('unported: the PACKAGE_STEREOTYPE block of EntityImageEmptyPackage');
}

/** @see EntityImageEmptyPackage.java:70 */
export class EntityImageEmptyPackage extends AbstractEntityImage {
  private readonly desc: TextBlock;
  private readonly stereoBlock: TextBlock;
  private readonly url: Url | undefined;
  private readonly shadowing: number;
  private readonly borderColor: HColorOrPaint;
  private readonly stroke: UStroke;
  private readonly roundCorner: number;
  private readonly diagonalCorner: number;
  private readonly back: HColorOrPaint;
  private readonly packageStyle: PackageStyleName;
  private readonly titleAlignment: HorizontalAlignment;
  private readonly stereotypeAlignment: HorizontalAlignment;

  /** `{root, element, <diagram style name>, package_, title}`. @see EntityImageEmptyPackage.java:94-96 */
  override getStyleSignature(): StyleSignature {
    return StyleSignatureBasic.of('root', 'element', this.getStyleName(), 'package_', 'title');
  }

  /** @see EntityImageEmptyPackage.java:103-143 */
  constructor(entity: Entity, skinParam: EmptyPackageSkinParam, portionShower: PortionShower) {
    super(entity, skinParam);
    this.url = entity.getUrl99();
    const look = readLook(entity, skinParam, this.getStyleSignature());
    this.borderColor = look.borderColor;
    this.shadowing = look.shadowing;
    this.stroke = look.stroke;
    this.roundCorner = look.roundCorner;
    this.diagonalCorner = look.diagonalCorner;
    this.back = look.back;
    this.desc = look.desc;

    requireNoStereotypeOrLegend(entity, skinParam, portionShower);
    this.stereoBlock = TextBlockUtils.empty(0, 0);

    this.packageStyle = packageStyleOf(skinParam);
    this.titleAlignment = packageTitleAlignmentOf(skinParam);
    this.stereotypeAlignment = stereotypeAlignmentOf(skinParam);
  }

  /** @see EntityImageEmptyPackage.java:145-151 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    const dimDesc = this.desc.calculateDimension(stringBounder);
    let dim = TextBlockUtils.mergeTB(this.desc, this.stereoBlock, HorizontalAlignment.LEFT).calculateDimension(
      stringBounder,
    );
    dim = dim.atLeast(0, 2 * dimDesc.getHeight());
    return dim.delta(MARGIN * 2, MARGIN * 2);
  }

  /** @see EntityImageEmptyPackage.java:153-173 */
  drawU(ug: UGraphic): void {
    const withUrl = ug as UGraphicWithUrl;
    if (this.url !== undefined) withUrl.startUrl?.(this.url);

    const dimTotal = this.calculateDimension(ug.getStringBounder());
    const decoration = new ClusterDecoration(
      this.packageStyle,
      null,
      this.desc,
      this.stereoBlock,
      { position: UTranslate.none(), width: dimTotal.getWidth(), height: dimTotal.getHeight() },
      this.stroke,
    );
    decoration.drawU(
      ug,
      this.back,
      this.borderColor,
      this.shadowing,
      this.roundCorner,
      this.titleAlignment,
      this.stereotypeAlignment,
      this.diagonalCorner,
    );

    if (this.url !== undefined) withUrl.closeUrl?.();
  }

  /** @see EntityImageEmptyPackage.java:175-177 */
  getShapeType(): ShapeType {
    return ShapeType.RECTANGLE;
  }
}
