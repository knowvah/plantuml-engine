import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compositeBucketOf, ELEMENT_SIGNATURES } from '../../../src/core/style-element-scope.js';
import { resolveTheme, type Theme } from '../../../src/core/theme.js';
import type { ElementColors } from '../../../src/core/theme-graph-colors.js';
import { renderBar } from '../../../src/diagrams/activity/activity-renderer-bars.js';
import { renderComposite } from '../../../src/diagrams/activity/activity-renderer-composite.js';
import { diamondColors } from '../../../src/diagrams/activity/activity-renderer-if-shapes.js';
import { noteFillOf } from '../../../src/diagrams/activity/activity-renderer-note-shapes.js';
import { actColors } from '../../../src/diagrams/activity/activity-renderer-shapes.js';
import { renderSpot } from '../../../src/diagrams/activity/activity-renderer-terminals.js';
import type { ActivityNodeGeo } from '../../../src/diagrams/activity/activity-geometry.types.js';
import { withActivityMeasurer } from '../../../src/diagrams/activity/activity-string-bounder.js';
import { renderSync } from '../../../src/index.js';
import { firstScopeDiffs } from '../../oracle/svg-conformance/diagram-style-scope.js';

/**
 * dss T3d: the activity readers take the resolved `<signature>` colour T2a wrote to `theme.colors.elements`, under the
 * inline-colour tier and over the flat tiers. Signatures: `FtileBox.java:98`, `FtileBlackBlock.java:98`,
 * `FtileFactoryDelegator.java:79-80`, `FtileWithNoteOpale.java:89`, `VCompactFactory.java:105`, `FtileGroup.java:89-92`.
 * A row's expected value is its jar oracle, `tests/fixtures/diagram-style-scope/<row>.svg`.
 */
const SCOPED = '#ABCDEF';
const FLAT = '#123456';
const INLINE = '#F00';
const DIFF_LIMIT = 500;

function themeWith(
  elements: Partial<Record<string, ElementColors>>,
  activity?: NonNullable<Theme['colors']['graph']['activity']>,
): Theme {
  const base = resolveTheme();
  const graph = activity === undefined ? base.colors.graph : { ...base.colors.graph, activity };
  const theme = { ...base, colors: { ...base.colors, elements: { ...base.colors.elements, ...elements }, graph } };
  return withActivityMeasurer(theme, new DeterministicMeasurer());
}

function geo(kind: string, extra: Partial<ActivityNodeGeo> = {}): ActivityNodeGeo {
  return { id: 'n', kind, x: 0, y: 0, width: 30, height: 20, ...extra };
}

/** The value of `fill` on the first element of `tag`. */
function firstFill(svg: string, tag: string): string | undefined {
  return new RegExp(`<${tag}[^>]*?fill="([^"]*)"`).exec(svg)?.[1];
}

describe('dss T3d: each site reads its bucket under the inline tier', () => {
  it('site 1: action box, FtileBox.java:98,165', () => {
    expect(actColors(themeWith({})).nodeFill).toBe(resolveTheme().colors.nodeBackground);
    const flat = themeWith({}, { background: FLAT });
    expect(actColors(flat).nodeFill).toBe(FLAT);
    const scoped = themeWith({ activity: { background: SCOPED } }, { background: FLAT });
    expect(actColors(scoped).nodeFill).toBe(SCOPED);
  });

  it('site 2: fork bar, FtileBlackBlock.java:98,105-108, fill and stroke alike', () => {
    const scoped = themeWith({ activitybar: { background: SCOPED } }, { barColor: FLAT });
    expect(actColors(scoped).barFill).toBe(SCOPED);
    expect(actColors(themeWith({}, { barColor: FLAT })).barFill).toBe(FLAT);
    const svg = renderBar(geo('fork'), scoped);
    expect(firstFill(svg, 'rect')).toBe(SCOPED);
    expect(/stroke="([^"]*)"/.exec(svg)?.[1]).toBe(SCOPED);
  });

  it('site 3: diamond, FtileFactoryDelegator.java:79-80', () => {
    const scoped = themeWith({ diamond: { background: SCOPED } }, { diamondBackground: FLAT, background: FLAT });
    expect(diamondColors(scoped.colors.graph.activity, scoped).fill).toBe(SCOPED);
    const flat = themeWith({}, { diamondBackground: FLAT });
    expect(diamondColors(flat.colors.graph.activity, flat).fill).toBe(FLAT);
  });

  it('site 4: note, FtileWithNoteOpale.java:89,137-140, a note colour above the bucket', () => {
    const scoped = themeWith({ note: { background: SCOPED } });
    expect(noteFillOf(geo('note'), scoped)).toBe(SCOPED);
    expect(noteFillOf(geo('note', { color: INLINE }), scoped)).toBe(INLINE);
    expect(noteFillOf(geo('note'), themeWith({}))).toBe(resolveTheme().colors.noteBackground);
  });

  it('site 5: spot, VCompactFactory.java:105, FtileCircleSpot.java:102-103, its colour above the bucket', () => {
    const scoped = themeWith({ 'circle.spot': { background: SCOPED } });
    expect(firstFill(renderSpot(geo('spot'), scoped), 'ellipse')).toBe(SCOPED);
    expect(firstFill(renderSpot(geo('spot', { color: INLINE }), scoped), 'ellipse')).toBe(INLINE);
    expect(firstFill(renderSpot(geo('spot'), themeWith({})), 'ellipse')).toBe('#F1F1F1');
  });

  it('site 6: frame back, FtileGroup.java:101, the command colour above the bucket', () => {
    const theme = themeWith({ [compositeBucketOf('partition')]: { background: SCOPED } });
    expect(firstFill(renderComposite(geo('partition'), theme), 'rect')).toBe(SCOPED);
    expect(firstFill(renderComposite(geo('partition', { color: INLINE }), theme), 'rect')).toBe(INLINE);
    const group = themeWith({ [compositeBucketOf('group')]: { background: SCOPED } });
    expect(firstFill(renderComposite(geo('group'), group), 'rect')).toBe(SCOPED);
    expect(firstFill(renderComposite(geo('partition'), group), 'rect')).toBe('none');
  });

  it('site 7: frame title, FtileGroup.java:99,104-108', () => {
    const theme = themeWith({ [compositeBucketOf('partition')]: { font: '#00B' } });
    const svg = renderComposite(geo('partition', { label: 'P' }), theme);
    expect(firstFill(svg, 'text')).toBe('#00B');
  });
});

function render(lines: readonly string[]): string {
  return renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });
}

function tagsOf(svg: string, tag: string): readonly string[] {
  return svg.match(new RegExp(`<${tag}[^>]*>`, 'g')) ?? [];
}

describe('dss T3d: what a value paints, jar oracles on the same sources', () => {
  const BOXES = ['start', ':a;', 'if (c) then (y)', ':b;', 'endif', 'fork', ':e;', 'fork again', ':f;', 'end fork'];
  const STYLED = (body: string): readonly string[] => ['<style>', body, '</style>'];

  it('BackgroundColor transparent: fill none on every element, SvgGraphics.java:517-525,540', () => {
    const svg = render([
      ...STYLED('activityDiagram { BackgroundColor transparent }'),
      ...BOXES,
      'note left: n',
      'stop',
    ]);
    expect(firstFill(svg, 'ellipse')).toBe('none');
    expect(svg).not.toContain('fill-opacity');
    const bar = tagsOf(svg, 'rect').find((t) => t.includes('rx="2.5"'));
    expect(bar).toContain('fill="none"');
    expect(bar).toMatch(/stroke(:|=")none/);
  });

  it('BackgroundColor gradient: the bar and the circles reach it, FtileBlackBlock.java:105-106, CircleStart.java:72-82', () => {
    const svg = render([...STYLED('activityDiagram { BackgroundColor #AAAAAA-#BBBBBB }'), ...BOXES, 'stop']);
    const bar = tagsOf(svg, 'rect').find((t) => t.includes('rx="2.5"'));
    expect(bar).toMatch(/fill="url\(#/);
    expect(firstFill(svg, 'ellipse')).toMatch(/^url\(#/);
    expect(svg).toContain('<linearGradient');
  });

  it('FontColor transparent draws no text, DriverTextSvg.java:92-93 (jar: no text on the page)', () => {
    const svg = render([
      ...STYLED('activityDiagram { FontColor transparent }'),
      'start',
      ':a;',
      'partition P {',
      ':c;',
      '}',
      'stop',
    ]);
    expect(tagsOf(svg, 'text')).toEqual([]);
  });

  it('the spot glyph takes its merged FontColor, FtileCircleSpot.java:75: jar #00B', () => {
    const svg = render([...STYLED('element { FontColor #0000BB }'), 'start', '(A)', 'stop']);
    expect(firstFill(svg, 'path')).toBe('#00B');
  });
});

describe('dss T3d: the stereotype tier, FtileBox.java:146, CommandPartition3.java:160', () => {
  const STYLE = [
    '<style>',
    '.foo { BackgroundColor #AAAAAA',
    'FontColor #BBBBBB }',
    'activity { BackgroundColor #123456 }',
    '</style>',
  ];

  it('beats the merged value on a box: jar #AAA, #BBB; a box without it #123456', () => {
    const svg = render([...STYLE, 'start', ':a; <<foo>>', ':b;', 'stop']);
    expect(tagsOf(svg, 'rect').map((t) => /fill="([^"]*)"/.exec(t)?.[1])).toEqual(['#AAA', '#123456']);
    expect(firstFill(svg, 'text')).toBe('#BBB');
  });

  it('beats the merged value on a frame: jar #AAA, #BBB', () => {
    const svg = render([...STYLE, 'start', 'partition P <<foo>> {', ':c;', '}', 'stop']);
    expect(firstFill(svg, 'rect')).toBe('#AAA');
    expect(firstFill(svg, 'text')).toBe('#BBB');
  });

  it('skinparam <<foo>>, no <style>: jar #AAA', () => {
    const svg = render(['skinparam activityBackgroundColor<<foo>> #AAAAAA', 'start', ':a; <<foo>>', 'stop']);
    expect(firstFill(svg, 'rect')).toBe('#AAA');
  });

  it('an inline colour beats it: jar #F00', () => {
    const svg = render([...STYLE, 'start', ':a; <<foo>> <<#FF0000>>', 'stop']);
    expect(firstFill(svg, 'rect')).toBe('#F00');
  });

  it('a BoxStyle label is a stereotype too, FtileBox.java:140-141: jar #AAA on its outline', () => {
    const svg = render(['<style>', '.task { BackgroundColor #AAAAAA }', '</style>', 'start', ':a; <<task>>', 'stop']);
    expect(firstFill(svg, 'rect')).toBe('#AAA');
  });
});

describe('dss T3d: frames, jar oracles on the same sources', () => {
  it.each([
    ['partition', 'partition'],
    ['group', 'group'],
    ['rectangle', 'rectangle'],
    ['card', 'card'],
    ['package', 'package_'],
  ])('%s: its signature keeps a key of its own, FtileGroup.java:89-92 (D2a)', (symbol, sname) => {
    const row = ELEMENT_SIGNATURES['activityDiagram']?.find((r) => r.bucket === compositeBucketOf(symbol));
    expect(row?.snames).toEqual(['root', 'element', 'activityDiagram', sname, 'composite']);
    expect(row?.shadows).toBe(symbol);
  });

  const RECTANGLE = ['start', 'rectangle R {', ':b;', '}', 'stop'];

  it('a declared-later <style> beats a Partition skinparam: FromSkinparamToStyle.java:132-133, jar #AAA, #111', () => {
    const svg = render([
      'skinparam PartitionBackgroundColor #BBBBBB',
      'skinparam PartitionFontColor #222222',
      '<style>',
      'rectangle { BackgroundColor #AAAAAA',
      'FontColor #111111 }',
      '</style>',
      ...RECTANGLE,
    ]);
    expect(firstFill(svg, 'rect')).toBe('#AAA');
    expect(firstFill(svg, 'text')).toBe('#111');
  });

  it('no <style>, Partition after rectangle: the flat Partition tier stands, jar #BBB, #222', () => {
    const svg = render([
      'skinparam rectangleBackgroundColor #AAAAAA',
      'skinparam rectangleFontColor #111111',
      'skinparam PartitionBackgroundColor #BBBBBB',
      'skinparam PartitionFontColor #222222',
      ...RECTANGLE,
    ]);
    expect(firstFill(svg, 'rect')).toBe('#BBB');
    expect(firstFill(svg, 'text')).toBe('#222');
  });

  it.each([
    ['rectangle', ['skinparam rectangleFontColor #111111', ...RECTANGLE], '#111'],
    ['card', ['skinparam cardFontColor #222222', 'start', 'card C {', ':b;', '}', 'stop'], '#222'],
    ['package', ['skinparam packageFontColor #333333', 'start', 'package L {', ':b;', '}', 'stop'], '#333'],
  ])(
    'no <style>, skinparam %sFontColor paints the title (addMagic, FromSkinparamToStyle.java:278)',
    (_, lines, jar) => {
      expect(firstFill(render(lines), 'text')).toBe(jar);
    },
  );
});

describe('dss T3d: authored rows against their jar oracles', () => {
  it.each([
    'activity__cascade-bg-diag',
    'activity__cascade-bg-diag-element',
    'activity__cascade-bg-element',
    'activity__cascade-bg-root',
    'activity__selector-own-bare',
    'activity__lanes-bg-diag',
    'activity__lanes-bg-element',
    'activity__lanes-bg-root',
    'activity__lanes-font-diag',
    'activity__lanes-font-element',
    'activity__lanes-font-root',
    'activity__sdl-bg-diag',
    'activity__sdl-bg-element',
    'activity__sdl-bg-root',
  ])('%s is identical to the jar', (row) => {
    expect(firstScopeDiffs(row, DIFF_LIMIT)).toEqual([]);
  });

  it('activity__loops-bg-element and -font-* add nothing over their baseline, activity__loops-none', () => {
    const baseline = firstScopeDiffs('activity__loops-none', DIFF_LIMIT);
    for (const row of ['bg-element', 'font-diag', 'font-element', 'font-root']) {
      expect(firstScopeDiffs(`activity__loops-${row}`, DIFF_LIMIT)).toEqual(baseline);
    }
  });

  it('activity__loops-bg-diag adds only the document rect, sized off the canvas the baseline already misses', () => {
    const baseline = new Set(firstScopeDiffs('activity__loops-none', DIFF_LIMIT));
    const fills = firstScopeDiffs('activity__loops-bg-diag', DIFF_LIMIT).filter(
      (line) => !baseline.has(line) && /@(fill|stroke)\b/.test(line),
    );
    expect(fills).toEqual([]);
  });
});
