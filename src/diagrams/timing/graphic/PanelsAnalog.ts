import { ULine } from '../../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import { PanelsNumeric, type PanelsNumericArgs } from './PanelsNumeric.js';

/**
 * Joins two samples with a straight line (linear interpolation).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PanelsAnalog.java:49-65
 */
export class PanelsAnalog extends PanelsNumeric {
  /** java:54-57 */
  public constructor(args: PanelsNumericArgs) {
    super(args);
  }

  /** java:59-63 */
  protected override drawSegment(ug: UGraphic, x1: number, y1: number, x2: number, y2: number): void {
    // Linear interpolation between two samples
    ug.apply(new UTranslate(x1, y1)).draw(new ULine(x2 - x1, y2 - y1));
  }
}
