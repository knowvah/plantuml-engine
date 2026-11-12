import type { BpmElement } from './BpmElement.js';
import type { BpmEvent } from './BpmEvent.js';

/**
 * BpmEventAdd — place an element in a new column after the current one.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/BpmEventAdd.java:37-49
 */
export class BpmEventAdd implements BpmEvent {
  /** @see BpmEventAdd.java:39-43 */
  constructor(private readonly element: BpmElement) {}

  /** @see BpmEventAdd.java:45-47 */
  getElement(): BpmElement {
    return this.element;
  }
}
