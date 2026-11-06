/**
 * `BNode`: the guards of `addChild`, `computeX`'s pre-order columns, and
 * `toString`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/BNode.java
 */
import { describe, expect, it } from 'vitest';
import { BArray } from '../../../src/diagrams/board/BArray.js';
import { BNode } from '../../../src/diagrams/board/BNode.js';

describe('BNode#addChild', () => {
  it('links the child to its parent', () => {
    const root = new BNode(0, 'R');
    const child = new BNode(1, 'a');
    root.addChild(child);
    expect(child.getParent()).toBe(root);
    expect(root.getParent()).toBeUndefined();
  });

  it('refuses a child whose stage is not above its own (java:57-59)', () => {
    const parent = new BNode(2, 'p');
    expect(() => parent.addChild(new BNode(2, 'same'))).toThrow('IllegalArgumentException');
    expect(() => parent.addChild(new BNode(1, 'lower'))).toThrow('IllegalArgumentException');
  });

  it('refuses a child that already has a parent (java:61-63)', () => {
    const child = new BNode(1, 'c');
    new BNode(0, 'first').addChild(child);
    const second = new BNode(0, 'second');
    expect(() => second.addChild(child)).toThrow('IllegalArgumentException');
    expect(child.getParent()?.getName()).toBe('first');
  });
});

describe('BNode#computeX', () => {
  it('gives the first child its parent column and bumps each later sibling', () => {
    const root = new BNode(0, 'R');
    const a = new BNode(1, 'a');
    const a1 = new BNode(2, 'a1');
    const a2 = new BNode(2, 'a2');
    const b = new BNode(1, 'b');
    root.addChild(a);
    a.addChild(a1);
    a.addChild(a2);
    root.addChild(b);
    const count = { value: 0 };
    root.computeX(count);
    expect([root, a, a1, a2, b].map((n) => n.getX())).toEqual([0, 0, 0, 1, 2]);
    expect(count.value).toBe(2);
  });

  it('starts at -1 and prints as Java does (java:47, 79-82)', () => {
    const node = new BNode(3, 'Paris');
    expect(node.getX()).toBe(-1);
    expect(node.toString()).toBe('Paris(3) [-1]');
  });

  it('puts itself and its subtree in the array, pre-order', () => {
    const root = new BNode(0, 'R');
    const a = new BNode(2, 'a');
    root.addChild(a);
    root.computeX({ value: 0 });
    const array = new BArray();
    root.initBarray(array);
    expect(array.getCell(0, 0)).toBe(root);
    expect(array.getCell(0, 2)).toBe(a);
    expect([array.getMaxX(), array.getMaxY()]).toEqual([0, 2]);
  });
});
