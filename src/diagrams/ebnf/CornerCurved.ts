/**
 * `CornerCurved`: a quarter-turn of the track as one cubic, optionally with an arrow on its vertical end.
 * `CornerType` is the package-private enum declared in the same Java file.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/CornerCurved.java:44-119
 */
import { CopyForegroundColorToBackgroundColor } from '../../core/klimt/CopyForegroundColorToBackgroundColor.js';
import type { UDrawable } from '../../core/klimt/shape/UDrawable.js';
import { UPath } from '../../core/klimt/shape/UPath.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { ETile } from './ETile.js';

/** @see CornerCurved.java:44-46 */
type CornerType = 'NW' | 'NE' | 'SE' | 'SW';

export class CornerCurved implements UDrawable {
  private readonly delta: number;
  private readonly type: CornerType;
  private readonly withArrow: boolean;

  /** Java throws `IllegalArgumentException` for `delta <= 0`. @see CornerCurved.java:54-60 */
  private constructor(type: CornerType, delta: number, withArrow: boolean) {
    this.delta = delta;
    this.type = type;
    this.withArrow = withArrow;
    if (delta <= 0) throw new Error('IllegalArgumentException');
  }

  /** @see CornerCurved.java:62-64 */
  static createSW(delta: number): UDrawable {
    return new CornerCurved('SW', delta, false);
  }

  /** @see CornerCurved.java:66-68 */
  static createSE(delta: number): UDrawable {
    return new CornerCurved('SE', delta, false);
  }

  /** @see CornerCurved.java:70-72 */
  static createNE(delta: number): UDrawable {
    return new CornerCurved('NE', delta, false);
  }

  /** @see CornerCurved.java:74-76 */
  static createNE_arrow(delta: number): UDrawable {
    return new CornerCurved('NE', delta, true);
  }

  /** @see CornerCurved.java:78-80 */
  static createNW(delta: number): UDrawable {
    return new CornerCurved('NW', delta, false);
  }

  /** @see CornerCurved.java:82-84 */
  static createNW_arrow(delta: number): UDrawable {
    return new CornerCurved('NW', delta, true);
  }

  /** @see CornerCurved.java:86-117 */
  drawU(ug: UGraphic): void {
    const path = UPath.none();
    const delta = this.delta;
    const a = delta / 4;

    switch (this.type) {
      case 'SW':
        path.moveTo(0, -delta);
        path.cubicTo(0, -a, a, 0, delta, 0);
        break;
      case 'SE':
        path.moveTo(0, -delta);
        path.cubicTo(0, -a, -a, 0, -delta, 0);
        break;
      case 'NE':
        path.moveTo(-delta, 0);
        path.cubicTo(-a, 0, 0, a, 0, delta);
        if (this.withArrow) arrowOn(ug, delta - 5, ETile.getArrowToBottom());
        break;
      case 'NW':
        path.moveTo(0, delta);
        path.cubicTo(0, a, a, 0, delta, 0);
        if (this.withArrow) arrowOn(ug, delta, ETile.getArrowToTop());
        break;
    }

    ug.draw(path);
  }
}

/** `ug.apply(new CopyForegroundColorToBackgroundColor()).apply(UTranslate.dy(dy)).draw(arrow)`. @see CornerCurved.java:104-105, :111-112 */
function arrowOn(ug: UGraphic, dy: number, arrow: UPath): void {
  ug.apply(new CopyForegroundColorToBackgroundColor()).apply(UTranslate.dy(dy)).draw(arrow);
}
