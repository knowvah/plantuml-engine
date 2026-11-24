/**
 * hnh T2c (#204): a state note takes its hidden flag from its single-link host before its own rules
 * (`CucaDiagram#isHidden`, `net/atmp/CucaDiagram.java:778-794`, `isNoteWithSingleLinkAttachedTo` `:835-853`), and a
 * hidden note draws nothing (`svek/SvekResult.java:82-90`). Expected comments are the jar's
 * (`tests/fixtures/hidden-note-host/hnh-state-*.svg`).
 */
import { describe, expect, it } from 'vitest';

import type { UmlSource } from '../../../src/core/block-extractor.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import type { StateDiagramAST } from '../../../src/diagrams/state/ast.js';
import { statePlugin } from '../../../src/diagrams/state/index.js';
import { computeHiddenIds, computeRemovedIds } from '../../../src/diagrams/state/state-directives.js';
import { renderSync } from '../../../src/index.js';
import { parseAst } from '../../helpers/parse-ast.js';
import { svgComments } from '../../oracle/svg-conformance/svg-comments.js';

function parse(lines: readonly string[]): StateDiagramAST {
  const block: UmlSource = { lines: [...lines], type: 'state' };
  return parseAst(statePlugin, block);
}

function noteIds(ast: StateDiagramAST): string[] {
  return (ast.notes ?? []).map((n) => n.id);
}

describe('hnh T2c: computeHiddenIds delegates a single-link note to its host', () => {
  it('note right of B + hide B: B and its note', () => {
    const ast = parse(['state A', 'state B', 'A --> B', 'note right of B : a note', 'hide B']);
    expect([...computeHiddenIds(ast)].sort()).toEqual(['B', ...noteIds(ast)].sort());
  });

  it('a lone note + hide N: N', () => {
    const ast = parse(['state A', 'note "alone" as N', 'hide N']);
    expect([...computeHiddenIds(ast)]).toEqual(['N']);
  });

  it('hide <note id> while its host B is visible: nothing (the note reads B, never its own rule)', () => {
    const base = parse(['state A', 'state B', 'A --> B', 'note right of B : a note']);
    const [id] = noteIds(base);
    const ast = parse(['state A', 'state B', 'A --> B', 'note right of B : a note', `hide ${id!}`]);
    expect([...computeHiddenIds(ast)]).toEqual([]);
  });

  it('remove takes the note with its host the same way', () => {
    const ast = parse(['state A', 'state B', 'A --> B', 'note right of B : a note', 'remove B']);
    expect([...computeRemovedIds(ast)].sort()).toEqual(['B', ...noteIds(ast)].sort());
  });
});

describe('hnh T2c: a note on a hidden state draws nothing', () => {
  it('two notes on hidden B and one on A: only "on A" is drawn, and B writes only its link comment', () => {
    const svg = renderSync(
      [
        '@startuml',
        'state A',
        'state B',
        'A --> B',
        'note right of B : first',
        'note left of B : second',
        'note top of A : on A',
        'hide B',
        '@enduml',
      ].join('\n'),
      { measurer: new DeterministicMeasurer() },
    );
    expect(svg).not.toContain('>first<');
    expect(svg).not.toContain('>second<');
    expect(svg).toContain('>on A<');
    expect(svgComments(svg)).toEqual(['link A to B', 'link __note_1 to B']);
  });
});
