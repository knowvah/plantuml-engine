import type { Entity } from '../../core/abel/Entity.js';
import { LeafType } from '../../core/abel/LeafType.js';
import type { Direction } from '../../core/abel/Direction.js';

/**
 * One open `if`: its `BRANCH` leaf, the direction it was opened with, and the enclosing context.
 * Throws on an entity that is not a `BRANCH` (`IllegalArgumentException`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram/ConditionalContext.java:44-71
 */
export class ConditionalContext {
  /** @see ConditionalContext.java:46-48 */
  private readonly branch: Entity;
  private readonly direction: Direction;
  private readonly parent: ConditionalContext | undefined;

  /** `Objects.requireNonNull(branch)` is the non-optional type. @see ConditionalContext.java:50-57 */
  constructor(parent: ConditionalContext | undefined, branch: Entity, direction: Direction) {
    this.branch = branch;
    if (branch.getLeafType() !== LeafType.BRANCH) throw new Error('IllegalArgumentException');
    this.direction = direction;
    this.parent = parent;
  }

  /** @see ConditionalContext.java:59-61 */
  getDirection(): Direction {
    return this.direction;
  }

  /** @see ConditionalContext.java:63-65 */
  getParent(): ConditionalContext | undefined {
    return this.parent;
  }

  /** @see ConditionalContext.java:67-69 */
  getBranch(): Entity {
    return this.branch;
  }
}
