import type { ISkinParamWithSimple } from '../../../../core/abel/ISkinParam.js';
import type { Colors } from '../../../../core/abel/Colors.js';
import type { StringBounder } from '../../../../core/klimt/font/StringBounder.js';
import type { TextBlock } from '../../../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../../../core/klimt/UGraphic.js';
import type { Style } from '../../../../core/style/Style.js';
import { CircleStart } from '../../../../core/svek/image/CircleStart.js';
import { AbstractFtile } from '../AbstractFtile.js';
import { FtileGeometry } from '../FtileGeometry.js';

/**
 * FtileCircleStart — the activity start circle as an `Ftile`: a
 * `CircleStart` whose geometry is square, entered at the top centre.
 *
 * The slice stops where `FtileBoxOld`'s does: `AbstractFtile.ts` declares no
 * swimlane members, so `getSwimlanes`/`getSwimlaneIn`/`getSwimlaneOut`
 * (java:69-82) are not ported and `swimlane` (always `null` from BPM,
 * `BpmElement.java:157`) is accepted and unread.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileCircleStart.java:53-94
 */
export class FtileCircleStart extends AbstractFtile implements TextBlock {
  /** @see FtileCircleStart.java:55 */
  private readonly circle: CircleStart;

  /** @see FtileCircleStart.java:58-62 */
  constructor(skinParam: ISkinParamWithSimple, _swimlane: undefined, style: Style, colors: Colors) {
    super(skinParam);
    this.circle = new CircleStart(skinParam, style, colors);
  }

  /** @see FtileCircleStart.java:65-67 */
  getMyChildren(): readonly never[] {
    return [];
  }

  /** @see FtileCircleStart.java:84-86 */
  drawU(ug: UGraphic): void {
    this.circle.drawU(ug);
  }

  /** @see FtileCircleStart.java:89-92 */
  protected calculateDimensionFtile(stringBounder: StringBounder): FtileGeometry {
    const size = this.circle.calculateDimension(stringBounder).getWidth();
    return new FtileGeometry(size, size, size / 2, 0, size);
  }
}
