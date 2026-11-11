import { Direction } from '../../core/abel/Direction.js';
import { Display } from '../../core/klimt/creole/Display.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { XPoint2D } from '../../core/klimt/geom/XPoint2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import { UPolygon } from '../../core/klimt/shape/UPolygon.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import type { StyleBuilder } from '../../core/style/StyleBuilder.js';
import type { HColor } from '../../core/style/Value.js';
import type { ArrowConfiguration } from '../sequence/sequence-arrowhead.js';
import type { TimeTick } from './TimeTick.js';
import type { TimingRuler } from './TimingRuler.js';
import { back, createDisplay, fore, timingStyleFrom, type TimingSkinParam } from './timing-klimt.js';

/** The six `TimeConstraint` constructor arguments (D16: more than five parameters take an args object). */
export interface TimeConstraintArgs {
  readonly marginx: number;
  readonly tick1: TimeTick;
  readonly tick2: TimeTick;
  readonly label: string | null;
  readonly skinParam: TimingSkinParam;
  readonly config: ArrowConfiguration;
}

/** `getTopMargin` (TimeConstraint.java:158-160). */
const TOP_MARGIN = 5;
/** Arrows narrower than this draw their heads outside the line (TimeConstraint.java:112). */
const WIDE_ARROW = 20;
/** The line stops this far inside a head on a wide arrow (java:113) and this far outside it on a narrow one (java:117). */
const HEAD_INSET = 3;
const NARROW_OVERLAP = 1;
/** `getPolygon`'s head size (java:163-164). */
const HEAD_DX = 8;
const HEAD_DY = 4;

/**
 * The `A@0 <-> @50 : {50 ms lag}` double arrow between two ticks of one player, with its label above it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/TimeConstraint.java:61-183
 */
export class TimeConstraint {
  readonly #tick1: TimeTick;
  readonly #tick2: TimeTick;
  readonly #label: Display;
  readonly #skinParam: TimingSkinParam;
  readonly #styleBuilder: StyleBuilder;
  readonly #config: ArrowConfiguration;
  readonly #marginx: number;

  /** java:71-80: `Objects.requireNonNull` on both ticks. */
  public constructor(args: TimeConstraintArgs) {
    this.#marginx = args.marginx;
    this.#tick1 = requireNonNull(args.tick1);
    this.#tick2 = requireNonNull(args.tick2);
    this.#label = Display.getWithNewlines(args.skinParam.getPragma(), args.label);
    this.#skinParam = args.skinParam;
    this.#styleBuilder = args.skinParam.getCurrentStyleBuilder();
    this.#config = args.config;
  }

  /** java:82-84 */
  public containsStrict(other: TimeTick): boolean {
    return this.#tick1.compareTo(other) < 0 && this.#tick2.compareTo(other) > 0;
  }

  public getTick1(): TimeTick {
    return this.#tick1;
  }

  public getTick2(): TimeTick {
    return this.#tick2;
  }

  public getLabel(): Display {
    return this.#label;
  }

  /** java:98-104: the label in the `constraintArrow` font, left aligned. */
  #getTextBlock(display: Display): TextBlock {
    return createDisplay(display, this.#getStyle(), this.#skinParam, HorizontalAlignment.LEFT);
  }

  /** java:106-126 */
  public drawU(ug: UGraphic, ruler: TimingRuler): void {
    const arrowColor = this.#getArrowColor();
    ug = ug.apply(fore(arrowColor)).apply(back(arrowColor));
    const x1 = ruler.getPosInPixel(this.#tick1) + this.#marginx;
    const x2 = ruler.getPosInPixel(this.#tick2) - this.#marginx;

    if (x2 - x1 > WIDE_ARROW) {
      this.#drawLine(ug, x1 + HEAD_INSET, x2 - HEAD_INSET);
      ug.apply(UStroke.simple()).draw(getPolygon(Direction.LEFT, new XPoint2D(x1, 0)));
      ug.apply(UStroke.simple()).draw(getPolygon(Direction.RIGHT, new XPoint2D(x2, 0)));
    } else {
      this.#drawLine(ug, x1 - NARROW_OVERLAP, x2 + NARROW_OVERLAP);
      ug.apply(UStroke.simple()).draw(getPolygon(Direction.RIGHT, new XPoint2D(x1, 0)));
      ug.apply(UStroke.simple()).draw(getPolygon(Direction.LEFT, new XPoint2D(x2, 0)));
    }

    const text = this.#getTextBlock(this.#label);
    const dimText = text.calculateDimension(ug.getStringBounder());
    const x = x1 + (x2 - x1 - dimText.getWidth()) / 2;
    text.drawU(ug.apply(new UTranslate(x, -this.getConstraintHeight(ug.getStringBounder()))));
  }

  /** java:128-130 */
  #drawLine(ug: UGraphic, x1: number, x2: number): void {
    ug.apply(UTranslate.dx(x1))
      .apply(this.#getUStroke())
      .draw(ULine.hline(x2 - x1));
  }

  /** java:132-137: the arrow's own colour, else the style's `LineColor`. */
  #getArrowColor(): HColor {
    const configColor = this.#config.color;
    if (configColor !== undefined) return configColor;
    return this.#getStyle().value('LineColor').asColor(this.#skinParam.getIHtmlColorSet());
  }

  /** java:139-149: `root, element, timingDiagram, constraintArrow` against the builder kept at construction. */
  #getStyle(): Style {
    return timingStyleFrom(this.#styleBuilder, 'constraintArrow');
  }

  #getUStroke(): UStroke {
    return this.#getStyle().getStroke();
  }

  /** java:151-156 */
  public getConstraintHeight(stringBounder: StringBounder): number {
    const text = this.#getTextBlock(this.#label);
    const dimText = text.calculateDimension(stringBounder);
    return dimText.getHeight() + TimeConstraint.getTopMargin();
  }

  public static getTopMargin(): number {
    return TOP_MARGIN;
  }
}

/** `Objects.requireNonNull` (java:73-74): the tick is `undefined` where Java passes `null`. */
function requireNonNull(tick: TimeTick): TimeTick {
  if ((tick as TimeTick | null | undefined) == null) throw new Error('java.lang.NullPointerException');
  return tick;
}

/** java:162-182: an arrow head pointing `dir`, its tip at `end`. */
function getPolygon(dir: Direction, end: XPoint2D): UPolygon {
  let pt1: XPoint2D;
  let pt2: XPoint2D;
  if (dir === Direction.RIGHT) {
    pt1 = end.move(-HEAD_DX, HEAD_DY);
    pt2 = end.move(-HEAD_DX, -HEAD_DY);
  } else {
    pt1 = end.move(HEAD_DX, HEAD_DY);
    pt2 = end.move(HEAD_DX, -HEAD_DY);
  }

  const polygon = new UPolygon();
  polygon.addPoint(pt1);
  polygon.addPoint(pt2);
  polygon.addPoint(end);

  return polygon;
}
