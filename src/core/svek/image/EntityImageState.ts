/**
 * `EntityImageState` (with `EntityImageStateCommon`) — a state box: the entity's name over a separator line and its
 * raw body as fields. The legacy activity engine builds one for an empty inner activity
 * (`(*) --> {` then `}`, `GroupMakerActivity.java:113-114`), whose name is the group's auto-generated one.
 *
 * Not ported, each throwing `unported:`: the `RoundedContainer` branch (the name and description back colours
 * differ) and the OO symbol (`stereotype.isWithOOSymbol()`), which no empty inner activity reaches. The state
 * engine keeps its own drawing of states (`src/diagrams/state/`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageState.java:56-198
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageStateCommon.java:57-171
 */
import type { Entity } from '../../abel/Entity.js';
import type { IEntityImage } from '../../abel/IEntityImage.js';
import { ColorType } from '../../abel/ColorType.js';
import { CreoleMode } from '../../klimt/creole/CreoleMode.js';
import { Display } from '../../klimt/creole/Display.js';
import { bridgeFontConfiguration } from '../../klimt/font/FontConfigurationBridge.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../klimt/geom/HorizontalAlignment.js';
import type { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { ULine } from '../../klimt/shape/ULine.js';
import { URectangle } from '../../klimt/shape/URectangle.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import type { Stereotype } from '../../stereo/Stereotype.js';
import type { Style } from '../../style/Style.js';
import type { StyleBuilder } from '../../style/StyleBuilder.js';
import type { StyleSignature } from '../../style/StyleSignature.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import type { Url } from '../../url/Url.js';
import { ENTITY_IMAGE_MARGIN, ENTITY_IMAGE_MARGIN_LINE } from '../IEntityImage.js';
import { ShapeType } from '../ShapeType.js';
import { AbstractEntityImage, type LeafImageSkinParam } from './AbstractEntityImage.js';
import { applyBack, applyFore, asPaintColor, entityGroup, inGroup } from './leaf-image-support.js';

/** @see EntityImageState.java:58-59 */
const MIN_WIDTH = 50;
const MIN_HEIGHT = 50;

/** `STYLE`. @see EntityImageStateCommon.java:60-61 */
const STYLE = StyleSignatureBasic.of('root', 'element', 'stateDiagram', 'state');

/** The `startUrl`/`closeUrl` surface of concrete UGraphics, outside the scoped `UGraphic` interface. */
type UGraphicWithUrl = UGraphic & Partial<{ startUrl(url: Url): void; closeUrl(): void }>;

function mergedOrThrow(
  signature: StyleSignatureBasic,
  stereotype: Stereotype | undefined,
  builder: StyleBuilder,
): Style {
  const style = signature.withTOBECHANGED(stereotype).getMergedStyle(builder);
  if (style === undefined) throw new Error('NullPointerException: no state style merged');
  return style;
}

/** @see EntityImageState.java:56 */
export class EntityImageState extends AbstractEntityImage implements IEntityImage {
  readonly __iEntityImageBrand?: never;
  private readonly name: TextBlock;
  private readonly fields: TextBlock;
  private readonly url: Url | undefined;
  private readonly style: Style;
  private readonly styleName: Style;
  private readonly styleDescription: Style;

  /** @see EntityImageStateCommon.java:84-86 */
  override getStyleSignature(): StyleSignature {
    return STYLE;
  }

  /** @see EntityImageState.java:73-97, EntityImageStateCommon.java:70-82 */
  constructor(entity: Entity, skinParam: LeafImageSkinParam) {
    super(entity, skinParam);
    const stereotype = entity.getStereotype();
    if (stereotype?.isWithOOSymbol() === true) throw new Error('unported: EntityImageState OO symbol');

    const builder = skinParam.getCurrentStyleBuilder();
    const set = skinParam.getIHtmlColorSet();
    this.style = mergedOrThrow(STYLE, stereotype, builder);
    this.styleName = mergedOrThrow(STYLE.addSName('name'), stereotype, builder);
    this.styleDescription = mergedOrThrow(STYLE.addSName('description'), stereotype, builder);

    const nameFc = bridgeFontConfiguration(this.styleName.getFontConfiguration(set, entity.getColors()));
    this.name = entity
      .getDisplay()
      .create8(
        { fontConfiguration: nameFc, spriteContainer: skinParam, atomOps: skinParam.atomOps },
        this.style.getHorizontalAlignment() ?? HorizontalAlignment.LEFT,
        CreoleMode.FULL,
        this.style.wrapWidth(),
      );
    this.url = entity.getUrl99();

    const fieldsFc = bridgeFontConfiguration(this.styleDescription.getFontConfiguration(set));
    this.fields = Display.create(entity.getBodier().getRawBody()).create8(
      { fontConfiguration: fieldsFc, spriteContainer: skinParam, atomOps: skinParam.atomOps },
      this.styleDescription.getHorizontalAlignment() ?? HorizontalAlignment.LEFT,
      CreoleMode.FULL,
      this.style.wrapWidth(),
    );
  }

  /** @see EntityImageState.java:99-109 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    const dim = this.name.calculateDimension(stringBounder).mergeTB(this.fields.calculateDimension(stringBounder));
    const result = dim.delta(ENTITY_IMAGE_MARGIN * 2 + 2 * ENTITY_IMAGE_MARGIN_LINE);
    return result.atLeast(MIN_WIDTH, MIN_HEIGHT);
  }

  /** `getBorderColor`. @see EntityImageStateCommon.java:164-169 */
  private getBorderColor(): ReturnType<typeof asPaintColor> {
    const border = this.getEntity().getColors().getColor(ColorType.LINE);
    return asPaintColor(border ?? this.style.value('LineColor').asColor(this.getSkinParam().getIHtmlColorSet()));
  }

  /** `getShape`. @see EntityImageStateCommon.java:119-128 */
  private getShape(dimTotal: XDimension2D): URectangle {
    const rect = URectangle.build(dimTotal.getWidth(), dimTotal.getHeight()).rounded(
      this.style.value('RoundCorner').asDouble(),
    );
    rect.setDeltaShadow(this.style.getShadowing());
    return rect;
  }

  /** @see EntityImageState.java:111-165 */
  drawU(ug: UGraphic): void {
    inGroup(ug, entityGroup(this.getEntity(), 'entity', true), () => this.drawBody(ug));
  }

  private drawBody(ug0: UGraphic): void {
    const withUrl = ug0 as UGraphicWithUrl;
    if (this.url !== undefined) withUrl.startUrl?.(this.url);

    const stringBounder = ug0.getStringBounder();
    const dimTotal = this.calculateDimension(stringBounder);
    const dimName = this.name.calculateDimension(stringBounder);
    const colors = this.getEntity().getColors();
    const set = this.getSkinParam().getIHtmlColorSet();

    // `applyColor`: the border, then the entity's own BACK colour or the state's. @see EntityImageStateCommon.java:130-142
    const back = colors.getColor(ColorType.BACK) ?? this.style.value('BackGroundColor').asColor(set);
    const ug = applyBack(applyFore(ug0, this.getBorderColor()), asPaintColor(back)).apply(
      colors.getSpecificLineStroke() ?? this.style.getStroke(),
    );

    const yLine = ENTITY_IMAGE_MARGIN + dimName.getHeight() + ENTITY_IMAGE_MARGIN_LINE;
    const north = this.styleName.value('BackGroundColor').asColor(set);
    const south = this.styleDescription.value('BackGroundColor').asColor(set);
    if (!sameColor(north, south)) throw new Error('unported: EntityImageState RoundedContainer');

    ug.draw(this.getShape(dimTotal));
    ug.apply(UTranslate.dy(yLine)).draw(ULine.hline(dimTotal.getWidth()));

    const xDesc = (dimTotal.getWidth() - dimName.getWidth()) / 2;
    this.name.drawU(ug.apply(new UTranslate(xDesc, ENTITY_IMAGE_MARGIN)));

    drawAligned(
      ug,
      this.fields,
      this.styleDescription.getHorizontalAlignment() ?? HorizontalAlignment.LEFT,
      { x: ENTITY_IMAGE_MARGIN, y: yLine + ENTITY_IMAGE_MARGIN_LINE },
      dimTotal.getWidth(),
    );

    if (this.url !== undefined) withUrl.closeUrl?.();
  }

  /** `EntityImageStateCommon#getShapeType`. @see EntityImageStateCommon.java:115-117 */
  getShapeType(): ShapeType {
    return ShapeType.ROUND_RECTANGLE;
  }
}

/** `HColor#equals` over what a style answers. */
function sameColor(a: object, b: object): boolean {
  return (
    a === b || String((a as { asString(): string }).asString()) === String((b as { asString(): string }).asString())
  );
}

/** `HorizontalAlignment#draw(ug, tb, xpadding, ypadding, width)`. @see HorizontalAlignment.java:79-90 */
function drawAligned(
  ug: UGraphic,
  block: TextBlock,
  alignment: HorizontalAlignment,
  padding: { x: number; y: number },
  width: number,
): void {
  if (alignment === HorizontalAlignment.LEFT) {
    block.drawU(ug.apply(new UTranslate(padding.x, padding.y)));
    return;
  }
  const dim = block.calculateDimension(ug.getStringBounder());
  if (alignment === HorizontalAlignment.RIGHT)
    block.drawU(ug.apply(new UTranslate(width - dim.getWidth() - padding.x, padding.y)));
  else block.drawU(ug.apply(new UTranslate((width - dim.getWidth()) / 2, padding.y)));
}
