import { IllegalArgumentException } from '../../core/real/AbstractReal.js';
import type { CursorPosition } from './CursorPosition.js';

/**
 * Commit — one `*` of the grid: its name, its `(…)` comment, and the parents
 * found by walking the graph characters below it.
 *
 * Not ported (gip D1): `getPosition`, `hashCode` and `equals`, which nothing in
 * `src/main/java/net` calls (`GNodeBuilder` keys its map by `getName()`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/gitlog/Commit.java:42-128
 */
export class Commit {
  /** @see Commit.java:44-46 */
  private readonly name: string;
  private readonly comment: string | null;
  private readonly position: CursorPosition;

  /**
   * Throws unless the `*` is followed by a space or a `-` (gip D5): `*` alone,
   * `*a1` and `*\ta1` all reach the `IllegalArgumentException`.
   * @see Commit.java:48-55
   */
  constructor(name: string, position: CursorPosition) {
    this.name = name;
    this.position = position;
    this.comment = position.getCommentInLine();
    if (position.matches('* ') === false && position.matches('*-') === false) throw new IllegalArgumentException();
  }

  /** @see Commit.java:57-59 */
  getComment(): string | null {
    return this.comment;
  }

  /** @see Commit.java:72-75 */
  toString(): string {
    return this.name;
  }

  /**
   * A `*` directly below, then the cells above-of-parent of the `*` itself, then
   * of every `.` in the `-`/`.` run to its right (an octopus `*-.---.`).
   * @see Commit.java:77-94
   */
  getCandidatesForDown(): readonly CursorPosition[] {
    const result: CursorPosition[] = [];
    if (this.position.move(0, 1).matches('*')) result.push(this.position.move(0, 1));
    let current = this.position;
    Commit.addAbove(result, current);
    for (;;) {
      current = current.move(1, 0);
      if (current.matches('.')) Commit.addAbove(result, current);
      else if (!current.matches('-')) return result;
    }
  }

  /** `|` below, `\` below-right, `/` below-left, in that order. @see Commit.java:96-106 */
  private static addAbove(result: CursorPosition[], here: CursorPosition): void {
    if (here.move(0, 1).matches('|')) result.push(here.move(0, 1));
    if (here.move(1, 1).matches('\\')) result.push(here.move(1, 1));
    if (here.move(-1, 1).matches('/')) result.push(here.move(-1, 1));
  }

  /** Each candidate walked down to its commit, a fresh `Commit` per walk. @see Commit.java:108-118 */
  getAncestors(): readonly Commit[] {
    const result: Commit[] = [];
    for (const pos of this.getCandidatesForDown()) {
      const down = pos.getDownFromHere();
      result.push(down.getCommit());
    }
    return result;
  }

  /** @see Commit.java:120-122 */
  getName(): string {
    return this.name;
  }
}
