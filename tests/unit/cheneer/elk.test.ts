/**
 * `!pragma layout elk` on a Chen diagram (ceep T3d): `CucaDiagram.java:478-479` swaps in `CucaDiagramFileMakerElk`,
 * which lays the leaves out with ELK and draws a `MyElkDrawing`. The oracles are the jar's renders of the `cov-elk*`
 * fixtures (`tests/fixtures/cheneer/<slug>.svg`); elkjs and Java ELK agree on every one of them.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { ColorType } from '../../../src/core/abel/ColorType.js';
import { ELK_RENDER_SYNC_UNSUPPORTED } from '../../../src/core/elk/layout-services.js';
import { setLayoutInputObserver } from '../../../src/core/graph-layout.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { withJarCompatibleStyleInput } from '../../../src/core/internal-render-options.js';
import { MeasurerStringBounder } from '../../../src/core/measurer-bounder.js';
import { loadElk, renderSync, type ElkBackend } from '../../../src/index.js';
import { ChenEerElkAdapter } from '../../../src/diagrams/cheneer/cheneer-elk-adapter.js';
import { chenPlugin } from '../../../src/diagrams/cheneer/index.js';
import { layoutChen } from '../../../src/diagrams/cheneer/layout.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { elkProbeSlugs, oracleSvg, parseProbe, probeSource } from './oracle-fixtures.js';

const SURVEY_FILENAME = 'in.puml';
const measurer = new DeterministicMeasurer();
let elk: ElkBackend;

beforeAll(async () => {
  elk = await loadElk();
});

/** Our render of `puml`, with the graphs the DOT seam was handed (none under ELK). */
function renderObserved(puml: string): { svg: string; graphs: unknown[] } {
  const graphs: unknown[] = [];
  setLayoutInputObserver(({ graph }) => graphs.push(graph));
  try {
    const svg = renderSync(puml, withJarCompatibleStyleInput({ measurer, filename: SURVEY_FILENAME, elk }));
    return { svg, graphs };
  } finally {
    setLayoutInputObserver(undefined);
  }
}

describe('elk: the fixtures the jar laid out with ELK', () => {
  it('lists the eight fixtures', () => {
    expect(elkProbeSlugs()).toEqual([
      'cov-elk',
      'cov-elk-card',
      'cov-elk-empty',
      'cov-elk-one',
      'cov-elk-rankdir',
      'cov-elk-self',
      'cov-elk-style',
      'cov-elk-sub',
    ]);
  });

  it.each(elkProbeSlugs())('%s has 0 diffs and never reaches the DOT seam', (slug) => {
    const { svg, graphs } = renderObserved(probeSource(slug));
    expect(graphs).toEqual([]);
    expect(compareSvg(svg, oracleSvg(slug), 'deterministic').diffs).toEqual([]);
  });

  it.each([
    ['cov-elk', 'width="141px" height="144px"'],
    ['cov-elk-one', 'width="55px" height="120px"'],
    ['cov-elk-empty', 'width="26px" height="26px"'],
    ['cov-elk-card', 'width="166px" height="144px"'],
    ['cov-elk-sub', 'width="75px" height="273px"'],
    ['cov-elk-self', 'width="106px" height="146px"'],
    ['cov-elk-style', 'width="106px" height="207px"'],
  ])('%s is the jar canvas', (slug, canvas) => {
    expect(renderObserved(probeSource(slug)).svg).toContain(canvas);
  });

  it('draws an edge as straight <line> legs, as MyElkEdge does, not as a dot spline', () => {
    const { svg } = renderObserved(probeSource('cov-elk-card'));
    expect(svg.match(/<line /g)).toHaveLength(10);
    expect(svg).not.toContain('<path');
  });

  it('lays rankdir out the same as the default: the jar ignores it under ELK', () => {
    const rankdir = renderObserved(probeSource('cov-elk-rankdir')).svg;
    expect(rankdir.replace(/<\?plantuml-src [^?]*\?>/, '')).toBe(
      renderObserved(probeSource('cov-elk')).svg.replace(/<\?plantuml-src [^?]*\?>/, ''),
    );
  });
});

describe('elk: a diagram that asks for ELK never falls back to dot-engine', () => {
  it('reports requiresElk from the pragma', () => {
    expect(chenPlugin.requiresElk?.(parseProbe('cov-elk'))).toBe(true);
    expect(chenPlugin.requiresElk?.(parseProbe('cov-entity-empty'))).toBe(false);
  });

  it('throws without a backend instead of laying out through dot-engine', () => {
    const graphs: unknown[] = [];
    setLayoutInputObserver(({ graph }) => graphs.push(graph));
    try {
      expect(() => layoutChen(parseProbe('cov-elk'), measurer)).toThrow(ELK_RENDER_SYNC_UNSUPPORTED);
    } finally {
      setLayoutInputObserver(undefined);
    }
    expect(graphs).toEqual([]);
  });

  it('refuses renderSync without options.elk', () => {
    const svg = renderSync(
      probeSource('cov-elk'),
      withJarCompatibleStyleInput({ measurer, filename: SURVEY_FILENAME }),
    );
    expect(svg).toContain('background:#000000');
  });
});

describe('elk: ChenEerElkAdapter', () => {
  function adapterOf(slug: string): ChenEerElkAdapter {
    return new ChenEerElkAdapter(parseProbe(slug), new MeasurerStringBounder(measurer));
  }

  it('names leaves by uid, in creation order, all in the root group', () => {
    const adapter = adapterOf('cov-elk');
    const leafs = adapter.leafs();
    expect(leafs).toHaveLength(3);
    expect(leafs.map((leaf) => adapter.getParentContainer(leaf))).toEqual(['', '', '']);
    expect(adapter.getChildrenGroups(adapter.getRootGroup())).toEqual([]);
  });

  it('names links by index and answers each from its Link', () => {
    const adapter = adapterOf('cov-elk-card');
    expect(adapter.getLinks()).toEqual(['link0', 'link1', 'link2', 'link3']);
    expect(adapter.getQuantifier1('link0')).toBeNull();
    expect(adapter.getRole2('link0')).toBeNull();
    expect(adapter.getQuantifier('link0', 1, new MeasurerStringBounder(measurer))).toBeNull();
    expect(adapter.getRoleLabel('link0', 2, new MeasurerStringBounder(measurer))).toBeNull();
    expect(adapter.isInvis('link0')).toBe(false);
    expect(adapter.getType('link2').getStyle().isNormal()).toBe(false);
    expect(adapter.getType('link1').getStyle().isNormal()).toBe(true);
  });

  it('colours an arrow from the link, else from the classDiagram arrow style', () => {
    const adapter = adapterOf('cov-elk-card');
    expect(adapter.getLinkColors('link1')?.getColor(ColorType.ARROW, ColorType.LINE)).toBeNull();
    expect(adapter.getLinkColors('link2')?.getColor(ColorType.ARROW, ColorType.LINE)).toBe('#0000FF');
    expect(adapter.getArrowStyle('link0').lineColor).toBe('#181818');
  });

  it('refuses every group member: Chen opens no group', () => {
    const adapter = adapterOf('cov-elk');
    expect(() => adapter.isEmpty('g')).toThrow('Chen opens no group');
    expect(() => adapter.getGroupType('g')).toThrow('Chen opens no group');
    expect(() => adapter.groupLeafs('g')).toThrow('Chen opens no group');
    expect(() => adapter.getUSymbol('g')).toThrow('Chen opens no group');
    expect(() => adapter.packageStyle()).toThrow('Chen opens no group');
  });

  it('rejects an unknown id', () => {
    const adapter = adapterOf('cov-elk');
    expect(() => adapter.isRemoved('nope')).toThrow('unknown entity nope');
    expect(() => adapter.getType('nope')).toThrow('unknown link nope');
  });
});
