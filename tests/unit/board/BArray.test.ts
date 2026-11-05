/**
 * `BArray`: the `"x;y"` keys, the duplicate guard and the maxima, and the
 * iteration in Java `HashMap` order (bep D3).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/BArray.java
 */
import { describe, expect, it } from 'vitest';
import { BArray } from '../../../src/diagrams/board/BArray.js';
import { BNode } from '../../../src/diagrams/board/BNode.js';

/** A node already placed at column `x`. */
function placed(x: number, stage: number, name: string): BNode {
  const root = new BNode(stage, name);
  root.computeX({ value: x });
  return root;
}

describe('BArray#put', () => {
  it('tracks the largest column and stage', () => {
    const array = new BArray();
    array.put(placed(3, 1, 'a'));
    array.put(placed(1, 4, 'b'));
    expect([array.getMaxX(), array.getMaxY()]).toEqual([3, 4]);
    expect(array.getCell(3, 1)?.getName()).toBe('a');
    expect(array.getCell(1, 3)).toBeUndefined();
  });

  it('refuses a second node on the same cell (java:51-53)', () => {
    const array = new BArray();
    array.put(placed(2, 1, 'first'));
    expect(() => array.put(placed(2, 1, 'second'))).toThrow('IllegalArgumentException');
    expect(array.getCell(2, 1)?.getName()).toBe('first');
  });

  it('starts both maxima at 0', () => {
    const array = new BArray();
    expect([array.getMaxX(), array.getMaxY(), [...array]]).toEqual([0, 0, []]);
  });
});

describe('BArray iteration', () => {
  it('follows the String.hashCode buckets of a 16-slot table, not put order', () => {
    const array = new BArray();
    for (const key of ['1;0', '3;2', '0;0', '0;1']) {
      const [x, y] = key.split(';').map(Number) as [number, number];
      array.put(placed(x, y, key));
    }
    // jshell, JDK 21: a `new HashMap<String, String>()` given these four puts
    // prints `keySet()` as [0;0, 1;0, 0;1, 3;2].
    expect([...array].map((n) => n.getName())).toEqual(['0;0', '1;0', '0;1', '3;2']);
  });
});
