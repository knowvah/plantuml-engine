/**
 * `parseChart` over whole sources: what the old parser's acceptance cases asserted
 * and upstream does too. Its invented rules (a `line <<circle>>` marker, a
 * registered `grid` command, a stereotype colour) are gone with it.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartDiagramFactory.java
 */
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { parseChart } from '../../../src/diagrams/chart/ChartDiagramFactory.js';
import { parseChartAst } from './parse-chart-ast.js';

const src = (...lines: string[]): UmlSource => ({ lines, type: 'chart' });
const parsed = (...lines: string[]) => parseChartAst(src(...lines));
const errorOf = (...lines: string[]): string => {
  const result = parseChart(src(...lines), new PreprocessingArtifact());
  if (!('refused' in result)) throw new Error('expected a refusal');
  return result.message;
};

describe('parseChart', () => {
  it('categorical h-axis, numeric v-axis, bar series', () => {
    const d = parsed('h-axis [Q1, Q2]', 'v-axis "Revenue" 0 --> 100', 'bar "R" [45, 62] #3498db');
    expect(d.getXAxisLabels()).toEqual(['Q1', 'Q2']);
    expect([d.getYAxis().getTitle(), d.getYAxis().getMin(), d.getYAxis().getMax()]).toEqual(['Revenue', 0, 100]);
    expect(d.getSeries()[0]!.getValues()).toEqual([45, 62]);
  });

  it('coordinate pairs need an explicit h-axis range', () => {
    expect(errorOf('line [(1,2)]')).toBe(
      'Coordinate pair notation requires explicit h-axis range (e.g., h-axis "x" -5 --> 5)',
    );
  });

  it('coordinate pairs need a numeric h-axis', () => {
    expect(errorOf('h-axis [A]', 'line [(1,2)]')).toBe(
      'Coordinate pair notation requires numeric h-axis (e.g., h-axis "x" -5 --> 5), not categorical labels',
    );
  });

  it('series may not mix formats', () => {
    expect(errorOf('h-axis 0 --> 5', 'bar [1]', 'line [(1,2)]')).toBe(
      'All series must use the same data format (either all coordinate pairs or all index-based)',
    );
  });

  it('an out-of-range x prints Double.toString', () => {
    expect(errorOf('h-axis 0 --> 5', 'line [(6,2)]')).toBe('X-coordinate 6.0 is outside h-axis range [0.0, 5.0]');
  });

  it('a numeric h-axis and a v2-axis', () => {
    const d = parsed('h-axis "x" -5 --> 5', 'v2-axis "R" 0 --> 50');
    expect([d.getXAxis().getMin(), d.getXAxis().getMax()]).toEqual([-5, 5]);
    expect(d.getY2Axis()?.getMax()).toBe(50);
  });

  it('custom ticks, an annotation and the default name', () => {
    const d = parsed('v-axis 0 --> 1 ticks [0:"a", 1:"b"]', 'annotation "t" at (1, 2) <<arrow>>', 'bar [1]');
    expect(d.getYAxis().getCustomTicks()).toEqual([
      { value: 0, label: 'a' },
      { value: 1, label: 'b' },
    ]);
    expect(d.getAnnotations()[0]!.isShowArrow()).toBe(true);
    expect(d.getSeries()[0]!.getName()).toBe('bar0');
  });

  it('orientation, stackMode and legend', () => {
    const d = parsed('orientation horizontal', 'stackMode stacked', 'legend right');
    expect([d.getOrientation(), d.getStackMode(), d.getLegendPosition()]).toEqual(['HORIZONTAL', 'STACKED', 'RIGHT']);
  });

  it('an empty source has the defaults', () => {
    const d = parsed();
    expect([d.getOrientation(), d.getStackMode(), d.getLegendPosition()]).toEqual(['VERTICAL', 'GROUPED', 'NONE']);
    expect([d.getYAxis().isAutoScale(), d.getY2Axis(), d.getSeries()]).toEqual([true, undefined, []]);
  });

  it('autoscales only without an explicit range', () => {
    expect(parsed('bar [150]').getYAxis().getMax()).toBe(150);
    expect(parsed('v-axis 0 --> 100', 'bar [150]').getYAxis().getMax()).toBe(100);
  });

  it('accepts the x and y aliases', () => {
    const d = parsed('x-axis [A]', 'y-axis "T" 0 --> 1', 'y2-axis "U" 0 --> 2');
    expect([d.getXAxisLabels(), d.getYAxis().getTitle(), d.getY2Axis()?.getTitle()]).toEqual([['A'], 'T', 'U']);
  });

  it('grid v-axis is not a command: upstream never registers it', () => {
    expect(errorOf('grid v-axis')).toBe('Syntax Error?');
    expect(errorOf('grid h-axis')).toBe('Syntax Error?');
  });
});
