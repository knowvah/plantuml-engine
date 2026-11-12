/**
 * `EntityImageChenEntity` — the rectangle of a Chen EER entity; `<<weak>>` adds an inner rectangle at `+3,+3`,
 * `delta(-6)`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageChenEntity.java:64-167
 */
import type { Entity } from '../../abel/Entity.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import type { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { URectangle } from '../../klimt/shape/URectangle.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import type { Style } from '../../style/Style.js';
import type { StyleSignature } from '../../style/StyleSignature.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import type { Url } from '../../url/Url.js';
import { ENTITY_IMAGE_MARGIN, ENTITY_IMAGE_MARGIN_LINE } from '../IEntityImage.js';
import { ShapeType } from '../ShapeType.js';
import { AbstractEntityImage, type LeafImageSkinParam } from './AbstractEntityImage.js';
import {
  applyChenColor,
  closeChenGroup,
  createChenTitle,
  getChenStyle,
  getStroke,
  hasStereotype,
  startChenGroup,
} from './EntityImageChenSupport.js';

/** The inner rectangle of `<<weak>>`: offset, and the `dimTotal.delta(-6)`. @see EntityImageChenEntity.java:134 */
const WEAK_OFFSET = 3;
const WEAK_DELTA = -6;

/** @see EntityImageChenEntity.java:64 */
export class EntityImageChenEntity extends AbstractEntityImage {
  private readonly isWeak: boolean;
  private readonly title: TextBlock;
  private readonly url: Url | undefined;

  /** @see EntityImageChenEntity.java:71-83 */
  constructor(entity: Entity, skinParam: LeafImageSkinParam) {
    super(entity, skinParam);
    this.isWeak = hasStereotype(entity, '<<weak>>');
    const titleStyle = getChenStyle('chenEntity', entity, skinParam, true);
    this.title = createChenTitle(entity, skinParam, titleStyle, this.getStyleState(), false);
    this.url = entity.getUrl99();
  }

  /** @see EntityImageChenEntity.java:85-87 */
  private hasStereotype(stereotype: string): boolean {
    return hasStereotype(this.getEntity(), stereotype);
  }

  /** @see EntityImageChenEntity.java:89-91 */
  private getStyleState(): Style {
    return getChenStyle('chenEntity', this.getEntity(), this.getSkinParam(), false);
  }

  /** `{root, element, chenEerDiagram, chenEntity}`. @see EntityImageChenEntity.java:93-96 */
  override getStyleSignature(): StyleSignature {
    return StyleSignatureBasic.of('root', 'element', 'chenEerDiagram', 'chenEntity');
  }

  /** @see EntityImageChenEntity.java:108-111 */
  getShapeType(): ShapeType {
    return ShapeType.RECTANGLE;
  }

  /** @see EntityImageChenEntity.java:113-118 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    const dim = this.title.calculateDimension(stringBounder);
    return dim.delta(ENTITY_IMAGE_MARGIN * 2 + 2 * ENTITY_IMAGE_MARGIN_LINE);
  }

  /** @see EntityImageChenEntity.java:120-145 */
  drawU(ug: UGraphic): void {
    startChenGroup(ug, this.getEntity(), this.url);

    const dimTotal = this.calculateDimension(ug.getStringBounder());
    const dimTitle = this.title.calculateDimension(ug.getStringBounder());

    const stroke = getStroke(this.getStyleState(), this.getEntity());
    const colored = this.applyColor(ug).apply(stroke);
    colored.draw(this.getShape(dimTotal));
    if (this.isWeak)
      colored.apply(new UTranslate(WEAK_OFFSET, WEAK_OFFSET)).draw(this.getShape(dimTotal.delta(WEAK_DELTA)));

    const xTitle = (dimTotal.getWidth() - dimTitle.getWidth()) / 2;
    const yTitle = ENTITY_IMAGE_MARGIN + ENTITY_IMAGE_MARGIN_LINE;
    this.title.drawU(colored.apply(new UTranslate(xTitle, yTitle)));

    closeChenGroup(ug, this.url);
  }

  /** @see EntityImageChenEntity.java:147-161 */
  protected applyColor(ug: UGraphic): UGraphic {
    return applyChenColor(ug, this.getEntity(), this.getStyleState(), this.getSkinParam());
  }

  /** @see EntityImageChenEntity.java:163-165 */
  private getShape(dimTotal: XDimension2D): URectangle {
    // `URectangle.build(XDimension2D)` is `build(width, height)` of the dimension.
    return URectangle.build(dimTotal.getWidth(), dimTotal.getHeight());
  }
}
