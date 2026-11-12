// gip T1c: the Smetana-shaped box (`DotInputNodeShape` 'box') and the raw
// Smetana `ranksep` (`DotInputGraph.smetanaRankSep`), as `SmetanaForGit`
// builds its graph (`SmetanaForGit.java:145-212`).
import { describe, expect, it } from 'vitest';
import type { GvGraphBuilder } from '@knowvah/dot-engine';
import { layoutGraph, type DotInputGraph } from '../../../src/core/graph-layout.js';
import { addNodes, applyGraphAttrs } from '../../../src/core/graph-layout-build.js';

/** `SmetanaForGit#createEdge` (`:193-195`). */
const GIT_EDGE_ATTRS = { arrowsize: '.7', arrowtail: 'none', arrowhead: 'normal' } as const;

/** One box declared 70.53x17 pt (no comment), one 40x24, joined child → parent. */
const gitGraph: DotInputGraph = {
  nodes: [
    { id: 'N0', width: 70.53, height: 17, shape: 'box' },
    { id: 'N1', width: 40, height: 24, shape: 'box' },
  ],
  edges: [{ id: 'e0', from: 'N0', to: 'N1', attributes: { ...GIT_EDGE_ATTRS } }],
  smetanaRankSep: '0.35',
};

/** A builder that records every `setAttr` and `addNode` call, in order. */
function recordingBuilder(): { b: GvGraphBuilder; calls: unknown[] } {
  const calls: unknown[] = [];
  const b = {
    setAttr: (k: string, v: string) => calls.push(['graph', k, v]),
    addNode: (id: string, attrs: Record<string, string>) => {
      calls.push(['node', id, Object.entries(attrs)]);
      return { setHtmlAttr: () => undefined };
    },
    addSubgraph: () => b,
  } as unknown as GvGraphBuilder;
  return { b, calls };
}

describe('the Smetana box node and raw ranksep (gip D2, SmetanaForGit.java:145-212)', () => {
  it('emits ranksep=0.35 as the only graph attribute: no nodesep, no searchsize', () => {
    const { b, calls } = recordingBuilder();
    applyGraphAttrs(b, gitGraph);
    expect(calls).toEqual([['graph', 'ranksep', '0.35']]);
  });

  it('declares shape, height, width in that order, Java `"" + double` inches, no fixedsize or label', () => {
    const { b, calls } = recordingBuilder();
    addNodes(b, gitGraph);
    expect(calls).toEqual([
      [
        'node',
        'N0',
        [
          ['shape', 'box'],
          ['height', '0.2361111111111111'],
          ['width', '0.9795833333333334'],
        ],
      ],
      [
        'node',
        'N1',
        [
          ['shape', 'box'],
          ['height', '0.3333333333333333'],
          ['width', '0.5555555555555556'],
        ],
      ],
    ]);
  });

  // Real graphviz on the same graph:
  //   printf 'digraph g {\nranksep=0.35;\nN0 [shape=box,height=0.2361111111111111,width=0.9795833333333334];\n
  //   N1 [shape=box,height=0.3333333333333333,width=0.5555555555555556];\n
  //   N0 -> N1 [arrowsize=.7,arrowtail=none,arrowhead=normal];\n}\n' | dot -Tdot     (dot 16.1.0, 2026-11-11)
  // prints N0 height=0.34028 pos="35.265,61.75" width=0.97958; N1 height=0.34028 pos="35.265,12.25" width=0.55556;
  // edge pos="e,35.265,24.973 35.265,49.252 35.265,44.423 35.265,38.663 35.265,33.182".
  // The default `\N` label ("N0") is 16.5 pt tall in Times 14 and padded by 8 (`shapes.c#poly_init`): 24.5 > 17.
  it('lays out at real dot 16.1.0 sizes, centres and spline, to the printed precision', () => {
    const { engineNodes, engineEdges } = layoutGraph(gitGraph, { read: 'exact' });
    const nodes = engineNodes!.map((n) => ({
      id: n.id,
      cx: n.cx.toFixed(3),
      cy: n.cy.toFixed(2),
      w: (n.width / 72).toFixed(5),
      h: (n.height / 72).toFixed(5),
    }));
    expect(nodes).toEqual([
      { id: 'N0', cx: '35.265', cy: '61.75', w: '0.97958', h: '0.34028' },
      { id: 'N1', cx: '35.265', cy: '12.25', w: '0.55556', h: '0.34028' },
    ]);
    const [edge] = engineEdges!;
    expect(edge!.points.map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`)).toEqual([
      '35.265,49.252',
      '35.265,44.423',
      '35.265,38.663',
      '35.265,33.182',
    ]);
    expect(`${edge!.epX!.toFixed(3)},${edge!.epY!.toFixed(3)}`).toBe('35.265,24.973');
  });

  it('leaves a graph without smetanaRankSep on the svek attribute path', () => {
    const { b, calls } = recordingBuilder();
    applyGraphAttrs(b, { nodes: [], edges: [], rankSep: 36 });
    expect(calls).toEqual([
      ['graph', 'ranksep', '0.5'],
      ['graph', 'searchsize', '500'],
    ]);
  });
});
