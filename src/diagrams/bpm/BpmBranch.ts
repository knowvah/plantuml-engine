import { BpmElement } from './BpmElement.js';
import { BpmElementType } from './BpmElementType.js';
import type { BpmEvent } from './BpmEvent.js';
import { BpmEventGoto } from './BpmEventGoto.js';
import { BpmEventResume } from './BpmEventResume.js';

/**
 * BpmBranch — one `new branch` ... `end branch`: an entry merge
 * `$branchA<uid>`, an exit merge `$branchB<uid>`, and the arm counter.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/BpmBranch.java:37-75
 */
export class BpmBranch {
  /** @see BpmBranch.java:40 */
  private counter = 1;

  /** `uid` is `events.size()` when `new branch` runs. @see BpmBranch.java:39,42-44 */
  constructor(private readonly uid: number) {}

  /** @see BpmBranch.java:46-49 */
  incAndGetCounter(): number {
    this.counter++;
    return this.counter;
  }

  /** @see BpmBranch.java:51-53 */
  private getEntryId(): string {
    return `$branchA${this.uid}`;
  }

  /** @see BpmBranch.java:55-57 */
  private getExitId(): string {
    return `$branchB${this.uid}`;
  }

  /** @see BpmBranch.java:59-61 */
  getEntryElement(): BpmElement {
    return new BpmElement(this.getEntryId(), BpmElementType.MERGE, null);
  }

  /** @see BpmBranch.java:63-65 */
  getElseElement(): BpmElement {
    return new BpmElement(this.getExitId(), BpmElementType.MERGE, null);
  }

  /** @see BpmBranch.java:67-69 */
  getResumeEntryEvent(): BpmEvent {
    return new BpmEventResume(this.getEntryId());
  }

  /** @see BpmBranch.java:71-73 */
  getGoToEndEvent(): BpmEvent {
    return new BpmEventGoto(this.getExitId());
  }
}
