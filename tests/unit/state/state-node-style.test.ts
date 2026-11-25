/**
 * snl T3 (#235): node style is decided in the transition command and builds one `STATE_TRANSITION_LABEL` leaf and two
 * links (`CommandLinkStateCommon.java:190-196`, `:292-395`). The ids read the injected clock plus a per-diagram leaf
 * count (decisions.md D1).
 */
import { describe, expect, it } from 'vitest';

import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { Clock } from '../../../src/core/clock.js';
import type { State, StateDiagramAST, Transition } from '../../../src/diagrams/state/ast.js';
import { statePlugin } from '../../../src/diagrams/state/index.js';
import {
  containsStyleKeyword,
  edgeLabelStyleOf,
  filterNodeKeyword,
  generateTransitionNodeId,
  shouldUseNodeStyle,
} from '../../../src/diagrams/state/state-node-style.js';
import { parseAst } from '../../helpers/parse-ast.js';

const NODE_SKINPARAM = [{ key: 'statediagramedgelabelstyle', value: 'node', position: 0, order: 0 }];

function parse(lines: readonly string[], opts: { node?: boolean; clock?: Clock } = {}): StateDiagramAST {
  const block: UmlSource = {
    lines: [...lines],
    type: 'state',
    ...(opts.node === true ? { skinparamAssignments: NODE_SKINPARAM } : {}),
  };
  return parseAst(statePlugin, block, opts.clock === undefined ? undefined : { clock: opts.clock });
}

function allStates(states: readonly State[], out: State[] = []): State[] {
  for (const s of states) {
    out.push(s);
    allStates(s.children, out);
  }
  return out;
}

function labels(ast: StateDiagramAST): State[] {
  return allStates(ast.states).filter((s) => s.kind === 'transitionLabel');
}

/** The fields the node-style branch decides, without the `undefined`-free spread noise. */
function shape(t: Transition): Record<string, unknown> {
  return {
    from: t.from,
    to: t.to,
    length: t.length,
    decorsNone: t.decorsNone ?? false,
    arrowStyle: t.arrowStyle,
    direction: t.direction,
    stereotype: t.stereotype,
    label: t.label,
    creationIndex: t.creationIndex,
  };
}

describe('snl T3: shouldUseNodeStyle / containsStyleKeyword', () => {
  it('matches whole tokens only, case-insensitively, over , and ;', () => {
    expect(containsStyleKeyword('#red,NODE', 'node')).toBe(true);
    expect(containsStyleKeyword('#red;node', 'node')).toBe(true);
    expect(containsStyleKeyword('nonode', 'node')).toBe(false);
    expect(containsStyleKeyword(undefined, 'node')).toBe(false);
  });

  it('nonode wins, then node, then the skinparam (equalsIgnoreCase)', () => {
    expect(shouldUseNodeStyle('nonode', 'node')).toBe(false);
    expect(shouldUseNodeStyle('node', undefined)).toBe(true);
    expect(shouldUseNodeStyle(undefined, 'NODE')).toBe(true);
    expect(shouldUseNodeStyle(undefined, 'normal')).toBe(false);
    expect(shouldUseNodeStyle(undefined, undefined)).toBe(false);
  });

  it('reads the last skinparam assignment under any cleanForKey form', () => {
    expect(edgeLabelStyleOf(undefined)).toBeUndefined();
    expect(
      edgeLabelStyleOf([
        { key: 'statediagramedgelabelstyle', value: 'node', position: 0, order: 0 },
        { key: 'state_diagram_edge_label_style', value: 'normal', position: 1, order: 1 },
      ]),
    ).toBe('normal');
  });
});

describe('snl T3: generateTransitionNodeId / filterNodeKeyword', () => {
  it('sanitises Display#toString ([a, b]) and appends the millis', () => {
    expect(generateTransitionNodeId('A', 'B', 'go', 0)).toBe('transition_A_B__go__0');
    expect(generateTransitionNodeId('A', 'B', 'go\\nnow', 7)).toBe('transition_A_B__go__now__7');
    expect(generateTransitionNodeId('*start*', 'A', '**go** (now)', 3)).toBe('transition_*start*_A____go____now___3');
  });

  it("applies upstream's three regexes verbatim", () => {
    expect(filterNodeKeyword('#red,dashed,node')).toBe('#red,dashed');
    expect(filterNodeKeyword('node,dotted')).toBe('dotted');
    expect(filterNodeKeyword('node')).toBe('');
    expect(filterNodeKeyword('#red,node,dashed')).toBe('#reddashed');
  });
});

describe('snl T3: the issue repro builds one leaf and two links', () => {
  it('skinparam node / A --> B : go', () => {
    const ast = parse(['state A', 'state B', 'A --> B : go'], { node: true });
    expect(labels(ast).map((s) => [s.id, s.display, s.stereotype, s.creationIndex])).toEqual([
      ['transition_A_B__go__0', 'go', 'transition', 3],
    ]);
    expect(ast.transitions.map(shape)).toEqual([
      shape({ from: 'A', to: 'transition_A_B__go__0', length: 2, decorsNone: true, creationIndex: 4 }),
      shape({ from: 'transition_A_B__go__0', to: 'B', length: 2, creationIndex: 5 }),
    ]);
  });

  it('a clock that reads 1000 and the line twice: two leaves, …__1000 and …__1001 (D1)', () => {
    const clock: Clock = { nowMillis: () => 1000, zone: 'UTC' };
    const ast = parse(['A --> B : go', 'A --> B : go'], { node: true, clock });
    expect(labels(ast).map((s) => s.id)).toEqual(['transition_A_B__go__1000', 'transition_A_B__go__1001']);
    expect(ast.transitions).toHaveLength(4);
  });
});

describe('snl T3: which transitions take the node path', () => {
  it('-[node]-> without the skinparam does; -[nonode]-> with it does not', () => {
    expect(labels(parse(['A -[node]-> B : go']))).toHaveLength(1);
    const plain = parse(['A -[nonode]-> B : go'], { node: true });
    expect(labels(plain)).toHaveLength(0);
    expect(plain.transitions.map((t) => [t.from, t.to, t.label, t.arrowStyle])).toEqual([['A', 'B', 'go', 'nonode']]);
  });

  it('an unlabelled transition under the skinparam stays one plain link (`:193`)', () => {
    const ast = parse(['A --> B'], { node: true });
    expect(labels(ast)).toHaveLength(0);
    expect(ast.transitions.map((t) => [t.from, t.to, t.decorsNone])).toEqual([['A', 'B', undefined]]);
  });
});

describe('snl T3: direction, style and stereotype', () => {
  it('-left-> inverts both links, each getInv burning a tick after both ctors (`:361-364`)', () => {
    const ast = parse(['state A', 'state B', 'A -left-> B : go'], { node: true });
    expect(ast.transitions.map((t) => [t.from, t.to, t.direction, t.creationIndex])).toEqual([
      ['A', 'transition_A_B__go__0', 'left', 6],
      ['transition_A_B__go__0', 'B', 'left', 7],
    ]);
  });

  it('the style without node reaches both links; neither takes the stereotype', () => {
    const ast = parse(['A -[#red,dashed,node]-> B <<hot>> : go']);
    expect(ast.transitions.map((t) => [t.arrowStyle, t.stereotype])).toEqual([
      ['#red,dashed', undefined],
      ['#red,dashed', undefined],
    ]);
    expect(parse(['A -[node,dotted]-> B : go']).transitions.map((t) => t.arrowStyle)).toEqual(['dotted', 'dotted']);
    expect(parse(['A -[node]-> B : go']).transitions.map((t) => t.arrowStyle)).toEqual([undefined, undefined]);
  });

  it('the second link keeps the original decors (x--> and -->o)', () => {
    const ast = parse(['A x-[node]->o B : go']);
    expect(ast.transitions.map((t) => [t.decorsNone, t.crossStart, t.circleEnd])).toEqual([
      [true, undefined, undefined],
      [undefined, true, true],
    ]);
  });
});

describe('snl T3: endpoint names and the current group', () => {
  it('[*] --> A : init names the start entity *start*', () => {
    const ast = parse(['[*] --> A : init'], { node: true });
    expect(labels(ast).map((s) => s.id)).toEqual(['transition_*start*_A__init__0']);
    expect(ast.transitions.map((t) => [t.from, t.to])).toEqual([
      ['[*]', 'transition_*start*_A__init__0'],
      ['transition_*start*_A__init__0', 'A'],
    ]);
  });

  it('inside state C, the start is *start*C and the leaf is a child of C', () => {
    const ast = parse(['state C {', '[*] --> X : enter', 'X --> Y : inner', '}'], { node: true });
    const c = ast.states.find((s) => s.id === 'C')!;
    expect(c.children.filter((s) => s.kind === 'transitionLabel').map((s) => s.id)).toEqual([
      'transition_*start*C_X__enter__0',
      'transition_X_Y__inner__1',
    ]);
    expect(ast.states.filter((s) => s.kind === 'transitionLabel')).toEqual([]);
  });
});
