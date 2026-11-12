import type { BpmEvent } from './BpmEvent.js';

/**
 * BpmEventResume — continue on a new line under `id`, without a connection.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/BpmEventResume.java:37-48
 */
export class BpmEventResume implements BpmEvent {
  /** @see BpmEventResume.java:39-43 */
  constructor(private readonly id: string) {}

  /** @see BpmEventResume.java:45-47 */
  getId(): string {
    return this.id;
  }
}
