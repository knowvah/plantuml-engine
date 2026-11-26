/**
 * snl T2 (#235): `-[nonode]->` parses in state (`CommandLinkState.java:65-67` reads `CommandLinkElement.LINE_STYLE`,
 * which lists `nonode`, `CommandLinkElement.java:82-86`) and is never a colour (`WithLinkType.java:157-161`).
 */
import { describe, expect, it } from 'vitest';

import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { StateDiagramAST } from '../../../src/diagrams/state/ast.js';
import { statePlugin } from '../../../src/diagrams/state/index.js';
import { TransitionLink } from '../../../src/diagrams/state/state-link-style.js';
import { parseTransitionLine } from '../../../src/diagrams/state/state-transitions.js';
import { parseDescription } from '../../../src/diagrams/description/parser.js';
import { parseAst } from '../../helpers/parse-ast.js';

function parse(lines: readonly string[]): StateDiagramAST {
  const block: UmlSource = { lines: [...lines], type: 'state' };
  return parseAst(statePlugin, block);
}

describe('snl T2: nonode in state', () => {
  it('A -[nonode]-> B : go parses to one plain transition keeping its style', () => {
    expect(parseTransitionLine('A -[nonode]-> B : go')).toEqual({
      from: 'A',
      to: 'B',
      length: 2,
      arrowStyle: 'nonode',
      rawLabel: 'go',
    });
    const ast = parse(['A -[nonode]-> B : go']);
    expect(ast.transitions.map((t) => [t.from, t.to, t.arrowStyle])).toEqual([['A', 'B', 'nonode']]);
  });

  it('the reverse arrow takes nonode too', () => {
    expect(parseTransitionLine('B <-[nonode]- A')).toMatchObject({ from: 'A', to: 'B', arrowStyle: 'nonode' });
  });

  it('nonode,dashed is dashed with no specific colour', () => {
    const link = new TransitionLink({ arrowStyle: 'nonode,dashed' });
    expect(link.getSpecificColor()).toBeUndefined();
    expect(link.useNodeStyle()).toBe(false);
    expect(link.getType().getStyle().toString()).toBe(
      new TransitionLink({ arrowStyle: 'dashed' }).getType().getStyle().toString(),
    );
  });
});

describe('snl T2: nonode in description', () => {
  it('component A / A -[nonode]-> B : go parses to one plain link, no colour', () => {
    const ast = parseDescription({ lines: ['component A', 'A -[nonode]-> B : go'] } as never);
    expect('refused' in ast).toBe(false);
    const links = (ast as { links: { from: string; to: string; colorOverride?: string; rawStyle?: string }[] }).links;
    expect(links.map((l) => [l.from, l.to, l.colorOverride])).toEqual([['A', 'B', undefined]]);
  });
});
