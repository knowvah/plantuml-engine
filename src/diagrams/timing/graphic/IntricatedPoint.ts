import type { UTranslate } from '../../../core/klimt/UTranslate.js';
import { XPoint2D } from '../../../core/klimt/geom/XPoint2D.js';

/**
 * Two points: where a message arrow meets a player's state on each side of a tick.
 * Created in T1a because `TimeProjected` names it; T2a lists it in its write-set and owns any change.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/IntricatedPoint.java:40-62
 */
export class IntricatedPoint {
  readonly #pta: XPoint2D;
  readonly #ptb: XPoint2D;

  public constructor(pta: XPoint2D, ptb: XPoint2D) {
    this.#pta = pta;
    this.#ptb = ptb;
  }

  public getPointA(): XPoint2D {
    return this.#pta;
  }

  public getPointB(): XPoint2D {
    return this.#ptb;
  }

  public translated(translate: UTranslate): IntricatedPoint {
    return new IntricatedPoint(translateXPoint(translate, this.#pta), translateXPoint(translate, this.#ptb));
  }
}

/** `UTranslate#getTranslated(XPoint2D)` returning an `XPoint2D`. */
function translateXPoint(translate: UTranslate, p: XPoint2D): XPoint2D {
  return new XPoint2D(p.x + translate.getDx(), p.y + translate.getDy());
}
