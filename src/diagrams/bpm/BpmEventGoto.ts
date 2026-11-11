import type { BpmEvent } from './BpmEvent.js';

/**
 * BpmEventGoto — connect the last element to `id`, then continue on a new
 * line under it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/BpmEventGoto.java:37-48
 */
export class BpmEventGoto implements BpmEvent {
  /** @see BpmEventGoto.java:39-43 */
  constructor(private readonly id: string) {}

  /** @see BpmEventGoto.java:45-47 */
  getId(): string {
    return this.id;
  }
}
