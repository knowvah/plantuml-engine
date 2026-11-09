/**
 * `EntityImageBranch` — the `if` diamond of a legacy activity diagram, in an `entity` group with no
 * `data-source-line` (upstream builds `new UGroup()`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageBranch.java:53-101
 */
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import { UPolygon } from '../../klimt/shape/UPolygon.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import { ShapeType } from '../ShapeType.js';
import { AbstractEntityImage } from './AbstractEntityImage.js';
import { applyBack, applyFore, entityGroup, inGroup, mergedStyleOf, styleColor } from './leaf-image-support.js';

/** @see EntityImageBranch.java:55 */
const SIZE = 12;

/** @see EntityImageBranch.java:53 */
export class EntityImageBranch extends AbstractEntityImage {
  /** `{root, element, activityDiagram, activity, diamond}`. @see EntityImageBranch.java:61-63 */
  override getStyleSignature(): StyleSignatureBasic {
    return StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'activity', 'diamond');
  }

  /** @see EntityImageBranch.java:65-68 */
  protected calculateDimensionSlow(_stringBounder: StringBounder): XDimension2D {
    return new XDimension2D(SIZE * 2, SIZE * 2);
  }

  /** @see EntityImageBranch.java:70-97 */
  drawU(ug: UGraphic): void {
    const diams = new UPolygon();
    diams.addPoint(SIZE, 0);
    diams.addPoint(SIZE * 2, SIZE);
    diams.addPoint(SIZE, SIZE * 2);
    diams.addPoint(0, SIZE);
    diams.addPoint(SIZE, 0);

    const skinParam = this.getSkinParam();
    const style = mergedStyleOf(this.getStyleSignature(), skinParam.getCurrentStyleBuilder());
    const set = skinParam.getIHtmlColorSet();
    const border = styleColor(style, 'LineColor', set);
    const back = styleColor(style, 'BackGroundColor', set);
    const stroke = style.getStroke();
    const shadowing = style.getShadowing();

    diams.setDeltaShadow(shadowing);
    inGroup(ug, entityGroup(this.getEntity(), 'entity', false), () =>
      applyBack(applyFore(ug, border), back).apply(stroke).draw(diams),
    );
  }

  /** @see EntityImageBranch.java:99-101 */
  getShapeType(): ShapeType {
    return ShapeType.DIAMOND;
  }
}
