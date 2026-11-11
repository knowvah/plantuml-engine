/**
 * `ETile`: a railroad tile. Its height splits at the track: `h1` above, `h2` below; `calculateDimensionSlow` is
 * `(width, h1 + h2)`. The line helpers draw the track and the arrows on it.
 *
 * `TRACE` (a `false` debug flag) is not ported. The comment defaults print `Ignoring … comment` to `System.err`;
 * stderr is not output, so here they do nothing (eep D10).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETile.java:49-167
 */
import { CopyForegroundColorToBackgroundColor } from '../../core/klimt/CopyForegroundColorToBackgroundColor.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { TextBlockMemoized } from '../../core/klimt/shape/TextBlockMemoized.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import { UPath } from '../../core/klimt/shape/UPath.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';

/** A four-point arrow head, `moveTo(0,0)` then the three points and back (`ETile.java:111-153`). */
function arrow(p1: readonly [number, number], p2: readonly [number, number], p3: readonly [number, number]): UPath {
  const path = UPath.none();
  path.moveTo(0, 0);
  path.lineTo(p1[0], p1[1]);
  path.lineTo(p2[0], p2[1]);
  path.lineTo(p3[0], p3[1]);
  path.lineTo(0, 0);
  path.closePath();
  return path;
}

/** `drawHlineDirected`'s last two Java parameters. */
export interface ArrowPlacement {
  readonly coef: number;
  readonly minimunSizeForArrow: number;
}

export abstract class ETile extends TextBlockMemoized {
  /** @see ETile.java:53-55 */
  static getStyleSignature(): StyleSignatureBasic {
    return StyleSignatureBasic.of('root', 'element', 'ebnf');
  }

  /** @see ETile.java:57 */
  abstract push(tile: ETile): void;

  /** `final` upstream. @see ETile.java:59-65 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    const width = this.getWidth(stringBounder);
    const h1 = this.getH1(stringBounder);
    const h2 = this.getH2(stringBounder);
    return new XDimension2D(width, h1 + h2);
  }

  /** @see ETile.java:67 */
  abstract getWidth(stringBounder: StringBounder): number;

  /** @see ETile.java:69 */
  abstract getH1(stringBounder: StringBounder): number;

  /** @see ETile.java:71 */
  abstract getH2(stringBounder: StringBounder): number;

  /** @see ETile.java:73-75 */
  protected drawHline(ug: UGraphic, y: number, x1: number, x2: number): void {
    ug.apply(new UTranslate(x1, y)).draw(ULine.hline(x2 - x1));
  }

  /**
   * An arrow only when `x2 > x1 + minimunSizeForArrow`. Java's `coef` and `minimunSizeForArrow` are one options
   * argument here (the 5-parameter cap, eep D12).
   * @see ETile.java:77-84
   */
  protected drawHlineDirected(ug: UGraphic, y: number, x1: number, x2: number, arrowAt: ArrowPlacement): void {
    const { coef, minimunSizeForArrow } = arrowAt;
    ug.apply(new UTranslate(x1, y)).draw(ULine.hline(x2 - x1));
    if (x2 > x1 + minimunSizeForArrow)
      ug.apply(new CopyForegroundColorToBackgroundColor())
        .apply(new UTranslate(x1 * (1 - coef) + x2 * coef - 2, y))
        .draw(ETile.getArrowToRight());
  }

  /** @see ETile.java:86-91 */
  protected drawHlineAntiDirected(ug: UGraphic, y: number, x1: number, x2: number, coef: number): void {
    ug.apply(new UTranslate(x1, y)).draw(ULine.hline(x2 - x1));
    ug.apply(new CopyForegroundColorToBackgroundColor())
      .apply(new UTranslate(x1 * (1 - coef) + x2 * coef - 2, y))
      .draw(ETile.getArrowToLeft());
  }

  /** @see ETile.java:93-95 */
  protected drawVline(ug: UGraphic, x: number, y1: number, y2: number): void {
    ug.apply(new UTranslate(x, y1)).draw(ULine.vline(y2 - y1));
  }

  /** @see ETile.java:97-101 */
  protected drawVlineDirected(ug: UGraphic, x: number, y1: number, y2: number): void {
    ug.apply(new UTranslate(x, y1)).draw(ULine.vline(y2 - y1));
    ug.apply(new CopyForegroundColorToBackgroundColor())
      .apply(new UTranslate(x, y1 * 0.5 + y2 * 0.5 - 2))
      .draw(ETile.getArrowToBottom());
  }

  /** @see ETile.java:104-108 */
  protected drawVlineAntiDirected(ug: UGraphic, x: number, y1: number, y2: number): void {
    ug.apply(new UTranslate(x, y1)).draw(ULine.vline(y2 - y1));
    ug.apply(new CopyForegroundColorToBackgroundColor())
      .apply(new UTranslate(x, y1 * 0.5 + y2 * 0.5 + 2))
      .draw(ETile.getArrowToTop());
  }

  /** @see ETile.java:111-120 */
  static getArrowToLeft(): UPath {
    return arrow([0, -3], [-6, 0], [0, 3]);
  }

  /** @see ETile.java:122-131 */
  static getArrowToRight(): UPath {
    return arrow([0, -3], [6, 0], [0, 3]);
  }

  /** @see ETile.java:133-142 */
  static getArrowToBottom(): UPath {
    return arrow([3, 0], [0, 6], [-3, 0]);
  }

  /** @see ETile.java:144-153 */
  static getArrowToTop(): UPath {
    return arrow([3, 0], [0, -6], [-3, 0]);
  }

  /** `System.err.println("Ignoring below comment …")`: no output (D10). @see ETile.java:155-157 */
  addCommentBelow(_comment: string): void {}

  /** `System.err.println("Ignoring above comment …")`: no output (D10). @see ETile.java:159-161 */
  addCommentAbove(_comment: string): void {}

  /** @see ETile.java:163-165 */
  getRepetitionLabel(): string {
    return '?';
  }
}
