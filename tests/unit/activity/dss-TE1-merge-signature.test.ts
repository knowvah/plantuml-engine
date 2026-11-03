import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { resolveTheme } from '../../../src/core/theme.js';
import { defaultEdgeLook } from '../../../src/diagrams/activity/activity-edge-look.js';
import type { ActivityEdgeGeo, ActivityNodeGeo } from '../../../src/diagrams/activity/activity-geometry.types.js';
import { renderIfMerge } from '../../../src/diagrams/activity/activity-renderer-if-shapes.js';
import { withActivityMeasurer } from '../../../src/diagrams/activity/activity-string-bounder.js';
import { carriesArrowRainbow } from '../../../src/diagrams/activity/layout/merge-rainbow.js';
import type { Tile } from '../../../src/diagrams/activity/tiles/tile.js';
import { renderSync } from '../../../src/index.js';
import { tagsOf } from '../../helpers/svg-tags.js';
import { firstScopeDiffs } from '../../oracle/svg-conformance/diagram-style-scope.js';

/**
 * dss TE1: `fork ... end merge` reads the `activity` signature, not `arrow`. The jar's values are the rows below
 * (`tests/fixtures/diagram-style-scope/activity__merge-*`); the Java is `ParallelBuilderMerge.java:80-82,96-111`
 * (`getStyleSignature()` = `AbstractParallelFtilesBuilder.java:73-75`), `LinkRendering.java:77-82` (`getRainbow(def)`),
 * `FtileBox.java:158` (a box's in-link carries the `arrow` rainbow), `AbstractFtile.java:84-90` (every other tile: none).
 */
const DIFF_LIMIT = 500;
const ARROW = '#00A';
const ACTIVITY = '#0A0';
const ROOT_ARROW_STYLE = ['<style>', 'root { LineColor #0A0 }', 'arrow { LineColor #00A }', '</style>'];
const ARROWHEAD_POINTS = 8;
const RHOMBUS_POINTS = 10;

function render(lines: readonly string[]): string {
  return renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });
}

function mergeOf(...branches: readonly (readonly string[])[]): string[] {
  const body = branches.flatMap((branch, i) => (i === 0 ? ['fork', ...branch] : ['fork again', ...branch]));
  return ['start', ...body, 'end merge', 'stop'];
}

const strokes = (svg: string): (string | undefined)[] => tagsOf(svg, 'line').map((t) => t['stroke']);

const arrowHeads = (svg: string): (string | undefined)[] =>
  tagsOf(svg, 'polygon')
    .filter((t) => t['points']!.split(',').length === ARROWHEAD_POINTS)
    .map((t) => t['fill']);

const rhombus = (svg: string): { fill?: string; stroke?: string } => {
  const t = tagsOf(svg, 'polygon').find((p) => p['points']!.split(',').length === RHOMBUS_POINTS)!;
  return {
    ...(t['fill'] === undefined ? {} : { fill: t['fill'] }),
    ...(t['stroke'] === undefined ? {} : { stroke: t['stroke'] }),
  };
};

describe('dss TE1: a merge connector without a rainbow of its own reads the activity signature', () => {
  it('in-connectors of a box branch keep the arrow rainbow (FtileBox.java:158); out-connectors and heads take activity (jar merge-root-arrow)', () => {
    const svg = render([...ROOT_ARROW_STYLE, ...mergeOf([':a;'], [':b;'])]);
    // bars -> branches, then each branch -> rhombus (horizontal + vertical), then the arrows outside the fork.
    expect(strokes(svg)).toEqual([ARROW, ARROW, ACTIVITY, ACTIVITY, ACTIVITY, ACTIVITY, ARROW, ARROW]);
    expect(arrowHeads(svg)).toEqual([ARROW, ARROW, ACTIVITY, ACTIVITY, ARROW, ARROW]);
  });

  it('activity { LineColor } reaches the out-connectors and not the arrows (jar merge-activity)', () => {
    const svg = render(['<style>', 'activity { LineColor #0AA }', '</style>', ...mergeOf([':a;'], [':b;'])]);
    expect(strokes(svg)).toEqual(['#181818', '#181818', '#0AA', '#0AA', '#0AA', '#0AA', '#181818', '#181818']);
  });

  it('arrow { LineColor } alone reaches only the in-connectors and the arrows outside (jar merge-arrow-font)', () => {
    const svg = render(['<style>', 'arrow { LineColor #00A }', '</style>', ...mergeOf([':a;'], [':b;'])]);
    expect(strokes(svg)).toEqual([ARROW, ARROW, '#181818', '#181818', '#181818', '#181818', ARROW, ARROW]);
  });

  it('skinparam ArrowColor does not reach the out-connectors (jar merge-skin-arrow)', () => {
    const svg = render(['skinparam ArrowColor #FF0000', ...mergeOf([':a;'], [':b;'])]);
    expect(strokes(svg)).toEqual(['#F00', '#F00', '#181818', '#181818', '#181818', '#181818', '#F00', '#F00']);
  });

  it('skinparam ActivityBorderColor reaches them (jar merge-skin-activity-border)', () => {
    const svg = render(['skinparam ActivityBorderColor #FF0000', ...mergeOf([':a;'], [':b;'])]);
    expect(strokes(svg).slice(2, 6)).toEqual(['#F00', '#F00', '#F00', '#F00']);
  });

  it('a first tile that is not an action box defaults its in-connector to activity too (jar merge-first-if)', () => {
    const svg = render([...ROOT_ARROW_STYLE, ...mergeOf(['if (c) then (y)', ':x;', 'endif'], [':b;'])]);
    expect(strokes(svg)).toContain(ACTIVITY);
    expect(firstScopeDiffs('activity__merge-first-if', DIFF_LIMIT)).toEqual([]);
  });
});

describe('dss TE1: an inline colour wins over the default, ParallelBuilderMerge.java:82,111', () => {
  it('the arrow before a branch colours its in-connector, the one before end merge its out-connector (jar merge-inline)', () => {
    const svg = render([...ROOT_ARROW_STYLE, ...mergeOf([':a;'], ['-[#FF00FF]->', ':b;', '-[#00FFFF]->'])]);
    expect(strokes(svg)).toEqual([ARROW, '#F0F', ACTIVITY, ACTIVITY, '#0FF', '#0FF', ARROW, ARROW]);
    expect(arrowHeads(svg)).toEqual([ARROW, '#F0F', ACTIVITY, '#0FF', ARROW, ARROW]);
  });

  it('wins over an activity LineColor as well (jar merge-activity-inline)', () => {
    const svg = render([
      '<style>',
      'activity { LineColor #0AA }',
      '</style>',
      ...mergeOf([':a;'], ['-[#FF00FF]->', ':b;', '-[#00FFFF]->']),
    ]);
    expect(strokes(svg).slice(0, 6)).toEqual(['#181818', '#F0F', '#0AA', '#0AA', '#0FF', '#0FF']);
  });

  it('a label with no colour before a box leaves the rainbow empty, so activity applies (FtileDecorateIn)', () => {
    const svg = render([...ROOT_ARROW_STYLE, ...mergeOf(['-> hello;', ':a;'], [':b;'])]);
    expect(strokes(svg).slice(0, 2)).toEqual([ACTIVITY, ARROW]);
  });
});

describe('dss TE1: the closing rhombus reads the activity signature, ParallelBuilderMerge.java:96-99', () => {
  it('activity LineColor and BackgroundColor paint it; diamond does not (jar merge-diamond)', () => {
    const own = render([
      '<style>',
      'diamond { LineColor #A50 ; BackgroundColor #5AF }',
      '</style>',
      ...mergeOf([':a;']),
    ]);
    expect(rhombus(own)).toEqual({ fill: '#F1F1F1', stroke: '#181818' });
    const act = render([
      '<style>',
      'activity { LineColor #0AA ; BackgroundColor #FEE }',
      '</style>',
      ...mergeOf([':a;']),
    ]);
    expect(rhombus(act)).toEqual({ fill: '#FEE', stroke: '#0AA' });
  });

  it('an if rhombus keeps reading diamond (FtileFactoryDelegator.java:79-80)', () => {
    const svg = render([
      '<style>',
      'diamond { LineColor #A50 ; BackgroundColor #5AF }',
      '</style>',
      'start',
      'if (c) then (y)',
      ':x;',
      'endif',
      'stop',
    ]);
    expect(tagsOf(svg, 'polygon').some((p) => p['fill'] === '#5AF' && p['stroke'] === '#A50')).toBe(true);
  });

  it('renderIfMerge reads the node tag', () => {
    const theme = withActivityMeasurer(resolveTheme(), new DeterministicMeasurer());
    const themed = {
      ...theme,
      colors: {
        ...theme.colors,
        elements: { ...theme.colors.elements, activity: { border: '#0AA' }, diamond: { border: '#A50' } },
      },
    };
    const node: ActivityNodeGeo = { id: 'n', kind: 'if-merge', x: 0, y: 0, width: 24, height: 24 };
    expect(renderIfMerge(node, themed)).toContain('#A50');
    expect(renderIfMerge({ ...node, diamondSName: 'activity' }, themed)).toContain('#0AA');
  });
});

describe('dss TE1: defaultEdgeLook', () => {
  const theme = withActivityMeasurer(
    {
      ...resolveTheme(),
      colors: {
        ...resolveTheme().colors,
        arrow: '#111111',
        arrowHead: '#222222',
        elements: { activity: { border: '#333333' }, arrow: { border: '#444444' } },
      },
    },
    new DeterministicMeasurer(),
  );
  const edge: ActivityEdgeGeo = { points: [] };

  it('an untagged edge is the arrow look: line from arrow, head from ArrowHeadColor', () => {
    expect(defaultEdgeLook(theme, edge)).toMatchObject({ line: '#444444', head: '#222222' });
  });

  it('an activity-tagged edge draws line and head in the activity line (Rainbow.java:84-90, no HeadColor)', () => {
    expect(defaultEdgeLook(theme, { ...edge, lineSName: 'activity' })).toMatchObject({
      line: '#333333',
      head: '#333333',
    });
  });
});

describe('dss TE1: carriesArrowRainbow, which tile hands the arrow rainbow to the merge', () => {
  const leaf = (kind: string, extra: Partial<Tile> = {}): Tile => ({
    kind,
    width: 1,
    height: 1,
    getCoord: () => ({ x: 0, y: 0 }),
    hasPointOut: () => true,
    ...extra,
  });
  const wrap = (kind: string, ...children: Tile[]): Tile => ({ ...leaf(kind), children }) as unknown as Tile;

  it('an action box does, FtileBox.java:158', () => {
    expect(carriesArrowRainbow(leaf('gtile-action'))).toBe(true);
  });

  it('a note, a group and a list hand over their first child, FtileWithNoteOpale.java:251, FtileGroup.java:124', () => {
    const box = leaf('gtile-action');
    expect(carriesArrowRainbow(wrap('gtile-top-down', box))).toBe(true);
    expect(carriesArrowRainbow(wrap('gtile-note-opale', box))).toBe(true);
    expect(carriesArrowRainbow(wrap('gtile-with-notes', box))).toBe(true);
    expect(carriesArrowRainbow(wrap('gtile-group', wrap('gtile-top-down', box)))).toBe(true);
    expect(carriesArrowRainbow(wrap('gtile-partition', wrap('gtile-top-down', box)))).toBe(true);
  });

  it('an empty list, an if, a loop and a label do not, AbstractFtile.java:84-86', () => {
    expect(carriesArrowRainbow(wrap('gtile-top-down'))).toBe(false);
    expect(carriesArrowRainbow(undefined)).toBe(false);
    for (const kind of ['gtile-if-down', 'gtile-while', 'gtile-repeat', 'gtile-label', 'gtile-note', 'gtile-stop']) {
      expect(carriesArrowRainbow(leaf(kind))).toBe(false);
    }
  });

  it('an inline arrow ahead of the box replaces it, InstructionList.java:150-151', () => {
    expect(carriesArrowRainbow(leaf('gtile-action', { inLabel: { label: 'x' } }))).toBe(false);
    expect(carriesArrowRainbow(wrap('gtile-top-down', leaf('gtile-action', { inLabel: { label: '' } })))).toBe(false);
  });

  it('a killed box does not, FtileKilled wraps it last (InstructionSimple.java:109-113)', () => {
    expect(carriesArrowRainbow(leaf('gtile-action', { killed: true }))).toBe(false);
    expect(carriesArrowRainbow(wrap('gtile-note-opale', leaf('gtile-action')))).toBe(true);
    expect(carriesArrowRainbow({ ...wrap('gtile-note-opale', leaf('gtile-action')), killed: true })).toBe(false);
  });
});

describe('dss TE1: authored rows against their jar oracles', () => {
  it.each([
    'root-arrow',
    'after',
    'inline',
    'kill',
    'activity',
    'activity-inline',
    'diamond',
    'arrow-font',
    'cascade',
    'split',
    'fork-label',
    'skin-arrow',
    'skin-activity-border',
    'skin-activity-back',
    'skin-diamond-border',
    'skin-diamond-back',
    'skin-head',
    'first-if',
    'first-empty',
    'first-group',
    'first-killed',
    'first-while',
    'first-repeat',
    'first-label',
    'lanes',
    'thickness',
    'three',
    'gradient',
    'transparent',
  ])('activity__merge-%s is identical to the jar', (kind) => {
    expect(firstScopeDiffs(`activity__merge-${kind}`, DIFF_LIMIT)).toEqual([]);
  });
});
