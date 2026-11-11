/**
 * Navigator — a cursor over a `Chain`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/Navigator.java:38-52
 */
export interface Navigator<O> {
  /** `null` past the end (`ChainImpl#ensure` pads). @see Navigator.java:40 */
  next(): O | null;
  /** @see Navigator.java:42 */
  previous(): O | null;
  /** @see Navigator.java:44 */
  get(): O | null;
  /** @see Navigator.java:46 */
  set(data: O): void;
  /** @see Navigator.java:48 */
  insertBefore(data: O): void;
  /** @see Navigator.java:50 */
  insertAfter(data: O): void;
}
