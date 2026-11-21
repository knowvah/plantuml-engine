/**
 * `ChartDiagram#resolveCartesian` and its helpers (chart-resolve.ts), and the
 * ticks they feed: the fitted value axes (2117ccb43cd), categories from keys
 * (d68b839c457, 22ed6b6b822), values spread over an h-axis range (55e6dabc863).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartDiagram.java:230-481
 */
import { describe, expect, it } from 'vitest';
import { ChartAxis } from '../../../src/diagrams/chart/ChartAxis.js';
import { formatValue, horizontalValueTicks, numericTicks, valueTicks } from '../../../src/diagrams/chart/ChartTicks.js';
import { parseChartAst } from './parse-chart-ast.js';

const resolved = (...lines: string[]) => parseChartAst({ lines, type: 'chart' }).resolveCartesian();
const valueRange = (...lines: string[]): number[] => {
  const axis = resolved(...lines).getValueAxis();
  return [axis.getMin(), axis.getMax()];
};

describe('the fitted value axis', () => {
  it('counts stacked bars by their stack, positive and negative apart', () => {
    expect(valueRange('h-axis [A]', 'bar [80]', 'bar [60]')).toEqual([0, 100]);
    expect(valueRange('h-axis [A]', 'bar [80]', 'bar [60]', 'bar [-10]', 'stackMode stacked')).toEqual([-40, 160]);
  });

  it('counts areas by their running totals', () => {
    expect(valueRange('h-axis [A, B]', 'area [10, 20]', 'area [30, , ]')).toEqual([0, 40]);
  });

  it('samples an interpolated line, whose spline overshoots its points', () => {
    expect(valueRange('h-axis [A, B, C, D]', 'line [10, 40, 40, 10]')).toEqual([0, 40]);
    expect(valueRange('h-axis [A, B, C, D]', 'line [10, 40, 40, 10] interpolate')).toEqual([0, 50]);
  });

  it('gives an arrow annotation 25% of its height above it, on a vertical chart only', () => {
    expect(valueRange('h-axis [A, B]', 'bar [40, 10]', 'annotation "Peak" at (A, 40) <<arrow>>')).toEqual([0, 50]);
    expect(valueRange('h-axis [A, B]', 'bar [40, 10]', 'annotation "Peak" at (A, 40)')).toEqual([0, 40]);
    const horizontal = [
      'orientation horizontal',
      'v-axis [A, B]',
      'bar [40, 10]',
      'annotation "P" at (A, 40) <<arrow>>',
    ];
    expect(valueRange(...horizontal)).toEqual([0, 40]);
  });

  it('stays 0 -> 100 with no value at all', () => {
    expect(valueRange('h-axis [A]', 'bar [ , ]')).toEqual([0, 100]);
  });
});

describe('categories, keys and spread values', () => {
  it('takes the keys of the series, then 2..n, as categories', () => {
    const chart = resolved('bar [Jan: 10, Feb: 20]', 'line [Mar: 5, Jan: 1]', 'line [1, 2, 3, 4]');
    expect(chart.getCategories()).toEqual(['Jan', 'Feb', 'Mar', '4']);
    expect(chart.getSeries().map((s) => s.getValues())).toEqual([
      [10, 20, undefined, undefined],
      [1, undefined, 5, undefined],
      [1, 2, 3, 4],
    ]);
  });

  it('takes the v-axis labels as categories of a horizontal chart', () => {
    const chart = resolved('orientation horizontal', 'v-axis [A, B]', 'bar [B: 3]');
    expect([chart.isHorizontal(), chart.getCategories(), chart.getSeries()[0]!.getValues()]).toEqual([
      true,
      ['A', 'B'],
      [undefined, 3],
    ]);
  });

  it('spreads index-based values over an h-axis range, one in the middle', () => {
    expect(resolved('h-axis 0 --> 10', 'line [1, 2, 3]').getSeries()[0]!.getXValues()).toEqual([0, 5, 10]);
    expect(resolved('h-axis 0 --> 10', 'scatter [1]').getSeries()[0]!.getXValues()).toEqual([5]);
    expect(resolved('h-axis 0 --> 10', 'h-axis [A]', 'line [1]').getSeries()[0]!.getXValues()).toBeUndefined();
  });

  it('refuses keys on an h-axis range and keys outside the categories', () => {
    const error = (...lines: string[]) => {
      try {
        parseChartAst({ lines, type: 'chart' });
        return 'ok';
      } catch (e) {
        return String(e);
      }
    };
    expect(error('h-axis 0 --> 1', 'bar [A: 1]')).toContain('need h-axis categories');
    expect(error('bar [A: 1]', 'h-axis 0 --> 1')).toContain('need h-axis categories');
    expect(error('h-axis [A]', 'bar [B: 1]')).toContain('"B" is not in h-axis');
    expect(error('bar [B: 1]', 'h-axis [A]')).toContain('"B" is not in h-axis');
    expect(error('orientation horizontal', 'bar [B: 1]', 'v-axis [A]')).toContain('"B" is not in v-axis');
  });
});

describe('ChartTicks', () => {
  it('formats a value axis without trailing zeros', () => {
    expect([formatValue(0.8), formatValue(110.4), formatValue(99.999), formatValue(0.001), formatValue(3)]).toEqual([
      '0.8',
      '110.4',
      '100.',
      '1.00e-03',
      '3',
    ]);
  });

  it('places custom ticks inside the range, spaced ticks, and five intervals', () => {
    const axis = new ChartAxis('', 0, 1);
    expect(valueTicks(axis).map((t) => t.label)).toEqual(['0', '0.2', '0.4', '0.6', '0.8', '1']);
    axis.setTickSpacing(0.5);
    expect(valueTicks(axis).map((t) => [t.value, t.ratio])).toEqual([
      [0, 0],
      [0.5, 0.5],
      [1, 1],
    ]);
    axis.setCustomTicks([
      { value: 0.5, label: 'half' },
      { value: 2, label: 'out' },
    ]);
    expect(valueTicks(axis)).toEqual([{ value: 0.5, ratio: 0.5, label: 'half' }]);
  });

  it('writes horizontal value ticks with %.0f and numeric ticks with one decimal', () => {
    expect(horizontalValueTicks(new ChartAxis('', 0, 1)).map((t) => t.label)).toEqual(['0', '0', '0', '1', '1', '1']);
    expect(numericTicks(undefined, undefined)).toEqual([]);
    expect(numericTicks(new ChartAxis('', 0, 1), undefined).map((t) => t.label)[1]).toBe('0.1');
    expect(numericTicks(new ChartAxis('', 0, 10), 5).map((t) => t.label)).toEqual(['0', '5', '10']);
  });
});
