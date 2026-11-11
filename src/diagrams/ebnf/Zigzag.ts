/**
 * `Zigzag`: the S-shaped track between two heights, down or up, as two cubics through the midpoint.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/Zigzag.java:40-96
 */
import { UPath } from '../../core/klimt/shape/UPath.js';

export class Zigzag {
  private readonly width: number;
  private readonly height: number;
  private readonly ctrl: number;

  /** @see Zigzag.java:46-50 */
  constructor(ctrl: number, width: number, height: number) {
    this.ctrl = ctrl;
    this.width = width;
    this.height = height;
  }

  /** @see Zigzag.java:52-72 */
  pathDown(): UPath {
    const path = UPath.none();
    const xm = this.width / 2;
    const ym = this.height / 2;

    path.moveTo(0, 0);
    path.cubicTo(this.ctrl, 0, xm, ym - this.ctrl, xm, ym);
    path.cubicTo(xm, ym + this.ctrl, this.width - this.ctrl, this.height, this.width, this.height);

    return path;
  }

  /** @see Zigzag.java:74-94 */
  pathUp(): UPath {
    const path = UPath.none();
    const xm = this.width / 2;
    const ym = this.height / 2;

    path.moveTo(0, this.height);
    path.cubicTo(this.ctrl, this.height, xm, ym + this.ctrl, xm, ym);
    path.cubicTo(xm, ym - this.ctrl, this.width - this.ctrl, 0, this.width, 0);

    return path;
  }
}
