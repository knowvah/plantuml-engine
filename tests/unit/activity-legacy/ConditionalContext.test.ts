import { describe, expect, it } from 'vitest';
import { Direction } from '../../../src/core/abel/Direction.js';
import { LeafType } from '../../../src/core/abel/LeafType.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { ConditionalContext } from '../../../src/diagrams/activity-legacy/ConditionalContext.js';
import { emptyDiagram } from './helpers.js';

/** @see ConditionalContext.java:50-57 */
describe('ConditionalContext', () => {
  it('keeps the branch, direction and parent it was built with', () => {
    const diagram = emptyDiagram();
    const branch = diagram.reallyCreateLeaf(
      undefined,
      diagram.quarkInContext(true, 'b1'),
      Display.create(''),
      LeafType.BRANCH,
      undefined,
    );
    const parent = new ConditionalContext(undefined, branch, Direction.DOWN);
    const child = new ConditionalContext(parent, branch, Direction.RIGHT);

    expect(child.getBranch()).toBe(branch);
    expect(child.getDirection()).toBe(Direction.RIGHT);
    expect(child.getParent()).toBe(parent);
    expect(parent.getParent()).toBeUndefined();
  });

  it('throws IllegalArgumentException on an entity that is not a BRANCH', () => {
    const diagram = emptyDiagram();
    const activity = diagram.reallyCreateLeaf(
      undefined,
      diagram.quarkInContext(true, 'a1'),
      Display.create('a'),
      LeafType.DESCRIPTION,
      undefined,
    );

    expect(() => new ConditionalContext(undefined, activity, Direction.DOWN)).toThrow('IllegalArgumentException');
  });
});
