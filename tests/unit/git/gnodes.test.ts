import { describe, expect, it } from 'vitest';
import { IllegalStateException } from '../../../src/core/real/AbstractReal.js';
import { GNode } from '../../../src/diagrams/git/GNode.js';
import { GNodeBuilder } from '../../../src/diagrams/git/GNodeBuilder.js';
import { textAreaOf } from './helpers/text-area.js';

/** The `GNodeBuilder` nodes of `lines`, through the T1a grid parser. */
function nodesOf(lines: readonly string[]): readonly GNode[] {
  return new GNodeBuilder(textAreaOf(lines).getAllCommits()).getAllNodes();
}

/** Each node's `List#toString`, `[a, b]`. */
const texts = (nodes: readonly GNode[]): string[] => nodes.map((n) => n.toString());

describe('GNodeBuilder (GNodeBuilder.java:46-93)', () => {
  it('cov-chain-four folds the middle run into one node, texts in eat order', () => {
    // The oracle draws `ccc` over `bbb` in the middle box (cov-chain-four.svg).
    const nodes = nodesOf(['* ddd four', '* ccc three', '* bbb two', '* aaa one']);
    expect(texts(nodes)).toEqual(['[ddd]', '[ccc, bbb]', '[aaa]']);
    expect(nodes[1]!.getDowns()).toEqual([nodes[2]]);
    expect(nodes[1]!.getDisplay().size()).toBe(2);
  });

  it('juzane-95 keeps 5 nodes: no node has one parent and one single-linked child', () => {
    const nodes = nodesOf([
      '* a0f65180 (origin/cds/issue700) Layered: Clarified code. #700',
      '* 23a9f435 Layered: Fix wrong hierarchy handling. #700',
      '| * 9037d534 (HEAD -> master, origin/master) Build: Properly sign Maven artifacts. #722',
      '|/  ',
      '* 91fc1c7b Build: Mount Jenkins home. #722',
      '* 4fe6df1e Build: Add HOME env var to maven container. #722',
    ]);
    expect(texts(nodes)).toEqual(['[a0f65180]', '[23a9f435]', '[9037d534]', '[91fc1c7b]', '[4fe6df1e]']);
    expect(nodes.map((n) => n.isTop())).toEqual([true, false, true, false, false]);
    expect(nodes.map((n) => n.getComment())).toEqual([
      'origin/cds/issue700',
      null,
      'HEAD -> master, origin/master',
      null,
      null,
    ]);
  });

  // The first a1's parent walk stops at the second `* a1` line, whose name resolves to the surviving node:
  // a self-loop, then a1 → r0. The oracle draws exactly that (cov-duplicate-name.svg: a looping curve on the
  // a1 box, then a straight edge to r0).
  it('cov-duplicate-name: the later a1 takes the first slot, links to itself, then to r0 (gip D6)', () => {
    const nodes = nodesOf(['* a1 one', '* a1 two', '* r0 root']);
    expect(texts(nodes)).toEqual(['[a1]', '[r0]']);
    expect(nodes[0]!.getDowns()).toEqual([nodes[0], nodes[1]]);
    expect(nodes[0]!.isTop()).toBe(false);
  });

  it('cov-long-chain-after-merge: the fold stops at the merge', () => {
    const nodes = nodesOf(['*   m1 Merge', '|\\  ', '| * f1 f', '|/  ', '* c3 three', '* c2 two', '* c1 one']);
    // c3 has two children (m1, f1), so it cannot be eaten; c3 itself has two ups, so it cannot eat c2.
    // c2 has one up (c3) and one down (c1), but c1 has no down: nothing folds.
    expect(texts(nodes)).toEqual(['[m1]', '[f1]', '[c3]', '[c2]', '[c1]']);
  });

  it('restarts from the head after each eat, so a long run folds into its first eater', () => {
    const nodes = nodesOf(['* t', '* e', '* d', '* c', '* b', '* a']);
    expect(texts(nodes)).toEqual(['[t]', '[e, d, c, b]', '[a]']);
  });
});

describe('GNode (GNode.java:45-119)', () => {
  /** n1 → n2 → n3 → n4, linked down. */
  function chain(n: number): GNode[] {
    const nodes = Array.from({ length: n }, (_, i) => {
      const node = new GNode();
      node.addText(`n${i}`);
      return node;
    });
    for (let i = 0; i + 1 < n; i++) GNode.link(nodes[i]!, nodes[i + 1]!);
    return nodes;
  }

  it('cannot eat when the child has two parents', () => {
    const [top, mid, low] = chain(3);
    const other = new GNode();
    GNode.link(other, low!);
    expect(mid!.canEatTheNextOne()).toBe(false);
    expect(top!.canEatTheNextOne()).toBe(false);
  });

  it('eatTheNextOne rewires down[0] and the grandchild ups, and returns the eaten node', () => {
    const [top, mid, low, base] = chain(4);
    expect(mid!.eatTheNextOne()).toBe(low);
    expect(mid!.getDowns()).toEqual([base]);
    expect(mid!.toString()).toBe('[n1, n2]');
    expect(base!.isTop()).toBe(false);
    expect(top!.getDowns()).toEqual([mid]);
  });

  it('eatTheNextOne throws IllegalStateException when it cannot eat (GNode.java:105-106)', () => {
    const [top] = chain(2);
    expect(() => top!.eatTheNextOne()).toThrow(IllegalStateException);
  });
});
