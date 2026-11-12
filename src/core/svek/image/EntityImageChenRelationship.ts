/**
 * `EntityImageChenRelationship` — the diamond of a Chen EER relationship, sized around its title at aspect ratio 2;
 * `<<identifying>>` adds an inner diamond at `+10,+5`, `delta(-20, -10)`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageChenRelationship.java:68-185
 */
import type { Entity } from '../../abel/Entity.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { UPolygon } from '../../klimt/shape/UPolygon.js';
import type { UShape } from '../../klimt/UShape.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import type { Style } from '../../style/Style.js';
import type { StyleSignature } from '../../style/StyleSignature.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import type { Url } from '../../url/Url.js';
import { ENTITY_IMAGE_MARGIN } from '../IEntityImage.js';
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

/** The inner diamond of `<<identifying>>`. @see EntityImageChenRelationship.java:144 */
const IDENTIFYING_OFFSET_X = 10;
const IDENTIFYING_OFFSET_Y = 5;
const IDENTIFYING_DELTA_X = -20;
const IDENTIFYING_DELTA_Y = -10;

/** @see EntityImageChenRelationship.java:68 */
export class EntityImageChenRelationship extends AbstractEntityImage {
  private readonly isIdentifying: boolean;
  private readonly title: TextBlock;
  private readonly url: Url | undefined;

  /** @see EntityImageChenRelationship.java:75-87 */
  constructor(entity: Entity, skinParam: LeafImageSkinParam) {
    super(entity, skinParam);
    this.isIdentifying = hasStereotype(entity, '<<identifying>>');
    const titleStyle = getChenStyle('chenRelationship', entity, skinParam, true);
    this.title = createChenTitle(entity, skinParam, titleStyle, this.getStyle(), false);
    this.url = entity.getUrl99();
  }

  /** @see EntityImageChenRelationship.java:89-91 */
  private hasStereotype(stereotype: string): boolean {
    return hasStereotype(this.getEntity(), stereotype);
  }

  /** @see EntityImageChenRelationship.java:93-95 */
  private getStyle(): Style {
    return getChenStyle('chenRelationship', this.getEntity(), this.getSkinParam(), false);
  }

  /** `{root, element, chenEerDiagram, chenRelationship}`. @see EntityImageChenRelationship.java:97-100 */
  override getStyleSignature(): StyleSignature {
    return StyleSignatureBasic.of('root', 'element', 'chenEerDiagram', 'chenRelationship');
  }

  /** @see EntityImageChenRelationship.java:113-116 */
  getShapeType(): ShapeType {
    return ShapeType.DIAMOND;
  }

  /**
   * Fit a diamond with aspect ratio 2 around the text: `diagonal = dimTitle . ([1, 2] / sqrt(5)) + 2 * MARGIN`,
   * `dimTotal = diagonal * [sqrt(5), sqrt(5) / 2]` (upstream's own comment).
   * @see EntityImageChenRelationship.java:118-128
   */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    const dimTitle = this.title.calculateDimension(stringBounder);

    const diagonal = (dimTitle.getWidth() + 2 * dimTitle.getHeight()) / Math.sqrt(5) + 2 * ENTITY_IMAGE_MARGIN;
    return new XDimension2D(diagonal * Math.sqrt(5), (diagonal * Math.sqrt(5)) / 2);
  }

  /** @see EntityImageChenRelationship.java:130-155 */
  drawU(ug: UGraphic): void {
    startChenGroup(ug, this.getEntity(), this.url);

    const dimTotal = this.calculateDimension(ug.getStringBounder());
    const dimTitle = this.title.calculateDimension(ug.getStringBounder());

    const stroke = getStroke(this.getStyle(), this.getEntity());
    const colored = this.applyColor(ug).apply(stroke);
    colored.draw(this.getShape(dimTotal));
    if (this.isIdentifying)
      colored
        .apply(new UTranslate(IDENTIFYING_OFFSET_X, IDENTIFYING_OFFSET_Y))
        .draw(this.getShape(dimTotal.delta(IDENTIFYING_DELTA_X, IDENTIFYING_DELTA_Y)));

    const xTitle = (dimTotal.getWidth() - dimTitle.getWidth()) / 2;
    const yTitle = (dimTotal.getHeight() - dimTitle.getHeight()) / 2;
    this.title.drawU(colored.apply(new UTranslate(xTitle, yTitle)));

    closeChenGroup(ug, this.url);
  }

  /** @see EntityImageChenRelationship.java:157-171 */
  protected applyColor(ug: UGraphic): UGraphic {
    return applyChenColor(ug, this.getEntity(), this.getStyle(), this.getSkinParam());
  }

  /** The diamond `p1..p4`. @see EntityImageChenRelationship.java:173-183 */
  private getShape(dimTotal: XDimension2D): UShape {
    const width = dimTotal.getWidth();
    const height = dimTotal.getHeight();

    const p1 = { x: 0, y: height / 2 };
    const p2 = { x: width / 2, y: 0 };
    const p3 = { x: width, y: height / 2 };
    const p4 = { x: width / 2, y: height };

    return new UPolygon([p1, p2, p3, p4]);
  }
}
