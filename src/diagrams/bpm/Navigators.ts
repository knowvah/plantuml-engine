import type { Chain } from './Chain.js';
import type { Navigator } from './Navigator.js';

/**
 * Navigators — a forward cursor from `from` toward `to`, or a reversed one
 * when `to` comes first.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/Navigators.java:38-80
 */
export const Navigators = {
  /** @see Navigators.java:43-48 */
  iterate<O>(orig: Chain<O>, from: O, to: O): Navigator<O> {
    if (orig.compare(from, to) <= 0) return orig.navigator(from);
    return Navigators.reverse(orig.navigator(from));
  },

  /** @see Navigators.java:50-78 */
  reverse<O>(orig: Navigator<O>): Navigator<O> {
    return {
      next: () => orig.previous(),
      previous: () => orig.next(),
      get: () => orig.get(),
      set: (data: O) => orig.set(data),
      insertBefore: () => {
        throw new Error('UnsupportedOperationException: a reversed navigator cannot insert');
      },
      insertAfter: () => {
        throw new Error('UnsupportedOperationException: a reversed navigator cannot insert');
      },
    };
  },
} as const;
