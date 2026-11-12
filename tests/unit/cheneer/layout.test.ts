/**
 * The Chen DOT build and layout (cheneer T2c): the DOT graph the engine hands the one dot-engine seam, compared
 * structurally with the jar's `svek-1.dot` of the planning probes, and the one-leaf short-circuit that never
 * reaches graphviz (`GraphvizImageBuilder.java:145-158`).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setLayoutInputObserver } from '../../../src/core/graph-layout.js';
import type { DotInputGraph } from '../../../src/core/graph-layout.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { layoutChen } from '../../../src/diagrams/cheneer/layout.js';
import { compareStructural, dotInputToStructural, parseSvekDot } from '../../oracle/svek-dot.js';
import { structuralFailures } from '../../oracle/dot-parity-backlogs.js';
import { graphvizProbeSlugs, oracleDot, parseProbe, probeSource } from './oracle-fixtures.js';
import { renderChen } from './render-chen.js';

let captured: DotInputGraph[] = [];
beforeEach(() => {
  captured = [];
  setLayoutInputObserver(({ graph }) => captured.push(graph));
});
afterEach(() => setLayoutInputObserver(undefined));

const measurer = new DeterministicMeasurer();

describe('layoutChen: the DOT against the jar svek-1.dot', () => {
  it.each(['vega-chen-movie', 'cov-cardinality', 'cov-rankdir'])('%s is structurally equal', (slug) => {
    layoutChen(parseProbe(slug), measurer);
    expect(captured).toHaveLength(1);
    const diff = compareStructural(parseSvekDot(oracleDot(slug)), dotInputToStructural(captured[0]!));
    expect(structuralFailures(diff)).toEqual([]);
  });

  // Through `renderSync`, so `skinparam` and `<style>` lines reach the diagram; its render step is T2d's and its error
  // is the page `renderSync` answers, after the layout graph has been observed.
  it.each(graphvizProbeSlugs())('%s: every probe the jar laid out matches', (slug) => {
    renderChen(probeSource(slug));
    expect(captured).toHaveLength(1);
    const diff = compareStructural(parseSvekDot(oracleDot(slug)), dotInputToStructural(captured[0]!));
    expect(structuralFailures(diff)).toEqual([]);
    expect(diff.maxSizeDeltaIn).toBeLessThan(0.01);
  });

  it('sets rankdir=LR from `left to right direction`', () => {
    layoutChen(parseProbe('cov-rankdir'), measurer);
    expect(captured[0]!.rankDir).toBe('LR');
  });

  it('writes the non-activity separators: 35px nodesep, 60px ranksep', () => {
    layoutChen(parseProbe('vega-chen-movie'), measurer);
    expect(captured[0]!.nodeSep).toBe(35);
    expect(captured[0]!.rankSep).toBe(60);
  });
});

describe('layoutChen: a diagram with one leaf and no link', () => {
  it('sends no graph to the observer and answers the leaf with its 7px delta', () => {
    const geometry = layoutChen(parseProbe('cov-entity-empty'), measurer);
    expect(captured).toEqual([]);
    expect(geometry.degenerate).toBe(true);
    expect(geometry.nodes).toHaveLength(1);
  });

  it('answers a relationship the same way', () => {
    const geometry = layoutChen(parseProbe('cov-relationship'), measurer);
    expect(captured).toEqual([]);
    expect(geometry.degenerate).toBe(true);
  });
});

describe('layoutChen: the solved geometry', () => {
  it('places every leaf and gives every link a spline', () => {
    const geometry = layoutChen(parseProbe('cov-cardinality'), measurer);
    expect(geometry.degenerate).toBe(false);
    expect(geometry.nodes.length).toBeGreaterThan(1);
    expect(geometry.edges.length).toBe(geometry.dot.edges.length);
    expect(geometry.edges.every((e) => e.points.length >= 4)).toBe(true);
  });
});

describe('layoutChen: a link to a group (`{ A, }` resolves "" to the root)', () => {
  // `Bibliotekon#getNodeUid` answers `Cluster.getSpecialPointId` for a group (Bibliotekon.java:134-135), so
  // `SvekEdge`'s constructor calls `getCluster2`, which finds no cluster holding the root and throws
  // `IllegalArgumentException` (SvekEdge.java:219-225, 254-256). `buildImage` catches only
  // `IllegalStateException` (GraphvizImageBuilder.java:260), so the jar crashes (cov-multi-trailing-comma).
  it('throws the IllegalArgumentException the jar crashes on', () => {
    const diagram = parseProbe('cov-multi-trailing-comma');
    expect(() => layoutChen(diagram, new DeterministicMeasurer())).toThrow(
      'IllegalArgumentException: SvekEdge#getCluster2',
    );
  });
});

describe('layoutChen: the pragma lines of getDotStringSkek (net/atmp/CucaDiagram.java:399-415)', () => {
  // The jar's svek-1.dot carries `ratio=0.5;` and `aspect=0.8;` (`!pragma aspect 0,8`, comma replaced).
  it('passes `!pragma ratio` verbatim', () => {
    renderChen(probeSource('cov-pragma-ratio'));
    expect(captured[0]!.ratio).toBe('0.5');
    expect(captured[0]!.aspect).toBeUndefined();
  });

  it('passes `!pragma aspect` with its comma replaced by a dot', () => {
    renderChen(probeSource('cov-pragma-aspect'));
    expect(captured[0]!.aspect).toBe('0.8');
    expect(captured[0]!.ratio).toBeUndefined();
  });
});
