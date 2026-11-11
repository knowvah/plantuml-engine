/**
 * `Spot`: a filled circle on a block, red by default.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/Spot.java:45-70
 */
import { HColors } from '../../core/klimt/color/HColors.js';
import { UEllipse } from '../../core/klimt/shape/UEllipse.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { HColor } from '../../core/style/Value.js';
import { back, fore } from './wire-klimt.js';
import type { WBlock } from './WBlock.js';

/** `new UTranslate(-2, -2)`. @see Spot.java:62 */
const SPOT_OFFSET = -2;
/** `UEllipse.build(5, 5)`. @see Spot.java:63 */
const SPOT_SIZE = 5;

export class Spot {
  private readonly block: WBlock;
  private readonly color: HColor;
  private readonly x: string;
  private readonly y: string;

  /** @see Spot.java:52-57 */
  constructor(block: WBlock, color: HColor | undefined, x: string | undefined, y: string | undefined) {
    this.block = block;
    this.color = color ?? HColors.RED;
    this.x = x ?? '0';
    this.y = y ?? '0';
  }

  /** @see Spot.java:59-68 */
  drawMe(ug: UGraphic): void {
    const pos = this.block.getAbsolutePosition(this.x, this.y);
    const tr = pos.compose(new UTranslate(SPOT_OFFSET, SPOT_OFFSET));
    const circle = UEllipse.build(SPOT_SIZE, SPOT_SIZE);
    ug.apply(fore(this.color)).apply(back(this.color)).apply(tr).draw(circle);
  }
}
