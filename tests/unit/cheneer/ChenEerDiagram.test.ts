import { describe, expect, it } from 'vitest';
import { LeafType } from '../../../src/core/abel/LeafType.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { PragmaKey } from '../../../src/core/skin/PragmaKey.js';
import type { ChenEerDiagram } from '../../../src/diagrams/cheneer/ChenEerDiagram.js';
import { parseOk } from './helpers.js';

/** `getDotStrings` is `protected` (`final protected` upstream); the test reads it through a cast. */
function dotStringsOf(diagram: ChenEerDiagram): readonly string[] {
  return (diagram as unknown as { getDotStrings(): readonly string[] }).getDotStrings();
}

function entityIn(diagram: ChenEerDiagram, name: string) {
  const quark = diagram.quarkInContext(true, name);
  return diagram.reallyCreateLeaf(undefined, quark, Display.create(name), LeafType.CHEN_ENTITY, undefined);
}

describe('ChenEerDiagram', () => {
  it('prints CHEN_EER (D4)', () => {
    expect(parseOk().getDiagramType()).toBe('CHEN_EER');
  });

  describe('owner stack', () => {
    it('has no owner when empty, and popOwner reports false', () => {
      const diagram = parseOk();

      expect(diagram.peekOwner()).toBeUndefined();
      expect(diagram.popOwner()).toBe(false);
    });

    it('is LIFO: peek answers the last pushed, pop empties it back to the first', () => {
      const diagram = parseOk();
      const a = entityIn(diagram, 'A');
      const b = entityIn(diagram, 'B');

      diagram.pushOwner(a);
      diagram.pushOwner(b);
      expect(diagram.peekOwner()).toBe(b);
      expect(diagram.popOwner()).toBe(true);
      expect(diagram.peekOwner()).toBe(a);
      expect(diagram.popOwner()).toBe(true);
      expect(diagram.peekOwner()).toBeUndefined();
      expect(diagram.popOwner()).toBe(false);
    });
  });

  describe('getDotStrings (AbstractEntityDiagram.java:60-71)', () => {
    it('answers the four fixed lines', () => {
      expect(dotStringsOf(parseOk())).toEqual([
        'nodesep=.35;',
        'ranksep=0.8;',
        'edge [fontsize=11,labelfontsize=11];',
        'node [fontsize=11,height=.35,width=.55];',
      ]);
    });

    it('appends the graph_attributes pragma', () => {
      const diagram = parseOk('!pragma graph_attributes rotate=90');

      expect(diagram.getPragma().getValue(PragmaKey.GRAPH_ATTRIBUTES)).toBe('rotate=90');
      expect(dotStringsOf(diagram).at(-1)).toBe('rotate=90');
      expect(dotStringsOf(diagram)).toHaveLength(5);
    });

    it('feeds getDotStringSkek only nodesep and ranksep', () => {
      expect(parseOk().getDotStringSkek()).toEqual(['nodesep=.35;', 'ranksep=0.8;']);
    });
  });
});
