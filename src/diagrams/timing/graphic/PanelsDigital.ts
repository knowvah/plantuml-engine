import { ULine } from '../../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import { PanelsNumeric, type PanelsNumericArgs } from './PanelsNumeric.js';

/**
 * Joins two samples with a step: no interpolation, the value is held until the next sample.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PanelsDigital.java:49-66
 */
export class PanelsDigital extends PanelsNumeric {
  /** java:54-57 */
  public constructor(args: PanelsNumericArgs) {
    super(args);
  }

  /** java:59-64 */
  protected override drawSegment(ug: UGraphic, x1: number, y1: number, x2: number, y2: number): void {
    // Hold the previous value, then jump to the new one at the sample time
    ug.apply(new UTranslate(x1, y1)).draw(ULine.hline(x2 - x1));
    ug.apply(new UTranslate(x2, y1)).draw(ULine.vline(y2 - y1));
  }
}
