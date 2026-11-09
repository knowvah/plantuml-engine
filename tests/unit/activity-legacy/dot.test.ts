/**
 * laep T2b: the DOT input of the legacy activity engine, against the jar's `svek-1.dot` of cached rows
 * (`test-results/dot-cache/activity/<slug>/svek-1.dot`, `-DPLANTUML_DUMP_DOT`, deterministic text).
 */
import { describe, expect, it } from 'vitest';
import { LeafType } from '../../../src/core/abel/LeafType.js';
import { ShapeType } from '../../../src/core/svek/ShapeType.js';
import { getOrderedLinks } from '../../../src/diagrams/activity-legacy/activity-legacy-links.js';
import { dotShapeOf } from '../../../src/diagrams/activity-legacy/activity-legacy-dot.js';
import { getMinNodeSep, getMinRankSep } from '../../../src/diagrams/activity-legacy/activity-legacy-spacing.js';
import { parseLegacy } from '../../helpers/legacy-leaf-images.js';
import { toSvekDot } from '../../../src/core/svek-dot-emit.js';
import {
  compareRow,
  dotOf,
  oracleDotOf,
  ourDotText,
  parseThroughPreprocessor,
  rowSource,
} from '../../helpers/legacy-activity-dot.js';

/** Float slack of a 6dp inches string, as the parity gates allow. */
const SIZE_SLACK = 1e-6 + Number.EPSILON;

/** The rows checked: the brief's `bokuba-91-poda774`, then one per feature (if, partition, note). */
const ROWS = {
  bar: 'bokuba-91-poda774',
  ifAndNestedPartitions: 'petora-44-nafe514',
  ifAndBackLinks: 'sibipe-68-nagu501',
  partitionsAndNote: 'pileje-51-zubu880',
  notes: 'guzecu-01-didu313',
  twoPartitions: 'cozepi-30-jenu085',
} as const;

describe('DOT input equals the jar svek-1.dot', () => {
  for (const [what, slug] of Object.entries(ROWS)) {
    it(`${slug} (${what}): structurally equal, node sizes exact`, () => {
      const diff = compareRow('activity', slug);

      expect(diff.structurallyEqual, JSON.stringify(diff)).toBe(true);
      expect(diff.maxSizeDeltaIn).toBeLessThanOrEqual(SIZE_SLACK);
    });
  }

  it('bokuba-91-poda774 writes the activity separators and the five nodes of the oracle', () => {
    const text = toSvekDot(dotOf(parseThroughPreprocessor(rowSource('activity', 'bokuba-91-poda774'))).graph);

    expect(text).toContain('nodesep=0.277778;\nranksep=0.555556;\nremincross=true;\nsearchsize=500;');
    expect(text.match(/shape=circle,label="",width=0.277778,height=0.277778/g)).toHaveLength(1);
    expect(text).toContain('shape=rect,style=rounded,label="",width=1.593403,height=0.444444');
    expect(text).toContain('shape=rect,label="",width=1.111111,height=0.111111');
    expect(text).toContain('shape=circle,label="",width=0.305556,height=0.305556');
    expect(oracleDotOf('activity', 'bokuba-91-poda774')).toContain('nodesep=0.277778;\nranksep=0.555556;');
  });
});

describe('graph attributes', () => {
  it('left to right direction writes rankdir=LR and swaps the bar of lap-ltr (jar svek-1.dot of the probe)', () => {
    const text = ourDotText('@startuml\nleft to right direction\n(*) --> A\nA --> B\nB --> (*)\n@enduml');

    expect(text).toContain('nodesep=0.277778;\nranksep=0.555556;\nremincross=true;\nsearchsize=500;\nrankdir=LR;');
    expect(text).toContain('shape=rect,style=rounded,label="",width=0.389236,height=0.444444');
    expect(text.match(/shape=rect,style=rounded/g)).toHaveLength(2);
  });

  it('top to bottom writes no rankdir', () => {
    expect(ourDotText('@startuml\n(*) --> A\n@enduml')).not.toContain('rankdir');
  });

  it('getMinNodeSep and getMinRankSep are the ACTIVITY floors (DotStringFactory.java:243-258)', () => {
    expect(getMinNodeSep()).toBe(20);
    expect(getMinRankSep()).toBe(40);
  });

  it('a non-zero skinparam nodesep and ranksep replace the floor outright', () => {
    const text = ourDotText('@startuml\n(*) --> A\n@enduml', {
      skinparam: new Map([
        ['nodesep', '50'],
        ['ranksep', '10'],
      ]),
    });

    expect(text).toContain('nodesep=0.694444;\nranksep=0.138889;');
  });

  it('skinparam linetype ortho writes splines=ortho and forcelabels, and moves the label to an xlabel', () => {
    const dot = dotOf(
      parseLegacy('@startuml\n(*) --> [go] A\n@enduml', { skinparam: new Map([['linetype', 'ortho']]) }),
    );

    expect(dot.graph.linetype).toBe('ortho');
    expect(dot.graph.edges[0]!.attributes?.xlabel).toBe('go');
    expect(dot.graph.edges[0]!.attributes?.label).toBeUndefined();
  });
});

describe('nodes and edges', () => {
  it('an edge label is the (int) table of the label block: [true] is 20x13 (petora-44-nafe514)', () => {
    const dot = dotOf(parseThroughPreprocessor(rowSource('activity', 'petora-44-nafe514')));
    const labelled = dot.graph.edges.find((e) => e.attributes?.labelWidth === 20);

    expect(labelled?.attributes?.labelHeight).toBe(13);
  });

  it('the condition of an if is the head label: "Some Test" is 53x11', () => {
    const dot = dotOf(parseThroughPreprocessor(rowSource('activity', 'petora-44-nafe514')));
    const head = dot.graph.edges.find((e) => e.attributes?.headLabelWidth !== undefined);

    expect([head?.attributes?.headLabelWidth, head?.attributes?.headLabelHeight]).toEqual([53, 11]);
  });

  it('a note link has minlen 0 and a note is a plain rect (guzecu-01-didu313)', () => {
    const dot = dotOf(parseThroughPreprocessor(rowSource('activity', 'guzecu-01-didu313')));
    const notes = dot.nodes.filter((n) => n.entity.getLeafType() === LeafType.NOTE);

    // The oracle's `svek-1.dot` writes 1.303906x0.319444 and 0.973264x0.500000 inches (sh0008, sh0010).
    expect(notes.map((n) => [Number((n.width / 72).toFixed(6)), Number((n.height / 72).toFixed(6))])).toEqual([
      [1.303906, 0.319444],
      [0.973264, 0.5],
    ]);
    expect(dot.graph.edges.filter((e) => e.attributes?.minLen === 0)).toHaveLength(2);
  });

  it('a -*-> link is constraint=false (sibipe-68-nagu501)', () => {
    const dot = dotOf(parseThroughPreprocessor(rowSource('activity', 'sibipe-68-nagu501')));

    expect(dot.graph.edges.filter((e) => e.attributes?.constraint === false)).toHaveLength(2);
  });

  it('a partition is a cluster with its title table: P1 is 17x9, nested partitions nest', () => {
    const dot = dotOf(parseThroughPreprocessor(rowSource('activity', 'cozepi-30-jenu085')));
    const first = dot.graph.clusters![0]!;

    expect([first.titleTableWidth, first.titleTableHeight, first.innerMarginLevels]).toEqual([17, 9, 1]);
    expect(dot.graph.clusters).toHaveLength(2);
  });

  it('a nested partition names its parent cluster (petora-44-nafe514)', () => {
    const dot = dotOf(parseThroughPreprocessor(rowSource('activity', 'petora-44-nafe514')));
    const [outer, inner] = dot.graph.clusters!;

    expect(outer!.parentId).toBeUndefined();
    expect(inner!.parentId).toBe(outer!.id);
  });
});

describe('getOrderedLinks (CucaDiagramFileMakerSvek.java:90-114)', () => {
  it('groups the links of the same two entities after the first of them, either direction', () => {
    const diagram = parseLegacy('@startuml\n(*) --> A\nA --> B\nB --> A\nB --> (*)\n@enduml');

    const names = getOrderedLinks(diagram).map((l) => `${l.getEntity1().getName()}>${l.getEntity2().getName()}`);

    expect(names).toEqual(['start>A', 'A>B', 'B>A', 'B>end']);
  });

  it('moves a later link next to an earlier one it duplicates', () => {
    const diagram = parseLegacy('@startuml\nA --> B\nB --> C\nB --> A\n@enduml');

    const names = getOrderedLinks(diagram).map((l) => `${l.getEntity1().getName()}>${l.getEntity2().getName()}`);

    expect(names).toEqual(['A>B', 'B>A', 'B>C']);
  });
});

describe('unported seams throw naming their owner', () => {
  it('dotShapeOf refuses a shape SvekNode does not write', () => {
    expect(() => dotShapeOf(ShapeType.PORT)).toThrow('unported: SvekNode shape PORT');
    expect(dotShapeOf(ShapeType.OCTAGON)).toBe('octagon');
  });

  it('an empty partition is muted to EMPTY_PACKAGE and printed as a node, not a cluster (GraphvizImageBuilder.java:416-418)', () => {
    const dot = dotOf(parseLegacy('@startuml\npartition P {\n}\n(*) --> A\n@enduml'));

    expect(dot.clusters).toEqual([]);
    expect(dot.nodes.map((n) => n.entity.getName())).toContain('P');
  });
});
