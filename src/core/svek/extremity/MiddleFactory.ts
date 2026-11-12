import type { UDrawable } from '../../klimt/shape/UDrawable.js';

/**
 * MiddleFactory — builds the mid-link decor drawable for the angle `SvekEdge` hands it. `MiddleFactorySubset` is
 * its one implementation here; the `CIRCLE*` decor is drawn by `MiddleCircleDecor#drawMiddleDecor` (D2 of
 * cheneer, D5 of description-divergence-drive).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/extremity/MiddleFactory.java:40-43
 */
export interface MiddleFactory {
  createUDrawable(angle: number): UDrawable;
}
