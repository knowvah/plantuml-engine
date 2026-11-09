/**
 * laep T2d: autarkic groups. `CucaDiagramSimplifierActivity#simplify` lays every `INNER_ACTIVITY` out on its own
 * (`GroupMakerActivity`, a nested svek pass) before the parent, and the group becomes an `ACTIVITY` leaf whose image is
 * that result inside an `InnerActivity` frame. The oracles are the jar's `svek-1.dot`/`svek-2.dot` of
 * `activity/fozoxu-26-fibu076` (the cached row) and of probe `lap-inner-brace` (`scripts/oracle-render.sh`, copied to
 * `fixtures/`), and their SVGs.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { GroupType } from '../../../src/core/abel/GroupType.js';
import { LeafType } from '../../../src/core/abel/LeafType.js';
import { setLayoutInputObserver, type DotInputGraph } from '../../../src/core/graph-layout.js';
import { toSvekDot } from '../../../src/core/svek-dot-emit.js';
import { InnerActivity } from '../../../src/core/svek/InnerActivity.js';
import { layoutActivityLegacy } from '../../../src/diagrams/activity-legacy/layout.js';
import { compareStructural, dotInputToStructural, parseSvekDot } from '../../oracle/svek-dot.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { MEASURER, oracleDotOf, parseThroughPreprocessor, rowSource } from '../../helpers/legacy-activity-dot.js';
import { probeSource, renderLegacy, rowDiffs } from '../../helpers/legacy-activity-render.js';

/** Float slack of a 6dp inches string, as the DOT-parity gates allow. */
const SIZE_SLACK = 1e-6 + Number.EPSILON;
const FIXTURES = join(import.meta.dirname, 'fixtures');
const ROW = 'fozoxu-26-fibu076';

/** The graphs `layoutGraph` is handed while `puml` is laid out, in call order. */
function layoutCalls(puml: string) {
  const graphs: DotInputGraph[] = [];
  setLayoutInputObserver(({ graph }) => graphs.push(graph));
  try {
    const diagram = parseThroughPreprocessor(puml);
    return { graphs, diagram, geometry: layoutActivityLegacy(diagram, MEASURER) };
  } finally {
    setLayoutInputObserver(undefined);
  }
}

function pairedWith(graph: DotInputGraph, oracleDot: string) {
  return compareStructural(parseSvekDot(oracleDot), dotInputToStructural(graph));
}

describe('fozoxu-26-fibu076 (a `{` group with toto1 --> toto2)', () => {
  const run = layoutCalls(rowSource('activity', ROW));

  it('calls layoutGraph twice, the inner pass first (the jar writes svek-1.dot for it)', () => {
    expect(run.graphs).toHaveLength(2);
    expect(run.graphs[0]!.nodes).toHaveLength(2);
    expect(run.graphs[1]!.nodes).toHaveLength(2);
    expect(run.graphs[0]!.nodes.map((n) => n.shape)).toEqual(['rounded', 'rounded']);
    expect(run.graphs[1]!.nodes.map((n) => n.shape)).toEqual(['circle', 'rounded']);
  });

  it('pairs call 1 with svek-1.dot: structurally equal, node sizes exact', () => {
    const diff = pairedWith(run.graphs[0]!, oracleDotOf('activity', ROW));

    expect(diff.structurallyEqual, JSON.stringify(diff)).toBe(true);
    expect(diff.maxSizeDeltaIn).toBeLessThanOrEqual(SIZE_SLACK);
  });

  it('pairs call 2 with svek-2.dot: the group is a 0.855903 x 1.597222 in rounded node', () => {
    const svek2 = readFileSync(
      join(import.meta.dirname, '../../../test-results/dot-cache/activity', ROW, 'svek-2.dot'),
      'utf8',
    );
    const diff = pairedWith(run.graphs[1]!, svek2);

    expect(diff.structurallyEqual, JSON.stringify(diff)).toBe(true);
    expect(diff.maxSizeDeltaIn).toBeLessThanOrEqual(SIZE_SLACK);
    const group = run.graphs[1]!.nodes[1]!;
    expect([group.width, group.height]).toEqual([61.625, 115]);
  });

  it('writes no nodesep/ranksep for the nested pass (empty dotStrings) and both for the root', () => {
    const inner = toSvekDot(run.graphs[0]!);
    const outer = toSvekDot(run.graphs[1]!);

    expect(inner).not.toMatch(/nodesep|ranksep/);
    expect(outer).toContain('nodesep=0.277778;');
    expect(outer).toContain('ranksep=0.555556;');
  });

  it('turns the group into an ACTIVITY leaf carrying its InnerActivity image', () => {
    const group = run.diagram.leafs().find((leaf) => leaf.getName() === '##2')!;

    expect(group.isGroup()).toBe(false);
    expect(group.getLeafType()).toBe(LeafType.ACTIVITY);
    expect(group.getSvekImage()).toBeInstanceOf(InnerActivity);
    expect(run.diagram.groups()).toEqual([]);
  });

  it('keeps the start-to-group link and drops the two links wholly inside the group', () => {
    expect(run.geometry.edges.map((e) => [e.link.getEntity1().getName(), e.link.getEntity2().getName()])).toEqual([
      ['start', '##2'],
    ]);
  });

  it('draws the row with 0 diffs', () => {
    expect(rowDiffs('activity', ROW)).toEqual([]);
  });
});

describe('lap-inner-brace (`(*) --> {`, A --> B, `}`, `--> (*)`)', () => {
  const puml = probeSource('lap-inner-brace');
  const run = layoutCalls(puml);
  const oracleDot = (n: number) => readFileSync(join(FIXTURES, `lap-inner-brace.svek-${n}.dot`), 'utf8');

  it('lays the inner group out first, then the parent, each equal to the jar DOT', () => {
    expect(run.graphs).toHaveLength(2);
    for (const [index, graph] of run.graphs.entries()) {
      const diff = pairedWith(graph, oracleDot(index + 1));
      expect(diff.structurallyEqual, JSON.stringify(diff)).toBe(true);
      expect(diff.maxSizeDeltaIn).toBeLessThanOrEqual(SIZE_SLACK);
    }
  });

  it('puts the end circle in the parent pass with no link into it: the jar drops `B --> (*)`', () => {
    const names = run.geometry.nodes.map((n) => n.entity.getName());

    expect(names).toEqual(['start', '##2', 'end']);
    expect(run.geometry.edges).toHaveLength(1);
    expect(run.graphs[1]!.edges).toHaveLength(1);
  });

  it('draws the group as one ACTIVITY image: the jar rect, nested boxes and text, 0 diffs', () => {
    const oracle = readFileSync(join(FIXTURES, 'lap-inner-brace.svg'), 'utf8');

    expect(compareSvg(renderLegacy(puml), oracle, 'deterministic').diffs).toEqual([]);
  });
});

describe('simplify', () => {
  it('is idempotent: laying the diagram out again finds no group left to override', () => {
    const run = layoutCalls(rowSource('activity', ROW));
    const again: DotInputGraph[] = [];
    setLayoutInputObserver(({ graph }) => again.push(graph));
    try {
      layoutActivityLegacy(run.diagram, MEASURER);
    } finally {
      setLayoutInputObserver(undefined);
    }

    expect(again).toHaveLength(1);
    expect(run.diagram.leafs().filter((l) => l.getLeafType() === LeafType.ACTIVITY)).toHaveLength(3);
  });

  it('leaves a partition (PACKAGE) alone: it is not autarkic', () => {
    const run = layoutCalls('@startuml\npartition P {\n(*) --> A\n}\n@enduml');

    expect(run.graphs).toHaveLength(1);
    expect(run.diagram.groups().map((g) => g.getGroupType())).toEqual([GroupType.PACKAGE]);
  });

  it('mirrors the jar crash on an inner activity inside an inner activity (Entity#checkGroup, an error page)', () => {
    expect(() => layoutCalls('@startuml\n(*) --> {\nA --> {\nB --> C\n}\n}\n--> (*)\n@enduml')).toThrow(
      /UnsupportedOperationException: group type INNER_ACTIVITY/,
    );
  });

  it('lays the group of a longer chain out first (probe mid, 0 diffs against the jar): 2 nodes, then 5', () => {
    const run = layoutCalls('@startuml\n(*) --> "A"\n--> {\nB --> C\n}\n--> "D"\n"D" --> (*)\n@enduml');

    expect(run.graphs.map((g) => g.nodes.length)).toEqual([2, 5]);
  });

  it('an empty inner activity is an EntityImageState leaf of the parent pass: one layout call (GroupMakerActivity.java:113-114)', () => {
    const run = layoutCalls('@startuml\n(*) --> {\n}\n--> (*)\n@enduml');

    expect(run.graphs.map((g) => g.nodes.length)).toEqual([3]);
  });
});
