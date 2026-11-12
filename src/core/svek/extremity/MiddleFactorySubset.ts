import type { UDrawable } from '../../klimt/shape/UDrawable.js';
import type { MiddleFactory } from './MiddleFactory.js';
import { MiddleSubset } from './MiddleSubset.js';

/**
 * MiddleFactorySubset — `LinkMiddleDecor.SUBSET` is `new MiddleFactorySubset(false)`, `SUPERSET` is
 * `new MiddleFactorySubset(true)` (`LinkMiddleDecor.java:63-66`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/extremity/MiddleFactorySubset.java:40-50
 */
export class MiddleFactorySubset implements MiddleFactory {
  private readonly reverse: boolean;

  /** @see MiddleFactorySubset.java:44-46 */
  constructor(reverse: boolean) {
    this.reverse = reverse;
  }

  /** @see MiddleFactorySubset.java:48-50 */
  createUDrawable(angle: number): UDrawable {
    return new MiddleSubset(angle, this.reverse);
  }
}
