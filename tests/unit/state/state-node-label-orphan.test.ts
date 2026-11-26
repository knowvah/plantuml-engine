/**
 * snl T6 (#235, D5): `CucaDiagram#isOrphanedTransitionLabel` (`net/atmp/CucaDiagram.java:815-831`). A transition label
 * leaf is hidden and removed once the other end of one of its links is hidden or removed (`:790-791`, `:808-809`), or
 * sits in a hidden or removed parent (`abel/Entity.java:434-460`).
 */
import { describe, expect, it } from 'vitest';

import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { State, StateDiagramAST } from '../../../src/diagrams/state/ast.js';
import { statePlugin } from '../../../src/diagrams/state/index.js';
import {
  computeHiddenIds,
  computeRemovedIds,
  filterRemovedEntities,
} from '../../../src/diagrams/state/state-directives.js';
import { orphanedTransitionLabels } from '../../../src/diagrams/state/state-orphan-label.js';
import { parseAst } from '../../helpers/parse-ast.js';

const NODE_SKINPARAM = [{ key: 'statediagramedgelabelstyle', value: 'node', position: 0, order: 0 }];
const LABEL = 'transition_A_B__go__0';

function parse(lines: readonly string[]): StateDiagramAST {
  const block: UmlSource = { lines: [...lines], type: 'state', skinparamAssignments: NODE_SKINPARAM };
  return parseAst(statePlugin, block);
}

function ids(states: readonly State[]): string[] {
  return states.flatMap((s) => [s.id, ...ids(s.children)]);
}

describe('snl T6: orphanedTransitionLabels', () => {
  it('holds when either end is hidden or removed, and only for transitionLabel leaves', () => {
    const ast = parse(['A --> B : go']);
    expect([...orphanedTransitionLabels(ast, new Set(), new Set())]).toEqual([]);
    expect([...orphanedTransitionLabels(ast, new Set(['B']), new Set())]).toEqual([LABEL]);
    expect([...orphanedTransitionLabels(ast, new Set(), new Set(['A']))]).toEqual([LABEL]);
  });

  it('holds when the other end sits in a hidden parent (Entity#isHidden)', () => {
    const ast = parse(['state P {', 'state B', '}', 'A --> B : go']);
    expect([...orphanedTransitionLabels(ast, new Set(['P']), new Set())]).toEqual([LABEL]);
  });

  it('is empty for a diagram without node style', () => {
    const block: UmlSource = { lines: ['A --> B : go'], type: 'state' };
    expect([...orphanedTransitionLabels(parseAst(statePlugin, block), new Set(['A']), new Set(['B']))]).toEqual([]);
  });
});

describe('snl T6: the hide and remove folds take the label with its host', () => {
  it('hide B: the label is hidden AND removed (the cross, CucaDiagram.java:827)', () => {
    const ast = parse(['A --> B : go', 'hide B']);
    expect([...computeHiddenIds(ast)].sort()).toEqual(['B', LABEL]);
    expect([...computeRemovedIds(ast)]).toEqual([LABEL]);
    const kept = filterRemovedEntities(ast);
    expect(ids(kept.states)).toEqual(['A', 'B']);
    expect(kept.transitions).toEqual([]);
  });

  it('remove A: the label and both links go', () => {
    const kept = filterRemovedEntities(parse(['A --> B : go', 'remove A']));
    expect(ids(kept.states)).toEqual(['B']);
    expect(kept.transitions).toEqual([]);
  });

  it('remove A then restore A: nothing is removed', () => {
    const ast = parse(['A --> B : go', 'remove A', 'restore A']);
    expect([...computeRemovedIds(ast)]).toEqual([]);
    expect(filterRemovedEntities(ast)).toBe(ast);
  });
});
