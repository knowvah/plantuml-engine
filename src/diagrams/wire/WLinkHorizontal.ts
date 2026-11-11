/**
 * `WLinkHorizontal`: a horizontal link or bus between two blocks. A reversed link keeps Java's arithmetic and draws
 * negative lengths (wrp D4); the document grows to the ink (`SvgGraphics#ensureVisible`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/WLinkHorizontal.java:54-203
 */
import type { Display } from '../../core/klimt/creole/Display.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
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

/** `UFontFactory.sansSerif(10)`. @see WLinkHorizontal.java:84 */
const LABEL_FONT_SIZE = 10;
/** The label's offset from the start, and from the far end. @see WLinkHorizontal.java:112, :115 */
const LABEL_MARGIN = 4;
/** The bus's 10-wide body inside a 20-high slot. @see WLinkHorizontal.java:106 */
const BUS_SLOT = 20;
const BUS_RAISE = 5;

/** The seven Java constructor arguments under their Java names (wrp D11). */
export interface WLinkHorizontalArgs {
  readonly skinParam: WireSkinParam;
  readonly start: UTranslate;
  readonly destination: number;
  readonly type: WLinkType;
  readonly direction: WArrowDirection;
  readonly color: HColor | undefined;
  readonly label: Display;
}

/** @see WLinkHorizontal.java:133-137 */
const busNone = (dx: number): readonly PathPoint[] => [
  [0, 0],
  [dx, 0],
  [dx, 10],
  [0, 10],
  [0, 0],
];

/** @see WLinkHorizontal.java:142-149 */
const busNormal = (dx: number): readonly PathPoint[] => [
  [0, 0],
  [dx - 15, 0],
  [dx - 15, -5],
  [dx, 5],
  [dx - 15, 15],
  [dx - 15, 10],
  [0, 10],
  [0, 0],
];

/** @see WLinkHorizontal.java:154-164 */
const busBoth = (dx: number): readonly PathPoint[] => [
  [0, 5],
  [15, -5],
  [15, 0],
  [dx - 15, 0],
  [dx - 15, -5],
  [dx, 5],
  [dx - 15, 15],
  [dx - 15, 10],
  [15, 10],
  [15, 15],
  [0, 5],
];

/** @see WLinkHorizontal.java:169-176 */
const busReverse = (dx: number): readonly PathPoint[] => [
  [0, 5],
  [15, -5],
  [15, 0],
  [dx, 0],
  [dx, 10],
  [15, 10],
  [15, 15],
  [0, 5],
];

/** @see WLinkHorizontal.java:186-189 */
const HEAD_NORMAL: readonly PathPoint[] = [
  [0, 0],
  [-5, -5],
  [-5, 5],
  [0, 0],
];

/** @see WLinkHorizontal.java:195-198 */
const HEAD_REVERSE: readonly PathPoint[] = [
  [0, 0],
  [5, -5],
  [5, 5],
  [0, 0],
];

export class WLinkHorizontal {
  private readonly start: UTranslate;
  private readonly destination: number;
  private readonly type: WLinkType;
  private readonly direction: WArrowDirection;
  private readonly color: HColor;
  private readonly label: Display;
  private readonly skinParam: WireSkinParam;

  /** @see WLinkHorizontal.java:64-73 */
  constructor(args: WLinkHorizontalArgs) {
    this.start = args.start;
    this.destination = args.destination;
    this.skinParam = args.skinParam;
    this.direction = args.direction;
    this.type = args.type;
    this.label = args.label;
    this.color = args.color ?? getBlack();
  }

  /** @see WLinkHorizontal.java:83-87 */
  private getTextBlock(): TextBlock {
    const fontConfiguration = blackBlueTrueChanged(UFontFactory.sansSerif(LABEL_FONT_SIZE), this.color);
    return createLeft(this.label, fontConfiguration, this.skinParam);
  }

  /** @see WLinkHorizontal.java:89-127 */
  drawMe(ugIn: UGraphic): void {
    const ug = ugIn.apply(fore(this.color));
    const textBlock = this.getTextBlock();
    const dimText = textBlock.calculateDimension(ug.getStringBounder());
    const textHeight = dimText.getHeight();
    const textWidth = dimText.getWidth();

    let ugText = ug.apply(this.start);
    const len = this.destination - this.start.getDx();

    if (this.type === WLinkType.NORMAL) {
      this.drawNormalArrow(ug.apply(back(this.color)));
      ugText = ugText.apply(UTranslate.dy(-textHeight / 2));
    } else {
      this.drawBusArrow(ug.apply(back(getWhite())));
      ugText = ugText.apply(UTranslate.dy((BUS_SLOT - textHeight) / 2 - BUS_RAISE));
    }

    if (textHeight > 0) {
      ugText = ugText.apply(UTranslate.dx(this.labelOffset(len, textWidth)));
      if (this.type === WLinkType.NORMAL)
        ugText.apply(fore(getWhite())).apply(back(getWhite())).draw(URectangle.build(textWidth, textHeight));
      textBlock.drawU(ugText);
    }
  }

  /** The `switch (direction)`. @see WLinkHorizontal.java:110-120 */
  private labelOffset(len: number, textWidth: number): number {
    if (this.direction === WArrowDirection.NORMAL) return LABEL_MARGIN;
    if (this.direction === WArrowDirection.REVERSE) return len - textWidth - LABEL_MARGIN;
    return (len - textWidth) / 2;
  }

  /** @see WLinkHorizontal.java:129-180 */
  private drawBusArrow(ug: UGraphic): void {
    const dx = this.destination - this.start.getDx() - 2;
    ug.apply(this.start.compose(UTranslate.dx(1))).draw(polygon(this.busPoints(dx)));
  }

  /** Each `if (direction == ...)` branch of `drawBusArrow`; the four directions are exhaustive. */
  private busPoints(dx: number): readonly PathPoint[] {
    if (this.direction === WArrowDirection.NONE) return busNone(dx);
    if (this.direction === WArrowDirection.NORMAL) return busNormal(dx);
    if (this.direction === WArrowDirection.BOTH) return busBoth(dx);
    return busReverse(dx);
  }

  /** @see WLinkHorizontal.java:182-203 */
  private drawNormalArrow(ug: UGraphic): void {
    const dx = this.destination - this.start.getDx() - 2;
    if (this.direction === WArrowDirection.BOTH || this.direction === WArrowDirection.NORMAL)
      ug.apply(this.start.compose(UTranslate.dx(dx))).draw(polygon(HEAD_NORMAL));

    if (this.direction === WArrowDirection.BOTH || this.direction === WArrowDirection.REVERSE)
      ug.apply(this.start.compose(UTranslate.dx(1))).draw(polygon(HEAD_REVERSE));

    ug.apply(this.start.compose(UTranslate.dx(1))).draw(ULine.hline(dx));
  }
}
