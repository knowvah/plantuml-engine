import { Display } from '../../core/klimt/creole/Display.js';
import { IllegalStateException } from '../../core/real/AbstractReal.js';

/**
 * GNode — one drawn box: a run of commits folded together, with its `(…)`
 * comment and its links up (children) and down (parents).
 *
 * Mutable in place, as upstream: `GNodeBuilder#merge` folds chains through
 * `eatTheNextOne`, which rewrites `down`, `up` and `texts`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/gitlog/GNode.java:45-119
 */
export class GNode {
  /** @see GNode.java:47-49 */
  private readonly up: GNode[] = [];
  private readonly down: GNode[] = [];
  private readonly texts: string[] = [];
  /** @see GNode.java:51 */
  private comment: string | null = null;

  /** @see GNode.java:53-55 */
  addText(text: string): void {
    this.texts.push(text);
  }

  /** @see GNode.java:57-59 */
  isTop(): boolean {
    return this.up.length === 0;
  }

  /** @see GNode.java:61-63 */
  getComment(): string | null {
    return this.comment;
  }

  /** @see GNode.java:65-67 */
  setComment(comment: string | null): void {
    this.comment = comment;
  }

  /** @see GNode.java:69-72 */
  static link(n1: GNode, n2: GNode): void {
    n1.down.push(n2);
    n2.up.push(n1);
  }

  /** `List#toString`: `[a, b]`. @see GNode.java:74-77 */
  toString(): string {
    return `[${this.texts.join(', ')}]`;
  }

  /** One line per folded commit name. @see GNode.java:79-81 */
  getDisplay(): Display {
    return Display.create(this.texts);
  }

  /** @see GNode.java:83-85 */
  getDowns(): readonly GNode[] {
    return this.down;
  }

  /** One parent and one child, and so has the child. @see GNode.java:87-102 */
  canEatTheNextOne(): boolean {
    if (this.up.length !== 1) return false;
    if (this.down.length !== 1) return false;
    const next = this.down[0]!;
    if (next.up.length !== 1) return false;
    if (next.down.length !== 1) return false;
    return true;
  }

  /**
   * Folds the child into this node and returns it. Both guards are unreachable
   * from `GNodeBuilder#merge`, which tests `canEatTheNextOne` first; kept (gip D1).
   * @see GNode.java:104-117
   */
  eatTheNextOne(): GNode {
    if (this.canEatTheNextOne() === false) throw new IllegalStateException();
    const removed = this.down[0]!;
    const newNext = removed.down[0]!;
    this.texts.push(...removed.texts);
    this.down[0] = newNext;
    const at = newNext.up.indexOf(removed);
    if (at === -1) throw new IllegalStateException();
    newNext.up.splice(at, 1);
    newNext.up.push(this);
    return removed;
  }
}
