/**
 * `EntityImageChenCircle` — the fixed 25x25 circle of a Chen EER subclass connector, its title centred. `<<key>>`
 * underlines the title, `<<multi>>` adds an inner ellipse at `+3,+3`, `delta(-6)`, `<<derived>>` dashes the stroke
 * `UStroke(10, 10, thickness)`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageChenCircle.java:65-179
 */
import type { Entity } from '../../abel/Entity.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { UEllipse } from '../../klimt/shape/UEllipse.js';
import type { UShape } from '../../klimt/UShape.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import { UStroke } from '../../klimt/UStroke.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import type { Style } from '../../style/Style.js';
import type { StyleSignature } from '../../style/StyleSignature.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import type { Url } from '../../url/Url.js';
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

/** `new XDimension2D(25, 25)`. @see EntityImageChenCircle.java:125 */
const CIRCLE_SIZE = 25;
/** The inner ellipse of `<<multi>>`. @see EntityImageChenCircle.java:146 */
const MULTI_OFFSET = 3;
const MULTI_DELTA = -6;
/** `new UStroke(10, 10, thickness)` of `<<derived>>`. @see EntityImageChenCircle.java:139 */
const DERIVED_DASH = 10;

/** @see EntityImageChenCircle.java:65 */
export class EntityImageChenCircle extends AbstractEntityImage {
  private readonly isKey: boolean;
  private readonly isMulti: boolean;
  private readonly isDerived: boolean;
  private readonly title: TextBlock;
  private readonly url: Url | undefined;

  /** @see EntityImageChenCircle.java:76-93 */
  constructor(entity: Entity, skinParam: LeafImageSkinParam) {
    super(entity, skinParam);
    this.isKey = hasStereotype(entity, '<<key>>');
    this.isMulti = hasStereotype(entity, '<<multi>>');
    this.isDerived = hasStereotype(entity, '<<derived>>');

    const titleStyle = getChenStyle('circle', entity, skinParam, true);
    this.title = createChenTitle(entity, skinParam, titleStyle, this.getStyle(), this.isKey);
    this.url = entity.getUrl99();
  }

  /** @see EntityImageChenCircle.java:95-97 */
  private hasStereotype(stereotype: string): boolean {
    return hasStereotype(this.getEntity(), stereotype);
  }

  /** @see EntityImageChenCircle.java:99-101 */
  private getStyle(): Style {
    return getChenStyle('circle', this.getEntity(), this.getSkinParam(), false);
  }

  /** `{root, element, chenEerDiagram, circle}`. @see EntityImageChenCircle.java:103-106 */
  override getStyleSignature(): StyleSignature {
    return StyleSignatureBasic.of('root', 'element', 'chenEerDiagram', 'circle');
  }

  /** @see EntityImageChenCircle.java:118-121 */
  getShapeType(): ShapeType {
    return ShapeType.OVAL;
  }

  /** @see EntityImageChenCircle.java:123-126 */
  protected calculateDimensionSlow(_stringBounder: StringBounder): XDimension2D {
    return new XDimension2D(CIRCLE_SIZE, CIRCLE_SIZE);
  }

  /** @see EntityImageChenCircle.java:128-157 */
  drawU(ug: UGraphic): void {
    startChenGroup(ug, this.getEntity(), this.url);

    const dimTotal = this.calculateDimension(ug.getStringBounder());
    const dimTitle = this.title.calculateDimension(ug.getStringBounder());

    let stroke = getStroke(this.getStyle(), this.getEntity());
    if (this.isDerived) stroke = new UStroke(DERIVED_DASH, DERIVED_DASH, stroke.getThickness());

    const colored = this.applyColor(ug).apply(stroke);
    colored.draw(this.getShape(dimTotal));
    if (this.isMulti)
      colored.apply(new UTranslate(MULTI_OFFSET, MULTI_OFFSET)).draw(this.getShape(dimTotal.delta(MULTI_DELTA)));

    const xTitle = (dimTotal.getWidth() - dimTitle.getWidth()) / 2;
    const yTitle = (dimTotal.getHeight() - dimTitle.getHeight()) / 2;
    this.title.drawU(colored.apply(new UTranslate(xTitle, yTitle)));

    closeChenGroup(ug, this.url);
  }

  /** @see EntityImageChenCircle.java:159-173 */
  protected applyColor(ug: UGraphic): UGraphic {
    return applyChenColor(ug, this.getEntity(), this.getStyle(), this.getSkinParam());
  }

  /** @see EntityImageChenCircle.java:175-177 */
  private getShape(dimTotal: XDimension2D): UShape {
    return UEllipse.build(dimTotal.getWidth(), dimTotal.getHeight());
  }
}
