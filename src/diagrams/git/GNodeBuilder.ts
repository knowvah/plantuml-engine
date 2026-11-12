import type { Commit } from './Commit.js';
import { GNode } from './GNode.js';

/**
 * GNodeBuilder — one `GNode` per commit name, linked to its parents, then
 * linear runs folded into one node.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/gitlog/GNodeBuilder.java:46-93
 */
export class GNodeBuilder {
  /** @see GNodeBuilder.java:49 */
  private readonly all: GNode[] = [];

  /**
   * A repeated name keeps its first slot and swaps in the later node, as
   * `LinkedHashMap#put` does (gip D6); `Map#set` on an existing key does the same.
   * Links resolve by name, once per commit, so a duplicate adds a parallel set.
   * A parent name missing from the map is Java's `NullPointerException` in
   * `GNode.link`; the `!` lets the same lookup throw a `TypeError` here.
   * @see GNodeBuilder.java:51-69
   */
  constructor(allCommits: readonly Commit[]) {
    const tmp = new Map<string, GNode>();
    for (const commit of allCommits) {
      const node = new GNode();
      node.setComment(commit.getComment());
      node.addText(commit.getName());
      tmp.set(commit.getName(), node);
    }
    for (const commit of allCommits)
      for (const parent of commit.getAncestors()) GNode.link(tmp.get(commit.getName())!, tmp.get(parent.getName())!);
    this.all.push(...tmp.values());
    this.merge();
  }

  /**
   * Eats one child at a time and restarts the scan from the head after each, as
   * the Java `break`s. `List#remove(Object)` drops the first identical node.
   * @see GNodeBuilder.java:71-87
   */
  private merge(): void {
    for (;;) {
      const node = this.all.find((n) => n.canEatTheNextOne());
      if (node === undefined) return;
      const removed = node.eatTheNextOne();
      this.all.splice(this.all.indexOf(removed), 1);
    }
  }

  /** @see GNodeBuilder.java:89-91 */
  getAllNodes(): readonly GNode[] {
    return this.all;
  }
}
