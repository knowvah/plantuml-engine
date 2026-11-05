/**
 * ddd-T1a: `CommandCreateElementFull`'s keyword-less DISPLAY2, DISPLAY4 and
 * STEREOTYPE forms (`CommandCreateElementFull.java:83-115`). Expected values
 * are the pinned jar's (`test-results/dot-cache/unknown`: corevo-13-cega392,
 * virobu-13-gufo770, tipado-10-jave498).
 */
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { parseDescription } from '../../../src/diagrams/description/parser.js';
import { descriptionAst } from './parse-description-ast.js';

function block(...lines: string[]): UmlSource {
  return { lines, type: 'description' };
}

function parsed(line: string) {
  return descriptionAst(parseDescription(block(line))).nodes;
}

describe('CommandCreateElementFull, no keyword', () => {
  it.each([
    [':Main Admin: as Admin', 'Admin', 'Main Admin', 'actor'],
    [':First Actor:/ as Man2', 'Man2', 'First Actor', 'actor-business'],
    ['(Another Business usecase)/ as (BUC2)', 'BUC2', 'Another Business usecase', 'usecase-business'],
    ['(use case 2 -tech) << tech >> as uc2', 'uc2', 'use case 2 -tech', 'usecase'],
    [':Main Database: as MySql << Application >>', 'MySql', 'Main Database', 'actor'],
    ['plain as alias', 'alias', 'plain', 'actor'],
  ])('%s', (line, id, display, symbol) => {
    const [node] = parsed(line);
    expect({ id: node?.id, display: node?.display, symbol: node?.symbol }).toEqual({ id, display, symbol });
  });

  it('reads a stereotype before as, and after the code', () => {
    expect(parsed(':a b: << tech >> as x')[0]?.stereotype).toEqual(['tech']);
    expect(parsed(':a b: as x << tech >>')[0]?.stereotype).toEqual(['tech']);
  });

  it('corevo-13: the lazy STEREOTYPE runs to the last >>, one element and no link', () => {
    const src = '@startuml\n:joe:/ <<xxx>> #green -[#blue]-> (action)/ <<yyy>> #orange\n@enduml';
    const out = descriptionAst(parseDescription(block(src.split('\n')[1]!)));
    expect(out.nodes.map((n) => n.id)).toEqual(['joe']);
    expect(out.links).toEqual([]);
    expect(out.nodes[0]?.stereotype).toEqual(['xxx', 'yyy']);
    const svg = renderSync(src, { measurer: new DeterministicMeasurer() });
    expect(svg).toContain('data-diagram-type="DESCRIPTION"');
    expect(svg).toContain('width="58px" height="122px"');
    expect(svg).toContain('fill="#FFA500"');
  });

  it('the notation beats the keyword (jar: tests/fixtures/ddd-T1a/keyword-decorated-display.puml)', () => {
    const nodes = descriptionAst(
      parseDescription(
        block(
          'actor/ :Last actor: as Person1',
          'rectangle :a b: as c',
          'rectangle (d e) as f',
          'node [g h] as i',
          'rectangle j #pink',
        ),
      ),
    ).nodes;
    expect(nodes.map((n) => [n.id, n.display, n.symbol])).toEqual([
      ['Person1', 'Last actor', 'actor-business'],
      ['c', 'a b', 'actor'],
      ['f', 'd e', 'usecase'],
      ['i', 'g h', 'component'],
      ['j', 'j', 'rectangle'],
    ]);
  });

  it('isForbidden: a bare token alone is no declaration (java:134-138)', () => {
    expect(parseDescription(block('solo'))).toMatchObject({ refused: true, message: 'Syntax Error?' });
  });
});
