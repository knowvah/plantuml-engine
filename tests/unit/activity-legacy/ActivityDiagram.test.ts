import { describe, expect, it } from 'vitest';
import { Direction } from '../../../src/core/abel/Direction.js';
import { GroupType } from '../../../src/core/abel/GroupType.js';
import { LeafType } from '../../../src/core/abel/LeafType.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import type { ActivityDiagram } from '../../../src/diagrams/activity-legacy/ActivityDiagram.js';
import { emptyDiagram } from './helpers.js';

/** `getDotStrings` is `final protected` upstream; the test reads it through a cast. */
function dotStringsOf(diagram: ActivityDiagram): readonly string[] {
  return (diagram as unknown as { getDotStrings(): readonly string[] }).getDotStrings();
}

function branchNames(diagram: ActivityDiagram): string[] {
  return diagram
    .leafs()
    .filter((leaf) => leaf.getLeafType() === LeafType.BRANCH)
    .map((leaf) => leaf.getName());
}

describe('ActivityDiagram', () => {
  it('is an ACTIVITY diagram with no namespace separator', () => {
    const diagram = emptyDiagram();

    expect(diagram.getDiagramType()).toBe('ACTIVITY');
    expect(diagram.getNamespaceSeparator()).toBeUndefined();
  });

  describe('startIf / endif', () => {
    it('names automatic branches with getUniqueSequence("#") (each leaf also takes one value for its uid, CucaDiagram.java:171, 747) and keeps the first open after one endif', () => {
      const diagram = emptyDiagram();

      diagram.startIf(undefined, undefined);
      diagram.startIf(undefined, undefined);
      const inner = diagram.getCurrentContext()!;
      diagram.endif();

      expect(branchNames(diagram)).toEqual(['#1', '#3']);
      expect(inner.getBranch().getName()).toBe('#3');
      expect(inner.getDirection()).toBe(Direction.DOWN);
      expect(diagram.getCurrentContext()!.getBranch().getName()).toBe('#1');
      expect(diagram.getCurrentContext()).toBe(inner.getParent());
    });

    it('uses the optional code string, cleaned of its double quotes', () => {
      const diagram = emptyDiagram();

      diagram.startIf(undefined, '"cond"');

      expect(branchNames(diagram)).toEqual(['cond']);
    });

    it('closes the last context and then throws on a further endif (NullPointerException upstream)', () => {
      const diagram = emptyDiagram();
      diagram.startIf(undefined, undefined);

      diagram.endif();

      expect(diagram.getCurrentContext()).toBeUndefined();
      expect(() => diagram.endif()).toThrow('NullPointerException');
    });
  });

  describe('getStart / getEnd', () => {
    it('creates one CIRCLE_START leaf displayed "start", however often it is asked for', () => {
      const diagram = emptyDiagram();

      const first = diagram.getStart(undefined);
      const second = diagram.getStart(undefined);

      expect(second).toBe(first);
      expect(first.getLeafType()).toBe(LeafType.CIRCLE_START);
      expect(first.getDisplay().toString()).toBe('[start]');
      expect(diagram.leafs().filter((leaf) => leaf.getLeafType() === LeafType.CIRCLE_START)).toHaveLength(1);
    });

    it('names the end leaf "end", or "end$<id>" with an id, each CIRCLE_END displayed "end"', () => {
      const diagram = emptyDiagram();

      const plain = diagram.getEnd(undefined, undefined);
      const named = diagram.getEnd(undefined, 'x');

      expect(plain.getName()).toBe('end');
      expect(named.getName()).toBe('end$x');
      expect(diagram.getEnd(undefined, 'x')).toBe(named);
      expect(named.getLeafType()).toBe(LeafType.CIRCLE_END);
      expect(named.getDisplay().toString()).toBe('[end]');
    });
  });

  describe('last entities', () => {
    it('records the last entity and the last branch, and skips notes', () => {
      const diagram = emptyDiagram();
      const start = diagram.getStart(undefined);
      diagram.startIf(undefined, undefined);
      const branch = diagram.getCurrentContext()!.getBranch();
      diagram.createNote(undefined, diagram.quarkInContext(true, 'GMN1'), 'GMN1', Display.create('n'));

      expect(diagram.getLastEntityConsulted()).toBe(branch);
      expect(diagram.getLastEntityBrancheConsulted()).toBe(branch);
      diagram.setLastEntityConsulted(start);
      expect(diagram.getLastEntityConsulted()).toBe(start);
      expect(diagram.getLastEntityBrancheConsulted()).toBe(branch);
    });

    it('createNote makes a NOTE leaf with the given display', () => {
      const diagram = emptyDiagram();

      const note = diagram.createNote(undefined, diagram.quarkInContext(true, 'GMN2'), 'GMN2', Display.create('text'));

      expect(note.getLeafType()).toBe(LeafType.NOTE);
      expect(note.getDisplay().toString()).toBe('[text]');
    });
  });

  describe('groups', () => {
    it('createInnerActivity opens an INNER_ACTIVITY group named by getUniqueSequence("##")', () => {
      const diagram = emptyDiagram();
      diagram.getStart(undefined);

      const group = diagram.createInnerActivity(undefined);

      // the start leaf's uid took 1
      expect(group.getName()).toBe('##2');
      expect(group.getGroupType()).toBe(GroupType.INNER_ACTIVITY);
      expect(diagram.getCurrentGroup()).toBe(group);
      expect(diagram.getLastEntityConsulted()).toBeUndefined();
      expect(diagram.getLastEntityBrancheConsulted()).toBeUndefined();
    });

    it('concurrentActivity needs an enclosing INNER_ACTIVITY group (IllegalStateException)', () => {
      const diagram = emptyDiagram();

      expect(() => diagram.concurrentActivity(undefined, 'a')).toThrow('IllegalStateException: type=ROOT');
    });

    it('concurrentActivity opens a CONCURRENT_ACTIVITY group, and a second one replaces the first', () => {
      const diagram = emptyDiagram();
      const inner = diagram.createInnerActivity(undefined);

      diagram.concurrentActivity(undefined, 'a');
      const first = diagram.getCurrentGroup();
      diagram.concurrentActivity(undefined, 'b');
      const second = diagram.getCurrentGroup();

      expect(first.getGroupType()).toBe(GroupType.CONCURRENT_ACTIVITY);
      expect(second.getGroupType()).toBe(GroupType.CONCURRENT_ACTIVITY);
      expect(second).not.toBe(first);
      expect(second.getQuark().getName()).toBe('##5');
      expect(inner.getGroupType()).toBe(GroupType.INNER_ACTIVITY);
    });
  });

  it('getDotStrings is the dead-under-svek list, kept', () => {
    expect(dotStringsOf(emptyDiagram())).toEqual([
      'nodesep=.20;',
      'ranksep=0.4;',
      'edge [fontsize=11,labelfontsize=11];',
      'node [fontsize=11];',
    ]);
  });

  it('getDescription counts the leafs', () => {
    const diagram = emptyDiagram();
    diagram.getStart(undefined);
    diagram.getEnd(undefined, undefined);

    expect(diagram.getDescription()).toBe('(2 activities)');
  });
});
