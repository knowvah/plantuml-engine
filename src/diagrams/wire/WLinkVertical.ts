/**
 * `WLinkVertical`: a vertical link or bus between two blocks. It holds a label and never draws it: `drawMe` does not
 * call `getTextBlock` (wrp D4, `cov-vlinks-all`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/WLinkVertical.java:52-172
 */
import type { Display } from '../../core/klimt/creole/Display.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { HColor } from '../../core/style/Value.js';
import { WArrowDirection } from './WArrowDirection.js';
import { WLinkType } from './WLinkType.js';
import {
  back,
  blackBlueTrueChanged,
  createLeft,
  fore,
  getBlack,
  getWhite,
  polygon,
  type PathPoint,
  type WireSkinParam,
} from './wire-klimt.js';

/** `UFontFactory.sansSerif(10)`. @see WLinkVertical.java:82 */
const LABEL_FONT_SIZE = 10;

/** The seven Java constructor arguments under their Java names (wrp D11). */
export interface WLinkVerticalArgs {
  readonly skinParam: WireSkinParam;
  readonly start: UTranslate;
  readonly destination: number;
  readonly type: WLinkType;
  readonly direction: WArrowDirection;
  readonly color: HColor | undefined;
  readonly label: Display;
}

/** @see WLinkVertical.java:102-106 */
const busNone = (dy: number): readonly PathPoint[] => [
  [0, 0],
  [0, dy],
  [10, dy],
  [10, 0],
  [0, 0],
];

/** @see WLinkVertical.java:111-118 */
const busNormal = (dy: number): readonly PathPoint[] => [
  [0, 0],
  [0, dy - 15],
  [-5, dy - 15],
  [5, dy],
  [15, dy - 15],
  [10, dy - 15],
  [10, 0],
  [0, 0],
];

/** @see WLinkVertical.java:123-133 */
const busBoth = (dy: number): readonly PathPoint[] => [
  [5, 0],
  [-5, 15],
  [0, 15],
  [0, dy - 15],
  [-5, dy - 15],
  [5, dy],
  [15, dy - 15],
  [10, dy - 15],
  [10, 15],
  [15, 15],
  [5, 0],
];

/** @see WLinkVertical.java:138-145 */
const busReverse = (dy: number): readonly PathPoint[] => [
  [5, 0],
  [-5, 15],
  [0, 15],
  [0, dy],
  [10, dy],
  [10, 15],
  [15, 15],
  [5, 0],
];

/** @see WLinkVertical.java:155-158 */
const HEAD_NORMAL: readonly PathPoint[] = [
  [0, 0],
  [5, -5],
  [-5, -5],
  [0, 0],
];

/** @see WLinkVertical.java:164-167 */
const HEAD_REVERSE: readonly PathPoint[] = [
  [0, 0],
  [5, 5],
  [-5, 5],
  [0, 0],
];

export class WLinkVertical {
  private readonly start: UTranslate;
  private readonly destination: number;
  private readonly type: WLinkType;
  private readonly direction: WArrowDirection;
  private readonly color: HColor;
  private readonly label: Display;
  private readonly skinParam: WireSkinParam;

  /** @see WLinkVertical.java:62-71 */
  constructor(args: WLinkVerticalArgs) {
    this.start = args.start;
    this.destination = args.destination;
    this.skinParam = args.skinParam;
    this.direction = args.direction;
    this.type = args.type;
    this.label = args.label;
    this.color = args.color ?? getBlack();
  }

  /**
   * Built and never called, as upstream (`drawMe` does not read it). Public here only because TypeScript rejects an
   * unread private member; the Java's is private.
   * @see WLinkVertical.java:81-85
   */
  getTextBlock(): TextBlock {
    const fontConfiguration = blackBlueTrueChanged(UFontFactory.sansSerif(LABEL_FONT_SIZE), this.color);
    return createLeft(this.label, fontConfiguration, this.skinParam);
  }

  /** @see WLinkVertical.java:87-96 */
  drawMe(ugIn: UGraphic): void {
    const ug = ugIn.apply(fore(this.color));
    if (this.type === WLinkType.NORMAL) this.drawNormalArrow(ug.apply(back(this.color)));
    else this.drawBusArrow(ug.apply(back(getWhite())));
  }

  /** @see WLinkVertical.java:98-149 */
  private drawBusArrow(ug: UGraphic): void {
    const dy = this.destination - this.start.getDy() - 2;
    ug.apply(this.start.compose(UTranslate.dy(1))).draw(polygon(this.busPoints(dy)));
  }

  /** Each `if (direction == ...)` branch of `drawBusArrow`; the four directions are exhaustive. */
  private busPoints(dy: number): readonly PathPoint[] {
    if (this.direction === WArrowDirection.NONE) return busNone(dy);
    if (this.direction === WArrowDirection.NORMAL) return busNormal(dy);
    if (this.direction === WArrowDirection.BOTH) return busBoth(dy);
    return busReverse(dy);
  }

  /** @see WLinkVertical.java:151-172 */
  private drawNormalArrow(ug: UGraphic): void {
    const dy = this.destination - this.start.getDy() - 2;
    if (this.direction === WArrowDirection.BOTH || this.direction === WArrowDirection.NORMAL)
      ug.apply(this.start.compose(UTranslate.dy(dy))).draw(polygon(HEAD_NORMAL));

    if (this.direction === WArrowDirection.BOTH || this.direction === WArrowDirection.REVERSE)
      ug.apply(this.start.compose(UTranslate.dy(1))).draw(polygon(HEAD_REVERSE));

    ug.apply(this.start.compose(UTranslate.dy(1))).draw(ULine.vline(dy));
  }
}
