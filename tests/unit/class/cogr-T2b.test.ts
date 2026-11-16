/**
 * cogr T2b: an empty USymbol group (`node node { }`) is still a GROUP when upstream applies its Magma chaining
 * (`CucaDiagram#applySingleStrategy` walks `Entity.leafs()`, which excludes groups); it is muted to
 * `LeafType.EMPTY_PACKAGE` only later, at DOT export, so no standalone square-chaining edge reaches it.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GraphvizImageBuilder.java:416-418
 * @see ~/git/plantuml/src/main/java/net/atmp/CucaDiagram.java:679-706
 * Oracles: `test-results/dot-cache/class/puboje-01-suna474/` (page 415x112, four leaves, no edges) and
 * `.../mikepu-83-jono930/svek-1.dot` (four empty nodes in `together`, no edges).
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { setLayoutInputObserver } from '../../../src/core/graph-layout.js';
import type { DotInputGraph } from '../../../src/core/graph-layout.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const PUBOJE = [
  'title no style',
  'node node {',
  '}',
  'package package {',
  '}',
  'queue queue {',
  '}',
  'rectangle rectangle {',
  '}',
];
const MIKEPU = [
  'together {',
  'node "A" as a {',
  '}',
  'node "b" as b {',
  '}',
  'node "c" as c {',
  '}',
  'node "d" as d {',
  '}',
  '}',
];

function render(lines: readonly string[]): { svg: string; graph: DotInputGraph } {
  let graph: DotInputGraph | undefined;
  setLayoutInputObserver(({ graph: g }) => {
    graph = g;
  });
  try {
    const svg = renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });
    if (graph === undefined) throw new Error('no layout input captured');
    return { svg, graph };
  } finally {
    setLayoutInputObserver(undefined);
  }
}

describe('empty USymbol groups are not magma leaves (cogr T2b)', () => {
  it('lays four empty groups in one row with no chaining edges (puboje-01-suna474)', () => {
    const { svg, graph } = render(PUBOJE);
    expect(graph.edges.filter((e) => e.attributes?.invis === true)).toEqual([]);
    expect(svg).toMatch(/width="415(?:px)?"/);
    expect(svg).toMatch(/height="112(?:px)?"/);
  });

  it('adds no chaining edge between empty nodes inside together (mikepu-83-jono930)', () => {
    const { graph } = render(MIKEPU);
    expect(graph.nodes).toHaveLength(4);
    expect(graph.edges).toEqual([]);
  });
});
