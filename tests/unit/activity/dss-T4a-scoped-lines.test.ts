import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compositeBucketOf } from '../../../src/core/style-element-scope.js';
import { resolveTheme, type Theme } from '../../../src/core/theme.js';
import type { ElementColors } from '../../../src/core/theme-graph-colors.js';
import { renderComposite } from '../../../src/diagrams/activity/activity-renderer-composite.js';
import { diamondColors } from '../../../src/diagrams/activity/activity-renderer-if-shapes.js';
import { renderNote, actColors } from '../../../src/diagrams/activity/activity-renderer-shapes.js';
import { renderSplitLine } from '../../../src/diagrams/activity/activity-renderer-bars.js';
import {
  renderEnd,
  renderNodesDispatchingGotos,
  renderSpot,
} from '../../../src/diagrams/activity/activity-renderer-terminals.js';
import { activityArrowHeadColor } from '../../../src/diagrams/activity/activity-style-defaults.js';
import { arrowLineColor } from '../../../src/diagrams/activity/activity-scoped-colors.js';
import type { ActivityNodeGeo } from '../../../src/diagrams/activity/activity-geometry.types.js';
import { withActivityMeasurer } from '../../../src/diagrams/activity/activity-string-bounder.js';
import { renderSync } from '../../../src/index.js';
import { firstScopeDiffs } from '../../oracle/svg-conformance/diagram-style-scope.js';

/**
 * dss T4a: the activity readers take the resolved `LineColor` T2a wrote to `theme.colors.elements`, over the flat
 * tiers, and under an inline `-[#color]->`. Signatures: `FtileBox.java:98`, `FtileFactoryDelegator.java:79-84`,
 * `FtileWithNoteOpale.java:89,141`, `FtileGroup.java:89-102`, `FtileCircleEndCross.java:78-79,98-115`,
 * `FtileCircleSpot.java:102-103`, `Swimlanes.java:246-249`, `ParallelBuilderSplit.java:72-83,114-122`.
 */
const SCOPED = '#ABCDEF';
const FLAT = '#123456';
const INLINE = '#00FF00';
const DIFF_LIMIT = 500;

function themeWith(
  elements: Partial<Record<string, ElementColors>>,
  activity?: NonNullable<Theme['colors']['graph']['activity']>,
  colors: Partial<Theme['colors']> = {},
): Theme {
  const base = resolveTheme();
  const graph = activity === undefined ? base.colors.graph : { ...base.colors.graph, activity };
  const theme = {
    ...base,
    colors: { ...base.colors, ...colors, elements: { ...base.colors.elements, ...elements }, graph },
  };
  return withActivityMeasurer(theme, new DeterministicMeasurer());
}

function geo(kind: string, extra: Partial<ActivityNodeGeo> = {}): ActivityNodeGeo {
  return { id: 'n', kind, x: 0, y: 0, width: 30, height: 20, ...extra };
}

/** The value of attribute `attr` on the first element of `tag`. */
function firstAttr(svg: string, tag: string, attr: string): string | undefined {
  return new RegExp(`<${tag}[^>]*?\\s${attr}="([^"]*)"`).exec(svg)?.[1];
}

describe('dss T4a: each site reads its bucket', () => {
  it('site 8: action box, FtileBox.java:98,164', () => {
    const none = themeWith({});
    expect(actColors(none).nodeBorder).toBe(none.colors.border);
    expect(actColors(themeWith({}, { border: FLAT })).nodeBorder).toBe(FLAT);
    expect(actColors(themeWith({ activity: { border: SCOPED } }, { border: FLAT })).nodeBorder).toBe(SCOPED);
  });

  it('site 9: diamond, FtileFactoryDelegator.java:79-80', () => {
    const scoped = themeWith({ diamond: { border: SCOPED } }, { diamondBorder: FLAT, border: FLAT });
    expect(diamondColors(scoped.colors.graph.activity, scoped).border).toBe(SCOPED);
    const flat = themeWith({}, { diamondBorder: FLAT });
    expect(diamondColors(flat.colors.graph.activity, flat).border).toBe(FLAT);
  });

  it('site 10: note body and fold, FtileWithNoteOpale.java:141', () => {
    const svg = renderNote(geo('note'), themeWith({ note: { border: SCOPED } }));
    expect(svg.match(/stroke="#ABCDEF"/g)?.length).toBe(2);
    expect(renderNote(geo('note'), themeWith({})).includes(SCOPED)).toBe(false);
  });

  it('site 11, 12: arrow line and head, FtileFactoryDelegator.java:84, Rainbow.java:84-95', () => {
    const scoped = themeWith({ arrow: { border: SCOPED } }, undefined, { arrow: FLAT });
    expect(arrowLineColor(scoped)).toBe(SCOPED);
    expect(activityArrowHeadColor(scoped)).toBe(SCOPED);
    expect(arrowLineColor(themeWith({}, undefined, { arrow: FLAT }))).toBe(FLAT);
  });

  it('site 12: a HeadColor (skinparam ArrowHeadColor) is read apart from the line, Rainbow.java:88-91', () => {
    const scoped = themeWith({ arrow: { border: SCOPED } }, undefined, { arrow: FLAT, arrowHead: INLINE });
    expect(activityArrowHeadColor(scoped)).toBe(INLINE);
  });

  it('site 13: split line, ParallelBuilderSplit.java:72-83', () => {
    const svg = renderSplitLine(geo('split-bar'), themeWith({ arrow: { border: SCOPED } }, undefined, { arrow: FLAT }));
    expect(firstAttr(svg, 'line', 'stroke')).toBe(SCOPED);
  });

  it('site 14: frame border, FtileGroup.java:102', () => {
    const theme = themeWith({ [compositeBucketOf('partition')]: { border: SCOPED } });
    expect(firstAttr(renderComposite(geo('partition'), theme), 'rect', 'stroke')).toBe(SCOPED);
    const group = themeWith({ [compositeBucketOf('group')]: { border: SCOPED } });
    expect(firstAttr(renderComposite(geo('group'), group), 'rect', 'stroke')).toBe(SCOPED);
    expect(firstAttr(renderComposite(geo('partition'), group), 'rect', 'stroke')).toBe('#000');
  });

  it('site 15: end ring and both cross strokes, FtileCircleEndCross.java:79,105-114', () => {
    const svg = renderEnd(geo('end'), themeWith({ 'circle.end': { border: SCOPED } }));
    expect(svg.match(/stroke="#ABCDEF"/g)?.length).toBe(3);
    expect(renderEnd(geo('end'), themeWith({})).includes(SCOPED)).toBe(false);
  });

  it('site 16: spot border, FtileCircleSpot.java:102-103', () => {
    const svg = renderSpot(geo('spot'), themeWith({ 'circle.spot': { border: SCOPED } }));
    expect(firstAttr(svg, 'ellipse', 'stroke')).toBe(SCOPED);
  });

  it('site 17: goto, Swimlanes.java:246-249', () => {
    const goto = geo('goto', { label: 'L', x: 5, y: 5 });
    const label = geo('label', { label: 'L', x: 50, y: 50 });
    const svg = renderNodesDispatchingGotos([label, goto], themeWith({ goto: { border: SCOPED } })).join('');
    expect(svg.match(/stroke="#ABCDEF"/g)?.length).toBe(2);
  });
});

function render(lines: readonly string[]): string {
  return renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });
}

function tagsOf(svg: string, tag: string): readonly string[] {
  return svg.match(new RegExp(`<${tag}[^>]*>`, 'g')) ?? [];
}

describe('dss T4a: an inline arrow colour stays above the style, FtileFactoryDelegator.java:93-100', () => {
  const STYLE = ['<style>', 'activityDiagram { LineColor #BB0000 }', '</style>'];

  it('draws the inline line and head in the inline colour, the styled arrow in the style (jar row below)', () => {
    const svg = render([...STYLE, 'start', '-[#00FF00]->', ':a;', '-> plain;', ':b;', 'stop']);
    const lines = tagsOf(svg, 'line').map((t) => /stroke="([^"]*)"/.exec(t)?.[1]);
    expect(lines.slice(0, 3)).toEqual(['#0F0', '#B00', '#B00']);
    const heads = tagsOf(svg, 'polygon').map((t) => [/fill="([^"]*)"/.exec(t)?.[1], /stroke="([^"]*)"/.exec(t)?.[1]]);
    expect(heads.slice(0, 2)).toEqual([
      ['#0F0', '#0F0'],
      ['#B00', '#B00'],
    ]);
  });

  it('activity__cascade-line-inline is identical to the jar', () => {
    expect(firstScopeDiffs('activity__cascade-line-inline', DIFF_LIMIT)).toEqual([]);
  });
});

describe('dss T4a: the stereotype and stereogroup tiers over the merged value', () => {
  it('a box <<foo>> draws .foo LineColor, FtileBox.java:146,164: jar #0B0 on the first box, #B00 on the second', () => {
    const svg = render([
      '<style>',
      '.foo { LineColor #00BB00 }',
      'activity { LineColor #BB0000 }',
      '</style>',
      'start',
      ':a; <<foo>>',
      ':b;',
      'stop',
    ]);
    expect(tagsOf(svg, 'rect').map((t) => /stroke="([^"]*)"/.exec(t)?.[1])).toEqual(['#0B0', '#B00']);
  });

  it('a note <<foo>> alone on its instruction takes .foo, FtileWithNoteOpale.java:135-141: jar #AAA, #0B0', () => {
    const svg = render([
      '<style>',
      'note { .foo { BackgroundColor #AAAAAA',
      'LineColor #00BB00 } }',
      '</style>',
      'start',
      ':a;',
      'note left <<foo>> : n',
      'stop',
    ]);
    const body = tagsOf(svg, 'path')[0]!;
    expect(/fill="([^"]*)"/.exec(body)?.[1]).toBe('#AAA');
    expect(/stroke="([^"]*)"/.exec(body)?.[1]).toBe('#0B0');
  });

  it('a stacked note ignores it, FtileWithNotes.java:105-110 (no withTOBECHANGED): jar #FEFFDD', () => {
    const svg = render([
      '<style>',
      '.foo { BackgroundColor #AAAAAA }',
      '</style>',
      'start',
      ':a;',
      'note left <<foo>> : n',
      'note right <<foo>> : m',
      'stop',
    ]);
    expect(tagsOf(svg, 'path').map((t) => /fill="([^"]*)"/.exec(t)?.[1])).toEqual(Array(4).fill('#FEFFDD'));
  });

  it('fork <<#red>> fills both bars, Stereogroup.java:151-153, FtileBlackBlock.java:105-106: jar #F00', () => {
    const svg = render(['start', 'fork <<#FF0000>>', ':a;', 'fork again', ':b;', 'end fork', 'stop']);
    const bars = tagsOf(svg, 'rect').filter((t) => t.includes('rx="2.5"'));
    expect(bars.map((t) => [/fill="([^"]*)"/.exec(t)?.[1], /stroke="([^"]*)"/.exec(t)?.[1]])).toEqual([
      ['#F00', '#F00'],
      ['#F00', '#F00'],
    ]);
  });

  it('fork <<foo>> names no colour, so the bar keeps the merged value: jar #555', () => {
    const svg = render(['start', 'fork <<foo>>', ':a;', 'fork again', ':b;', 'end fork', 'stop']);
    expect(tagsOf(svg, 'rect').find((t) => t.includes('rx="2.5"'))).toContain('fill="#555"');
  });

  it('skinparam activityBorderColor<<foo>> reaches the box, FromSkinparamToStyle.java:292-302: jar #0B0', () => {
    const svg = render(['skinparam activityBorderColor<<foo>> #00BB00', 'start', ':a; <<foo>>', ':b;', 'stop']);
    expect(tagsOf(svg, 'rect').map((t) => /stroke="([^"]*)"/.exec(t)?.[1])).toEqual(['#0B0', '#181818']);
  });
});

describe('dss T4a: authored rows against their jar oracles', () => {
  it.each([
    'activity__cascade-line-stereo',
    'activity__cascade-line-head',
    'activity__cascade-line-goto',
    'activity__cascade-line-end',
    'activity__stereo-fork',
    'activity__stereo-note',
    'activity__stereo-partition',
    'activity__stereo-skinparam',
    'activity__cascade-line-diag',
    'activity__cascade-line-diag-element',
    'activity__cascade-line-element',
    'activity__cascade-line-root',
    'activity__lanes-line-diag',
    'activity__lanes-line-element',
    'activity__lanes-line-root',
    'activity__sdl-line-diag',
    'activity__sdl-line-element',
    'activity__sdl-line-root',
  ])('%s is identical to the jar', (row) => {
    expect(firstScopeDiffs(row, DIFF_LIMIT)).toEqual([]);
  });

  it.each(['diag', 'element', 'root'])(
    'activity__loops-line-%s draws no line colour apart from activity__loops-none (the baseline has other diffs)',
    (kind) => {
      const baseline = new Set(firstScopeDiffs('activity__loops-none', DIFF_LIMIT));
      const lines = firstScopeDiffs(`activity__loops-line-${kind}`, DIFF_LIMIT).filter(
        (line) => !baseline.has(line) && /@(stroke|fill)\b/.test(line),
      );
      expect(lines).toEqual([]);
    },
  );
});

describe('dss T4a: an inline arrow colour at the head or tail of a branch', () => {
  const strokes = (svg: string): readonly (string | undefined)[] =>
    tagsOf(svg, 'line').map((t) => /stroke="([^"]*)"/.exec(t)?.[1]);

  it('the first arrow of a then branch colours the diamond-to-branch edge, Branch.java:163-178, FtileIfWithLinks.java:97', () => {
    const svg = render([
      'start',
      'if (c) then (y)',
      '-[#FF00FF]->',
      ':d;',
      'else (n)',
      '-[#00FFFF]->',
      ':e;',
      'endif',
      'stop',
    ]);
    expect(strokes(svg).slice(0, 4)).toEqual(['#F0F', '#F0F', '#0FF', '#0FF']);
  });

  it('a then-only if (FtileIfDown) takes it from its thenBlock, FtileIfDown.java:135', () => {
    const svg = render(['start', 'if (c) then (y)', '-[#FF00FF]->', ':d;', 'endif', 'stop']);
    expect(strokes(svg)).toContain('#F0F');
  });

  it('an inline colour beats the LineColor style on a branch edge: jar #F0F', () => {
    const svg = render([
      '<style>',
      'activityDiagram { LineColor #BB0000 }',
      '</style>',
      'start',
      'if (c) then (y)',
      '-[#FF00FF]->',
      ':d;',
      'endif',
      'stop',
    ]);
    expect(strokes(svg)).toContain('#F0F');
    expect(strokes(svg)).toContain('#B00');
  });

  it('a while and a repeat body take theirs, FtileWhile.java:153, FtileRepeat.java:172', () => {
    const w = render(['start', 'while (c) is (y)', '-[#FF00FF]->', ':a;', 'endwhile (n)', 'stop']);
    expect(strokes(w)[0]).toBe('#F0F');
    const r = render(['start', 'repeat', '-[#FF00FF]->', ':a;', 'repeat while (d) is (y)', 'stop']);
    expect(strokes(r)[0]).toBe('#F0F');
  });

  it('the arrow before endif colours the branch-to-merge edge and the implicit else, InstructionIf.java:192-196', () => {
    const svg = render(['start', 'if (c) then (y)', ':d;', '-[#FF00FF]->', 'endif', 'stop']);
    const magenta = strokes(svg).filter((s) => s === '#F0F');
    expect(magenta).toHaveLength(4);
  });

  it('a note after the first arrow still belongs to the if, InstructionIf.java:222-227 (jar activity__inline-if-note)', () => {
    expect(firstScopeDiffs('activity__inline-if-note', DIFF_LIMIT)).toEqual([]);
  });

  it('a label on the first arrow replaces the then label, Branch.java:228-236 (jar activity__inline-if-label)', () => {
    expect(firstScopeDiffs('activity__inline-if-label', DIFF_LIMIT)).toEqual([]);
  });

  it.each([
    'then',
    'else',
    'elseif',
    'style',
    'thenonly',
    'bold',
    'vertical',
    'vertical-style',
    'lanes',
    'nested',
    'stop',
    'out',
    'out-elseif',
    'out-stop',
    'out-endif',
    'empty',
    'label',
    'note',
  ])('activity__inline-if-%s is identical to the jar', (kind) => {
    expect(firstScopeDiffs(`activity__inline-if-${kind}`, DIFF_LIMIT)).toEqual([]);
  });

  it.each(['while', 'repeat', 'while-backward', 'loop-lanes'])(
    'activity__inline-%s is identical to the jar',
    (kind) => {
      expect(firstScopeDiffs(`activity__inline-${kind}`, DIFF_LIMIT)).toEqual([]);
    },
  );
});
