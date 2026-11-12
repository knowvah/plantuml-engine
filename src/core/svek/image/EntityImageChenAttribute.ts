/**
 * `EntityImageChenAttribute` — the ellipse of a Chen EER attribute, sized by `TextBlockInEllipse`. `<<key>>`
 * underlines the title, `<<multi>>` adds an inner ellipse at `+3,+3`, `delta(-6)`, `<<derived>>` dashes the stroke
 * `UStroke(10, 10, thickness)`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageChenAttribute.java:66-182
 */
import type { Entity } from '../../abel/Entity.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import type { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { TextBlockInEllipse } from '../../klimt/shape/TextBlockInEllipse.js';
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

/** `MARGIN`. @see EntityImageChenAttribute.java:68 */
const MARGIN = 6;
/** The inner ellipse of `<<multi>>`. @see EntityImageChenAttribute.java:149 */
const MULTI_OFFSET = 3;
const MULTI_DELTA = -6;
/** `new UStroke(10, 10, thickness)` of `<<derived>>`. @see EntityImageChenAttribute.java:142 */
const DERIVED_DASH = 10;

/** @see EntityImageChenAttribute.java:66 */
export class EntityImageChenAttribute extends AbstractEntityImage {
  private readonly isKey: boolean;
  private readonly isMulti: boolean;
  private readonly isDerived: boolean;
  private readonly title: TextBlock;
  private readonly url: Url | undefined;

  /** @see EntityImageChenAttribute.java:77-94 */
  constructor(entity: Entity, skinParam: LeafImageSkinParam) {
    super(entity, skinParam);
    this.isKey = hasStereotype(entity, '<<key>>');
    this.isMulti = hasStereotype(entity, '<<multi>>');
    this.isDerived = hasStereotype(entity, '<<derived>>');

    const titleStyle = getChenStyle('chenAttribute', entity, skinParam, true);
    this.title = createChenTitle(entity, skinParam, titleStyle, this.getStyle(), this.isKey);
    this.url = entity.getUrl99();
  }

  /** @see EntityImageChenAttribute.java:96-98 */
  private hasStereotype(stereotype: string): boolean {
    return hasStereotype(this.getEntity(), stereotype);
  }

  /** @see EntityImageChenAttribute.java:100-102 */
  private getStyle(): Style {
    return getChenStyle('chenAttribute', this.getEntity(), this.getSkinParam(), false);
  }

  /** `{root, element, chenEerDiagram, chenAttribute}`. @see EntityImageChenAttribute.java:104-107 */
  override getStyleSignature(): StyleSignature {
    return StyleSignatureBasic.of('root', 'element', 'chenEerDiagram', 'chenAttribute');
  }

  /** @see EntityImageChenAttribute.java:119-122 */
  getShapeType(): ShapeType {
    return ShapeType.OVAL;
  }

  /** @see EntityImageChenAttribute.java:124-129 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    const ellipse = new TextBlockInEllipse(this.title, stringBounder);
    return ellipse.calculateDimension(stringBounder);
  }

  /** @see EntityImageChenAttribute.java:131-160 */
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
    const yTitle = MARGIN;
    this.title.drawU(colored.apply(new UTranslate(xTitle, yTitle)));

    closeChenGroup(ug, this.url);
  }

  /** @see EntityImageChenAttribute.java:162-176 */
  protected applyColor(ug: UGraphic): UGraphic {
    return applyChenColor(ug, this.getEntity(), this.getStyle(), this.getSkinParam());
  }

  /** @see EntityImageChenAttribute.java:178-180 */
  private getShape(dimTotal: XDimension2D): UShape {
    return UEllipse.build(dimTotal.getWidth(), dimTotal.getHeight());
  }
}
