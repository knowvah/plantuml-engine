/**
 * `ChartDiagram`'s command state, with Java's exact messages.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartDiagram.java:193-255
 */
import { describe, expect, it } from 'vitest';
import { ChartAnnotation } from '../../../src/diagrams/chart/ChartAnnotation.js';
import { LabelPosition } from '../../../src/diagrams/chart/ChartAxis.js';
import { GridMode, LegendPosition, Orientation, StackMode } from '../../../src/diagrams/chart/ChartDiagram.js';
import { ChartSeries, SeriesType } from '../../../src/diagrams/chart/ChartSeries.js';
import { emptyChartDiagram } from './helpers/chart-diagram.js';

const barOf = (...values: number[]): ChartSeries => new ChartSeries('b', SeriesType.BAR, values);
const lineOfPairs = (ys: number[], xs: number[]): ChartSeries => new ChartSeries('l', SeriesType.LINE, ys, xs);

describe('ChartDiagram#addSeries', () => {
  it('refuses coordinate pairs on a bar', () => {
    const result = emptyChartDiagram().addSeries(new ChartSeries('b', SeriesType.BAR, [1], [1]));
    expect(result.getError()).toBe('Coordinate pair notation (x:y) is only supported for line and scatter charts');
  });

  it('refuses coordinate pairs over categorical labels and does not add the series', () => {
    const d = emptyChartDiagram();
    d.setXAxisLabels(['A']);
    d.setXAxis(undefined, 0, 10);
    expect(d.addSeries(lineOfPairs([1], [1])).getError()).toBe(
      'Coordinate pair notation requires numeric h-axis (e.g., h-axis "x" -5 --> 5), not categorical labels',
    );
    expect(d.getSeries()).toHaveLength(0);
  });

  it('refuses coordinate pairs with h-axis unset', () => {
    expect(
      emptyChartDiagram()
        .addSeries(lineOfPairs([1], [1]))
        .getError(),
    ).toBe('Coordinate pair notation requires explicit h-axis range (e.g., h-axis "x" -5 --> 5)');
  });

  it('refuses coordinate pairs on a zero range', () => {
    const d = emptyChartDiagram();
    d.setXAxis(undefined, 5, 5);
    expect(d.addSeries(lineOfPairs([1], [5])).getError()).toBe(
      'Coordinate pair notation requires explicit h-axis range (e.g., h-axis "x" -5 --> 5)',
    );
  });

  it('refuses pairs after an index-based series, and index-based after pairs', () => {
    const d = emptyChartDiagram();
    d.setXAxis(undefined, 0, 10);
    expect(d.addSeries(barOf(1)).isOk()).toBe(true);
    const message = 'All series must use the same data format (either all coordinate pairs or all index-based)';
    expect(d.addSeries(lineOfPairs([1], [1])).getError()).toBe(message);

    const d2 = emptyChartDiagram();
    d2.setXAxis(undefined, 0, 10);
    expect(d2.addSeries(lineOfPairs([1], [1])).isOk()).toBe(true);
    expect(d2.addSeries(barOf(1)).getError()).toBe(message);
    expect(d2.getSeries()).toHaveLength(1);
  });

  it('prints an out-of-range x with Double.toString', () => {
    const d = emptyChartDiagram();
    d.setXAxis(undefined, 0, 10);
    expect(d.addSeries(lineOfPairs([1], [12])).getError()).toBe(
      'X-coordinate 12.0 is outside h-axis range [0.0, 10.0]',
    );
    expect(d.addSeries(lineOfPairs([1], [-1])).getError()).toBe(
      'X-coordinate -1.0 is outside h-axis range [0.0, 10.0]',
    );
  });

  it('autoscales the primary axis', () => {
    const d = emptyChartDiagram();
    d.addSeries(barOf(150));
    expect(d.getYAxis().getMax()).toBe(150);
  });

  it('autoscales y2 only when the series asks and the axis exists', () => {
    const d = emptyChartDiagram();
    const before = new ChartSeries('l', SeriesType.LINE, [300]);
    before.setUseSecondaryAxis(true);
    d.addSeries(before);
    expect(d.getYAxis().getMax()).toBe(300);

    d.setY2Axis(undefined, undefined, undefined);
    const after = new ChartSeries('l', SeriesType.LINE, [500]);
    after.setUseSecondaryAxis(true);
    d.addSeries(after);
    expect(d.getY2Axis()?.getMax()).toBe(500);
    expect(d.getYAxis().getMax()).toBe(300);
  });

  it('accepts in-range coordinate pairs', () => {
    const d = emptyChartDiagram();
    d.setXAxis('x', -5, 5);
    expect(d.addSeries(lineOfPairs([1], [0])).isOk()).toBe(true);
    expect(d.getXAxis().getTitle()).toBe('x');
    expect(d.getSeries()).toHaveLength(1);
  });
});

describe('ChartDiagram state', () => {
  it('describes itself and exposes the skin param and sprites', () => {
    const d = emptyChartDiagram();
    expect(d.getDescription()).toBe('Chart Diagram');
    expect(d.sprites).toBe(d.getSkinParam().getSprites());
    expect(d.scale).toBeUndefined();
  });

  it('setYAxis only touches what is present', () => {
    const d = emptyChartDiagram();
    d.setYAxis('T', undefined, undefined);
    expect([d.getYAxis().getTitle(), d.getYAxis().isAutoScale()]).toEqual(['T', true]);
    d.setYAxis(undefined, 1, 2);
    expect([d.getYAxis().getTitle(), d.getYAxis().getMin(), d.getYAxis().getMax()]).toEqual(['T', 1, 2]);
  });

  it('setY2Axis creates the axis with everything absent', () => {
    const d = emptyChartDiagram();
    expect(d.getY2Axis()).toBeUndefined();
    d.setY2Axis(undefined, undefined, undefined);
    expect(d.getY2Axis()?.isAutoScale()).toBe(true);
  });

  it('labels replace', () => {
    const d = emptyChartDiagram();
    d.setXAxisLabels(['A', 'B']);
    d.setXAxisLabels(['C']);
    d.setYAxisLabels(['D', 'E']);
    d.setYAxisLabels(['F']);
    expect([d.getXAxisLabels(), d.getYAxisLabels()]).toEqual([['C'], ['F']]);
  });

  it('holds the small setters', () => {
    const d = emptyChartDiagram();
    d.setXAxisTitle('t');
    d.setXAxisLabelPosition(LabelPosition.RIGHT);
    d.setXAxisTickSpacing(3);
    expect(d.getLegendPosition()).toBe(LegendPosition.NONE);
    d.setLegendPosition(LegendPosition.LEFT);
    d.setStackMode(StackMode.STACKED);
    d.setOrientation(Orientation.HORIZONTAL);
    expect([d.getXAxisTitle(), d.getXAxisLabelPosition(), d.getXAxisTickSpacing()]).toEqual(['t', 'RIGHT', 3]);
    expect([d.getLegendPosition(), d.getStackMode(), d.getOrientation()]).toEqual(['LEFT', 'STACKED', 'HORIZONTAL']);
  });

  it('grid modes set singly and together', () => {
    const d = emptyChartDiagram();
    expect([d.getXGridMode(), d.getYGridMode()]).toEqual(['OFF', 'OFF']);
    d.setXGridMode(GridMode.MAJOR);
    expect([d.getXGridMode(), d.getYGridMode()]).toEqual(['MAJOR', 'OFF']);
    d.setYGridMode(GridMode.BOTH);
    expect(d.getYGridMode()).toBe('BOTH');
    d.setGridMode(GridMode.OFF);
    expect([d.getXGridMode(), d.getYGridMode()]).toEqual(['OFF', 'OFF']);
  });

  it('plot annotations are apart from the chrome annotations (D3)', () => {
    const d = emptyChartDiagram();
    const annotation = new ChartAnnotation('t', 'A', 1, false);
    expect(d.addAnnotation(annotation).isOk()).toBe(true);
    expect(d.getAnnotations()).toEqual([annotation]);
    expect(Array.isArray(d.annotations)).toBe(false);
  });
});
