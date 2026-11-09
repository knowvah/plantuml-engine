/**
 * `EntityImageCircleStart` — the start leaf of a legacy activity diagram, in a `start_entity` group.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageCircleStart.java:47-88
 */
import type { Entity } from '../../abel/Entity.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import type { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import type { StyleSignature } from '../../style/StyleSignature.js';
import { ShapeType } from '../ShapeType.js';
import { AbstractEntityImage, type LeafImageSkinParam } from './AbstractEntityImage.js';
import { CircleStart } from './CircleStart.js';
import { entityGroup, inGroup, mergedStyleOf } from './leaf-image-support.js';

/** @see EntityImageCircleStart.java:49 */
export class EntityImageCircleStart extends AbstractEntityImage {
  private readonly circle: CircleStart;

  /** `{root, element, <diagram style name>, circle, start}`. @see EntityImageCircleStart.java:51-55 */
  override getStyleSignature(): StyleSignature {
    return StyleSignatureBasic.of('root', 'element', this.getStyleName(), 'circle', 'start');
  }

  /** @see EntityImageCircleStart.java:57-61 */
  constructor(entity: Entity, skinParam: LeafImageSkinParam) {
    super(entity, skinParam);
    const style = mergedStyleOf(this.getStyleSignature(), skinParam.getCurrentStyleBuilder());
    this.circle = new CircleStart(skinParam, style, entity.getColors());
  }

  /** @see EntityImageCircleStart.java:63-66 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    return this.circle.calculateDimension(stringBounder);
  }

  /** @see EntityImageCircleStart.java:68-78 */
  drawU(ug: UGraphic): void {
    inGroup(ug, entityGroup(this.getEntity(), 'start_entity', true), () => this.circle.drawU(ug));
  }

  /** @see EntityImageCircleStart.java:80-82 */
  getShapeType(): ShapeType {
    return ShapeType.CIRCLE;
  }
}
