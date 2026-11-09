/**
 * `EntityImageCircleEnd` — the end leaf of a legacy activity diagram, in an `end_entity` group.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageCircleEnd.java:47-89
 */
import type { Entity } from '../../abel/Entity.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import type { StyleSignature } from '../../style/StyleSignature.js';
import { ShapeType } from '../ShapeType.js';
import { AbstractEntityImage, type LeafImageSkinParam } from './AbstractEntityImage.js';
import { CircleEnd } from './CircleEnd.js';
import { entityGroup, inGroup, mergedStyleOf } from './leaf-image-support.js';

/** @see EntityImageCircleEnd.java:49 */
const SIZE = 22;

/** @see EntityImageCircleEnd.java:48 */
export class EntityImageCircleEnd extends AbstractEntityImage {
  private readonly circle: CircleEnd;

  /** `{root, element, <diagram style name>, circle, end}`. @see EntityImageCircleEnd.java:52-56 */
  override getStyleSignature(): StyleSignature {
    return StyleSignatureBasic.of('root', 'element', this.getStyleName(), 'circle', 'end');
  }

  /** @see EntityImageCircleEnd.java:58-62 */
  constructor(entity: Entity, skinParam: LeafImageSkinParam) {
    super(entity, skinParam);
    const style = mergedStyleOf(this.getStyleSignature(), skinParam.getCurrentStyleBuilder());
    this.circle = new CircleEnd(skinParam, style, entity.getColors());
  }

  /** @see EntityImageCircleEnd.java:64-67 */
  protected calculateDimensionSlow(_stringBounder: StringBounder): XDimension2D {
    return new XDimension2D(SIZE, SIZE);
  }

  /** @see EntityImageCircleEnd.java:69-79 */
  drawU(ug: UGraphic): void {
    inGroup(ug, entityGroup(this.getEntity(), 'end_entity', true), () => this.circle.drawU(ug));
  }

  /** @see EntityImageCircleEnd.java:81-83 */
  getShapeType(): ShapeType {
    return ShapeType.CIRCLE;
  }
}
