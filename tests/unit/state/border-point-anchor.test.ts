/**
 * Where a border-point composite declares its special point
 * (`ClusterDotString.printInternal`, `svek/ClusterDotString.java`):
 *
 *     if (thereALinkFromOrToGroup2) sb.append(specialPoint + " [shape=point,...];"); // :148-149
 *     if (thereALinkFromOrToGroup1) subgraphClusterNoLabel(sb, "i");                 // :151-152
 *     ...
 *     final SvekNode added = cluster.printCluster2(...);                             // :176
 *     ... else if (added == null) sb.append(empty() + " [shape=point,...];");        // :182-183
 *
 * So a linked composite holds the anchor in `ee`, and in `i` as well only when
 * it has no direct node of its own. A child cluster is not one: `printCluster2`
 * sets `added` in its node loop (`svek/Cluster.java`), so an anchor re-declared
 * after a child cluster still counts as `added == null`.
 *
 * Each fixture sits beside its jar render and `svek-1.dot`
 * (`scripts/oracle-render.sh`, deterministic text).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGraph } from '@knowvah/dot-engine';
import type { Graph } from '@knowvah/dot-engine';
import { describe, expect, it } from 'vitest';
import { addClusters } from '../../../src/core/graph-layout-build.js';
import { setLayoutInputObserver } from '../../../src/core/graph-layout.js';
import type { DotInputGraph } from '../../../src/core/graph-layout.js';
import type { DotInputCluster } from '../../../src/core/graph-layout.types.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { firstEncounterOrder } from '../../../src/core/svek-dot-order.js';
import { toSvekDot } from '../../../src/core/svek-dot-emit.js';
import { renderSync } from '../../../src/index.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { compareStructural, parseSvekDot } from '../../oracle/svek-dot.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/border-point-anchor');
const ANCHOR = 'anchor';
const PORT = 'port';
const MEMBER = 'member';

/** The ids of `name`'s own nodes, wherever that subgraph nests under `g`. */
function nodesOf(g: Graph, name: string): string[] | undefined {
  for (const [subName, sub] of g.subgraphs) {
    if (subName === name) return [...sub.nodes.keys()];
    const hit = nodesOf(sub, name);
    if (hit !== undefined) return hit;
  }
  return undefined;
}

function borderPointInput(extra: Partial<DotInputCluster>, members: readonly string[]): DotInputGraph {
  return {
    nodes: [PORT, ...members, ANCHOR].map((id) => ({ id, width: 10, height: 10 })),
    edges: [],
    clusters: [
      {
        id: 'grp',
        nodeIds: [PORT, ...members, ANCHOR],
        portRanks: [{ rank: 'sink', nodeIds: [PORT] }],
        portAnchorId: ANCHOR,
        portRanksLabelOnEe: true,
        ...extra,
      },
    ],
  };
}

function built(input: DotInputGraph): Graph {
  const b = createGraph({ directed: true });
  addClusters(b, input);
  return b.graph;
}

describe('addClusters: the anchor of a border-point composite', () => {
  it('a linked composite with a direct node holds the anchor in ee and not in i', () => {
    const g = built(borderPointInput({ borderPointAncestorWrap: true }, [MEMBER]));
    expect(nodesOf(g, 'cluster0i')).toEqual([MEMBER]);
    expect(nodesOf(g, 'cluster0ee')).toContain(ANCHOR);
  });

  it('a linked composite with no direct node also holds it in i (:182-183)', () => {
    const g = built(borderPointInput({ borderPointAncestorWrap: true }, []));
    expect(nodesOf(g, 'cluster0i')).toEqual([ANCHOR]);
    expect(nodesOf(g, 'cluster0ee')).toEqual([ANCHOR]);
  });

  it('an unlinked composite has no i, and holds the anchor in ee', () => {
    const g = built(borderPointInput({}, []));
    expect(nodesOf(g, 'cluster0i')).toBeUndefined();
    expect(nodesOf(g, 'cluster0ee')).toEqual([ANCHOR]);
  });

  it('declares nothing when the cluster has no anchor node of its own', () => {
    // `state-composite-cluster.ts` sets `portAnchorId` on every border-point
    // composite but creates the node only under `needsZaentPoint`.
    const input = borderPointInput({ borderPointAncestorWrap: true }, [MEMBER]);
    input.clusters![0]!.nodeIds = [PORT, MEMBER];
    const g = built(input);
    expect(nodesOf(g, 'cluster0ee')).toEqual([MEMBER]);
    expect(nodesOf(g, 'cluster0i')).toEqual([MEMBER]);
  });
});

describe('firstEncounterOrder: the anchor of a border-point composite', () => {
  const ids = (input: DotInputGraph): string[] => firstEncounterOrder(input).map((n) => n.id);

  it('a linked composite creates it before its members (:148-152)', () => {
    expect(ids(borderPointInput({ borderPointAncestorWrap: true }, [MEMBER]))).toEqual([PORT, ANCHOR, MEMBER]);
  });

  it('an unlinked composite creates it after its child clusters (:176-183)', () => {
    const input = borderPointInput({}, []);
    input.nodes.push({ id: 'inner', width: 10, height: 10 });
    input.clusters!.push({ id: 'child', parentId: 'grp', nodeIds: ['inner'] });
    expect(ids(input)).toEqual([PORT, 'inner', ANCHOR]);
  });
});

/** One statement per cluster-structure event, ids and attributes dropped: the
 *  order `dotEqual`'s multisets cannot see. `}` closes are kept per group. */
function clusterStatements(dot: string): string[] {
  const out: string[] = [];
  const re = /subgraph\s+cluster\d+(a|p0|i|p1|ee)?\s*\{|\{rank=\w+;[^}]*\}|(\})|(zaent\w+|sh\d+)\s*\[shape=(\w+)/g;
  for (let m = re.exec(dot); m !== null; m = re.exec(dot)) {
    if (m[0].startsWith('subgraph')) out.push(`open:${m[1] ?? 'base'}`);
    else if (m[2] !== undefined) out.push('close');
    else if (m[3] !== undefined) out.push(m[3].startsWith('zaent') ? 'anchor' : 'node');
  }
  return out;
}

function capture(source: string): DotInputGraph {
  const events: { nestedDepth?: number; graph: DotInputGraph }[] = [];
  setLayoutInputObserver((e) => events.push(e));
  try {
    renderSync(source, { measurer: new DeterministicMeasurer() });
  } finally {
    setLayoutInputObserver(undefined);
  }
  return events.find((e) => (e.nestedDepth ?? 0) === 0)!.graph;
}

describe.each([
  ['touched-member', ['open:ee', 'anchor', 'open:i', 'node', 'close']],
  ['touched-only-border', ['open:ee', 'anchor', 'open:i', 'anchor', 'close']],
  ['touched-only-child-cluster', ['open:ee', 'anchor', 'open:i', 'open:p0']],
  ['touched-member-and-child', ['open:ee', 'anchor', 'open:i', 'node', 'open:p0']],
  ['untouched-only-border', ['open:ee', 'anchor', 'close']],
  ['untouched-only-child-cluster', ['open:ee', 'open:p0']],
  // A note is a node of the cluster, so `added` is set and no anchor is written.
  ['untouched-note', ['open:ee', 'node', 'close']],
  ['touched-note', ['open:ee', 'anchor', 'open:i', 'node', 'close']],
])('jar svek-1.dot: %s', (name, expectedEe) => {
  const source = readFileSync(join(FIXTURES, `${name}.puml`), 'utf8');
  const jarDot = readFileSync(join(FIXTURES, `${name}.svek.dot`), 'utf8');

  it('reads the shape this case names from the jar', () => {
    const jar = clusterStatements(jarDot);
    const from = jar.indexOf('open:ee');
    expect(jar.slice(from, from + expectedEe.length)).toEqual(expectedEe);
  });

  it('our emitted cluster statements equal the jar’s, in order', () => {
    expect(clusterStatements(toSvekDot(capture(source)))).toEqual(clusterStatements(jarDot));
  });

  it('is structurally equal to the jar’s DOT', () => {
    const diff = compareStructural(parseSvekDot(jarDot), parseSvekDot(toSvekDot(capture(source))));
    expect(diff.clusterNestingOk).toBe(true);
    expect(diff.structurallyEqual).toBe(true);
  });

  it('renders with zero differences from the jar’s SVG', () => {
    const jarSvg = readFileSync(join(FIXTURES, `${name}.svg`), 'utf8');
    const ours = renderSync(source, { measurer: new DeterministicMeasurer() });
    expect(compareSvg(ours, jarSvg, 'deterministic').diffs).toEqual([]);
  });
});
