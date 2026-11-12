import type { Navigator } from './Navigator.js';

/**
 * Chain — an ordered, growable sequence with cursors; also its own
 * `Comparator` (`compare`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/Chain.java:41-51
 */
export interface Chain<O> {
  /** @see Chain.java:43 */
  navigator(data: O): Navigator<O>;
  /** @see Chain.java:45 */
  contains(data: O): boolean;
  /** @see Chain.java:47 */
  toList(): readonly O[];
  /** @see Chain.java:49 */
  remove(data: O): boolean;
  /** `Comparator#compare`. @see ChainImpl.java:69-90 */
  compare(a: O, b: O): number;
}
