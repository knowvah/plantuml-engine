/**
 * Pie and radar charts (e8ef39dd55c, 66c9c180697): the commands, the kind check
 * that keeps them apart from the cartesian keywords, and the renderers. The
 * full drawings are pinned against the jar by the vega-R15..R22 authored rows.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/PieRenderer.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/RadarRenderer.java
 */
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { Kind } from '../../../src/diagrams/chart/ChartDiagram.js';
import { parseChart } from '../../../src/diagrams/chart/ChartDiagramFactory.js';
import { formatPercent } from '../../../src/diagrams/chart/PieChart.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { parseChartLines } from './helpers/chart-diagram.js';

const src = (...lines: string[]): UmlSource => ({ lines, type: 'chart' });
const errorOf = (...lines: string[]): string => {
  const result = parseChart(src(...lines), new PreprocessingArtifact());
  if (!('refused' in result)) throw new Error('expected a refusal');
  return result.message;
};
const draw = (...lines: string[]): string => {
  const ug = svgGraphic();
  parseChartLines(lines).drawU(ug);
  return ug.getSvgString();
};
const size = (...lines: string[]): number[] => {
  const dim = parseChartLines(lines).calculateDimension(stringBounder());
  return [dim.getWidth(), dim.getHeight()];
};

describe('the kind check', () => {
  it.each([
    [['pie [1]', 'bar [1]'], '"bar" cannot be used with "pie"'],
    [['bar [1]', 'pie [1]'], '"pie" cannot be used with "bar"'],
    [['radar [1]', 'h-axis [A]'], '"h-axis" cannot be used with "radar"'],
    [['pie [1]', 'y2-axis 0 --> 1'], '"y2-axis" cannot be used with "pie"'],
    [['pie [1]', 'orientation horizontal'], '"orientation" cannot be used with "pie"'],
    [['pie [1]', 'stackMode stacked'], '"stackMode" cannot be used with "pie"'],
    [['radar [1]', 'annotation "a" at (A, 1)'], '"annotation" cannot be used with "radar"'],
    [['pie [1]', 'r-axis 0 --> 5'], '"r-axis" cannot be used with "pie"'],
    [['a-axis [A]', 'bar [1]'], '"bar" cannot be used with "a-axis"'],
    [['h-axis [A]', 'a-axis [A]'], '"a-axis" cannot be used with "h-axis"'],
  ])('refuses %j', (lines, message) => {
    expect(errorOf(...lines)).toBe(message);
  });

  it('lets a-axis lead a pie or a radar, and a radar take an r-axis', () => {
    expect(parseChartLines(['a-axis [A, B]', 'pie [1, 2]']).getKind()).toBe(Kind.PIE);
    expect(parseChartLines(['a-axis [A, B]', 'radar [1, 2]', 'r-axis 0 --> 5']).getKind()).toBe(Kind.RADAR);
    expect(parseChartLines(['radar [1, 2]', 'a-axis [A, B]']).getKind()).toBe(Kind.RADAR);
    expect(parseChartLines(['a-axis [A]']).getKind()).toBe(Kind.POLAR);
  });
});

describe('pie', () => {
  it.each([
    [['pie [1]', 'pie [2]'], 'Only one pie is allowed in a chart'],
    [['pie [1]', 'pie'], 'Only one pie is allowed in a chart'],
    [['pie [-1, 2]'], 'A pie cannot have a negative value: -1.0'],
    [['pie [0, 0]'], 'A pie needs at least one value greater than 0'],
    [['pie', '* -2'], 'A pie cannot have a negative value: -2.0'],
    [['pie', '* 0'], 'A pie needs at least one value greater than 0'],
    [['pie'], 'A pie needs at least one value greater than 0'],
    [['pie [1] donut 0%'], 'The donut size must be between 1% and 90%'],
    [['pie [1] donut 95%'], 'The donut size must be between 1% and 90%'],
    [['pie [1] donut 1.2.3%'], 'Invalid donut size 1.2.3%'],
    [['pie [A: 1, 2]'], 'Either every value has a key (key: value), or none has'],
    [['pie [A: 1 #nosuchcolour]'], 'Unknown color #nosuchcolour'],
    [['pie ["A: 1]'], 'Unbalanced quotes in data'],
    [['pie [1)'], "Mismatched '[' and ')' around data"],
  ])('refuses %j', (lines, message) => {
    expect(errorOf(...lines)).toBe(message);
  });

  it('resolves slices above 0, named by key or a-axis label, with labels and percents', () => {
    const d = parseChartLines(['a-axis [N, O]', 'pie [78, 0, 21, 1] labels percent']);
    const pie = d.resolvePie();
    expect(pie.getSlices().map((s) => [s.name, s.value, s.index])).toEqual([
      ['N', 78, 0],
      [undefined, 21, 2],
      [undefined, 1, 3],
    ]);
    expect(pie.getLabel(pie.getSlices()[0]!)).toBe('78 (78%)');
    expect([formatPercent(100 / 3), formatPercent(50), formatPercent(0.4)]).toEqual(['33.3%', '50%', '0.4%']);
    const keyed = parseChartLines(['pie {"Dogs": 386, Cats: "85" #red} percent']).resolvePie();
    expect([keyed.getSlices().map((s) => s.name), keyed.getLabel(keyed.getSlices()[1]!)]).toEqual([
      ['Dogs', 'Cats'],
      '18%',
    ]);
    expect(parseChartLines(['pie [1] labels']).resolvePie().getLabel({ name: undefined, value: 1, index: 0 })).toBe(
      '1',
    );
    expect(parseChartLines(['pie [1]']).resolvePie().getLabel({ name: undefined, value: 1, index: 0 })).toBeUndefined();
  });

  it('reads donut, item colours and list items', () => {
    const series = parseChartLines(['pie "Air" donut', '* Nitrogen : 78 #DC3912', '- Oxygen : 21']).getSeries()[0]!;
    expect([series.getDonutHole(), series.getKeys(), series.getValues()]).toEqual([
      0.5,
      ['Nitrogen', 'Oxygen'],
      [78, 21],
    ]);
    expect(series.getItemColor(0)).toBeDefined();
    expect(series.getItemColor(1)).toBeUndefined();
    expect(series.getItemColor(5)).toBeUndefined();
    expect(parseChartLines(['pie [1] donut 30% labels']).getSeries()[0]!.getDonutHole()).toBe(0.3);
  });

  it('draws slices, a whole turn, a donut, names around and the legend on each side', () => {
    expect(draw('pie [Dogs: 1, Cats: 3] labels').match(/<path/g)).toHaveLength(2);
    expect(draw('pie [1] percent')).toContain('100%');
    expect(draw('pie [1, 1] donut')).toContain('<path');
    for (const position of ['left', 'right', 'top', 'bottom'])
      expect(draw('pie [A: 1, B: 2]', `legend ${position}`)).toContain('<rect');
    const [plain] = size('pie [A: 1, B: 2]');
    const [withLegend] = size('pie [A: 1, B: 2]', 'legend right');
    expect(withLegend).toBeGreaterThan(plain!);
  });
});

describe('radar', () => {
  it.each([
    [['a-axis [A, B]', 'radar [C: 1]'], '"C" is not in a-axis'],
    [['radar [C: 1]', 'a-axis [A, B]'], '"C" is not in a-axis'],
    [['a-axis [A]', 'radar', '* C: 1'], '"C" is not in a-axis'],
    [['a-axis ["A, B]'], 'Unbalanced quotes in a-axis'],
    [['radar [1]', 'r-axis 5 --> 1'], 'r-axis range must go from a lower to a higher value'],
    [['radar [1]', 'r-axis 1.2.3 --> 5'], 'Invalid number format in axis range'],
    [['radar [1]', 'r-axis spacing 0'], 'Tick spacing must be greater than 0'],
    [['radar [1]', 'r-axis spacing 1.2.3'], 'Invalid number format in spacing value'],
    [['radar [1]', 'r-axis ticks [x]'], 'Invalid tick format. Expected: [value:"label", ...]'],
    [['radar [1] #nosuchcolour'], 'No such color'],
  ])('refuses %j', (lines, message) => {
    expect(errorOf(...lines)).toBe(message);
  });

  it('resolves categories from the a-axis, else the keys then 1..n, and fits the scale', () => {
    const chart = parseChartLines(['radar [B: 2, A: 4]', 'radar [1, 2, 3]']).resolveRadar();
    expect([chart.categories, chart.values]).toEqual([
      ['B', 'A', '3'],
      [
        [2, 4, undefined],
        [1, 2, 3],
      ],
    ]);
    expect([chart.axis.getMin(), chart.axis.getMax()]).toEqual([0, 4]);
    const ranged = parseChartLines([
      'a-axis [X, Y]',
      'radar [1, 2]',
      'r-axis 0 --> 10 ticks [5:"m"] spacing 5 grid circle',
    ]);
    const r = ranged.resolveRadar();
    expect([r.categories, r.axis.getMax(), r.axis.getTickSpacing(), r.circleGrid]).toEqual([['X', 'Y'], 10, 5, true]);
    expect(parseChartLines(['radar [1]', 'r-axis grid CIRCLE']).resolveRadar().circleGrid).toBe(false);
    expect(parseChartLines(['a-axis [A]']).resolveRadar().axis.getMax()).toBe(100);
  });

  it('draws rings, spokes, translucent fills, markers, labels and the legend', () => {
    const svg = draw('a-axis [A, B, C]', 'radar "S" [1, , 3] labels', 'radar "T" [2, 2, 2] #ff0000', 'legend left');
    expect(svg).toContain('<polygon');
    expect(svg).toContain('fill-opacity');
    expect(svg.match(/<ellipse/g)!.length).toBeGreaterThanOrEqual(5);
    expect(draw('radar [1, 2]', 'r-axis grid circle')).toContain('<ellipse');
    expect(draw('a-axis [A, B, C]', 'radar [1, 2, 3]', 'legend bottom')).toContain('<rect');
    expect(draw('a-axis [A, B, C]')).toContain('<line');
    expect(draw('radar')).not.toContain('<polygon');
  });
});
