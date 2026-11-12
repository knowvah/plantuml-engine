import type { MiddleFactory } from '../svek/extremity/MiddleFactory.js';
import { MiddleFactorySubset } from '../svek/extremity/MiddleFactorySubset.js';

/**
 * LinkMiddleDecor — the mid-link decoration (lollipop circles for
 * provided/required interfaces, subset/superset markers).
 *
 * Upstream: decoration/LinkMiddleDecor.java:47. As-const object +
 * string union per project convention; placed under
 * `src/core/abel/decoration/` — see `LinkDecor.ts`'s header note on
 * the write-set-constrained home. SI1/T2 (batch 1); ADR-1.
 *
 * `getMiddleFactory` (:49-69): the `SUBSET`/`SUPERSET` arms are {@link getMiddleFactory} below (cheneer T2b,
 * `MiddleFactorySubset`). The `CIRCLE*` arms stay DEFERRED here: `MiddleFactoryCircle`/`MiddleFactoryCircleCircled`/
 * `MiddleCircleCircledMode` are not ported as classes; their drawing is
 * `svek/extremity/MiddleCircleDecor.ts#drawMiddleDecor`, which dispatches here for `SUBSET`/`SUPERSET`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/decoration/LinkMiddleDecor.java:47
 */
export const LinkMiddleDecor = {
  NONE: 'NONE',
  CIRCLE: 'CIRCLE',
  CIRCLE_CIRCLED: 'CIRCLE_CIRCLED',
  CIRCLE_CIRCLED1: 'CIRCLE_CIRCLED1',
  CIRCLE_CIRCLED2: 'CIRCLE_CIRCLED2',
  SUBSET: 'SUBSET',
  SUPERSET: 'SUPERSET',
} as const;
export type LinkMiddleDecor = (typeof LinkMiddleDecor)[keyof typeof LinkMiddleDecor];

/**
 * `LinkMiddleDecor#getInversed()` — swaps `CIRCLE_CIRCLED1`/
 * `CIRCLE_CIRCLED2`; every other value maps to itself.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/decoration/LinkMiddleDecor.java:71-78
 */
export function getInversed(decor: LinkMiddleDecor): LinkMiddleDecor {
  if (decor === LinkMiddleDecor.CIRCLE_CIRCLED1) return LinkMiddleDecor.CIRCLE_CIRCLED2;
  else if (decor === LinkMiddleDecor.CIRCLE_CIRCLED2) return LinkMiddleDecor.CIRCLE_CIRCLED1;

  return decor;
}

/**
 * `LinkMiddleDecor#getMiddleFactory`, the `SUBSET` and `SUPERSET` arms: `new MiddleFactorySubset(false)` and
 * `new MiddleFactorySubset(true)`. Any other value throws as upstream's last line does
 * (`UnsupportedOperationException`); `CIRCLE*` are drawn by `MiddleCircleDecor.ts#drawMiddleDecor`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/decoration/LinkMiddleDecor.java:63-69
 */
export function getMiddleFactory(decor: LinkMiddleDecor): MiddleFactory {
  if (decor === LinkMiddleDecor.SUBSET) return new MiddleFactorySubset(false);

  if (decor === LinkMiddleDecor.SUPERSET) return new MiddleFactorySubset(true);

  throw new Error(`UnsupportedOperationException: ${decor} has no MiddleFactory here (CIRCLE* is MiddleCircleDecor)`);
}
