/**
 * `EntityImageSynchroBar` — the `===B===` bar of a legacy activity diagram: an 80×8 rect (8×80 in left to
 * right), filled with the style's `BackGroundColor`, no line, no group.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageSynchroBar.java:51-91
 */
import { HColors } from '../../klimt/color/HColors.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import { Rankdir } from '../../klimt/geom/Rankdir.js';
import { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import { URectangle } from '../../klimt/shape/URectangle.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import type { StyleSignature } from '../../style/StyleSignature.js';
import { StyleSignatureBasic } from '../../style/StyleSignatureBasic.js';
import { ShapeType } from '../ShapeType.js';
import { AbstractEntityImage } from './AbstractEntityImage.js';
import { applyBack, applyFore, mergedStyleOf, styleColor } from './leaf-image-support.js';

/** The bar's long and short sides. @see EntityImageSynchroBar.java:65-68 */
const LONG_SIDE = 80;
const SHORT_SIDE = 8;

/** @see EntityImageSynchroBar.java:51 */
export class EntityImageSynchroBar extends AbstractEntityImage {
  /** `{root, element, activityDiagram, activityBar}`. @see EntityImageSynchroBar.java:57-60 */
  override getStyleSignature(): StyleSignature {
    return StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'activityBar');
  }

  /** @see EntityImageSynchroBar.java:62-68 */
  protected calculateDimensionSlow(_stringBounder: StringBounder): XDimension2D {
    if (this.getSkinParam().getRankdir() === Rankdir.LEFT_TO_RIGHT) return new XDimension2D(SHORT_SIDE, LONG_SIDE);

    return new XDimension2D(LONG_SIDE, SHORT_SIDE);
  }

  /** @see EntityImageSynchroBar.java:70-81 */
  drawU(ug: UGraphic): void {
    const dim = this.calculateDimension(ug.getStringBounder());
    const rect = URectangle.build(dim.getWidth(), dim.getHeight());

    const skinParam = this.getSkinParam();
    const style = mergedStyleOf(
      this.getStyleSignature().withTOBECHANGED(this.getEntity().getStereotype()),
      skinParam.getCurrentStyleBuilder(),
    );
    const color = styleColor(style, 'BackGroundColor', skinParam.getIHtmlColorSet());
    const shadowing = style.getShadowing();

    rect.setDeltaShadow(shadowing);
    applyBack(applyFore(ug, HColors.none()), color).draw(rect);
  }

  /** @see EntityImageSynchroBar.java:83-85 */
  getShapeType(): ShapeType {
    return ShapeType.RECTANGLE;
  }
}
