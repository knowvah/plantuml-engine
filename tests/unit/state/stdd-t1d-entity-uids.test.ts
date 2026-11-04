import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { statePlugin } from '../../../src/diagrams/state/index.js';
import { parseAst } from '../../helpers/parse-ast.js';
import type { State } from '../../../src/diagrams/state/ast.js';

/**
 * stdd T1d: a dotted id's ancestors are quarks without an entity until
 * something makes one (`net/atmp/CucaDiagram.java#quarkInContext`).
 * `CommandCreateState.java:194-200` creates the leaf, then
 * `StateDiagram#ensureParentState` (`StateDiagram.java:268-280`) walks up
 * creating `GroupType.STATE` groups until one already has data. A block
 * opener (`gotoGroup`) and a link endpoint create nothing above the leaf;
 * `eventuallyBuildPhantomGroups` (`CucaDiagram.java:325-336,464`) makes those
 * `GroupType.PACKAGE` at render time, after every link, and
 * `ClusterHeader.java:161-162` styles a package title `package { title {
 * FontStyle bold } }` (`plantuml.skin:72-76`). Uids are the jar's `in.svg`.
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function render(slug: string): string {
  const puml = readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8');
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

const groups = (svg: string): string[] =>
  [...svg.matchAll(/<g class="(cluster|entity|start_entity|end_entity|link)"([^>]*)>/g)].map(
    (m) => `${m[1]} ${/\bid="([^"]*)"/.exec(m[2]!)?.[1] ?? ''}`,
  );

function parse(source: string) {
  const lines = source
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  return parseAst(statePlugin, { lines, type: 'state' });
}

const find = (states: readonly State[], id: string): State | undefined => {
  for (const s of states) {
    if (s.id === id) return s;
    const inner = find(s.children, id);
    if (inner !== undefined) return inner;
  }
  return undefined;
};

describe('stdd T1d: entity uids of dotted parents', () => {
  it('matezo-28: `state A.X` ticks X, then A; `state A.Y` ticks Y', () => {
    expect(groups(render('matezo-28-duka427')).slice(0, 3)).toEqual([
      'cluster ent0002',
      'entity ent0001',
      'entity ent0003',
    ]);
  });

  it('fovafu-44: `state B.A.X` ticks X, A, B bottom-up', () => {
    expect(groups(render('fovafu-44-mifu394')).slice(0, 4)).toEqual([
      'entity ent0003',
      'cluster ent0002',
      'entity ent0001',
      'entity ent0004',
    ]);
  });

  it('cesifo-37: two dotted declares, parents after their leaves', () => {
    expect(groups(render('cesifo-37-rugu443')).slice(0, 4)).toEqual([
      'cluster ent0004',
      'entity ent0003',
      'entity ent0002',
      'entity ent0001',
    ]);
  });

  it('tuvugi-94: a block opener leaves S for the end, after the link, with a bold package title', () => {
    const svg = render('tuvugi-94-gapi519');
    expect(groups(svg).slice(0, 3)).toEqual(['cluster ent0003', 'entity ent0001', 'link lnk2']);
    expect(svg).toMatch(/<text[^>]*font-weight="700"[^>]*>S<\/text>/);
    expect(svg).toMatch(/<text(?:(?!font-weight)[^>])*>I<\/text>/);
  });

  it('parse: the leaf-style declare promotes a phantom ancestor with a fresh tick', () => {
    const ast = parse(`
      state S.I {
      }
      state S.J
    `);
    const s = find(ast.states, 'S')!;
    expect(find(ast.states, 'I')!.creationIndex).toBe(1);
    expect(find(ast.states, 'J')!.creationIndex).toBe(2);
    expect(s.creationIndex).toBe(3);
    expect(s.autoPhantom).toBeUndefined();
  });

  it('parse: a still-phantom ancestor is ticked last, in quark order', () => {
    const ast = parse(`
      state S.I {
      }
      state T.K {
      }
      S.I --> T.K
    `);
    expect(find(ast.states, 'I')!.creationIndex).toBe(1);
    expect(find(ast.states, 'K')!.creationIndex).toBe(2);
    expect(ast.transitions[0]?.creationIndex ?? find(ast.states, 'S')!.transitions[0]?.creationIndex).toBe(3);
    expect(find(ast.states, 'S')!.creationIndex).toBe(4);
    expect(find(ast.states, 'T')!.creationIndex).toBe(5);
    expect(find(ast.states, 'S')!.autoPhantom).toBe(true);
  });
});
