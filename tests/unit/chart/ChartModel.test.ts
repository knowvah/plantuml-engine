/**
 * `ChartAxis`, `ChartSeries`, `ChartAnnotation`: the model the commands fill.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartAxis.java
 */
import { describe, expect, it } from 'vitest';
import { ChartAnnotation } from '../../../src/diagrams/chart/ChartAnnotation.js';
import { ChartAxis, LabelPosition } from '../../../src/diagrams/chart/ChartAxis.js';
import { ChartSeries, MarkerShape, SeriesType } from '../../../src/diagrams/chart/ChartSeries.js';

describe('ChartAxis', () => {
  it('starts as an autoscaled 0 to 100 with an empty title', () => {
    const axis = new ChartAxis();
    expect([axis.getTitle(), axis.getMin(), axis.getMax(), axis.isAutoScale()]).toEqual(['', 0, 100, true]);
    expect(axis.getLabelPosition()).toBe(LabelPosition.DEFAULT);
  });

  it('grows under autoScale and stops once a bound is set', () => {
    const axis = new ChartAxis();
    axis.includeValue(150);
    axis.includeValue(-5);
    expect([axis.getMin(), axis.getMax()]).toEqual([-5, 150]);
    axis.setMax(100);
    expect(axis.isAutoScale()).toBe(false);
    axis.includeValue(150);
    expect(axis.getMax()).toBe(100);
  });

  it('setMin also clears autoScale', () => {
    const axis = new ChartAxis();
    axis.setMin(3);
    expect(axis.isAutoScale()).toBe(false);
    axis.setAutoScale(true);
    expect(axis.isAutoScale()).toBe(true);
  });

  it('the titled constructor is fixed', () => {
    const axis = new ChartAxis('T', 1, 2);
    expect([axis.getTitle(), axis.getMin(), axis.getMax(), axis.isAutoScale()]).toEqual(['T', 1, 2, false]);
  });

  it('valueToPixel answers pixelMin on a zero range (ChartAxis.java:112-116)', () => {
    expect(new ChartAxis('', 5, 5).valueToPixel(9, 3, 7)).toBe(3);
    expect(new ChartAxis('', 0, 10).valueToPixel(5, 0, 400)).toBe(200);
  });

  it('hasTickSpacing means positive', () => {
    const axis = new ChartAxis();
    expect(axis.hasTickSpacing()).toBe(false);
    axis.setTickSpacing(0);
    expect(axis.hasTickSpacing()).toBe(false);
    axis.setTickSpacing(2.5);
    expect(axis.hasTickSpacing()).toBe(true);
    expect(axis.getTickSpacing()).toBe(2.5);
  });

  it('hasCustomTicks is false for none and for an empty list', () => {
    const axis = new ChartAxis();
    expect(axis.hasCustomTicks()).toBe(false);
    expect(axis.getCustomTicks()).toBeUndefined();
    axis.setCustomTicks([]);
    expect(axis.hasCustomTicks()).toBe(false);
    axis.setCustomTicks([{ value: 1, label: 'a' }]);
    expect(axis.hasCustomTicks()).toBe(true);
    expect(axis.getCustomTicks()).toEqual([{ value: 1, label: 'a' }]);
  });

  it('keeps the label position it is given', () => {
    const axis = new ChartAxis();
    axis.setLabelPosition(LabelPosition.TOP);
    expect(axis.getLabelPosition()).toBe(LabelPosition.TOP);
    axis.setTitle('x');
    expect(axis.getTitle()).toBe('x');
  });
});

describe('ChartSeries', () => {
  it('index-based copies its values, marker CIRCLE, flags off', () => {
    const values = [1, 2];
    const series = new ChartSeries('n', SeriesType.BAR, values);
    values.push(3);
    expect(series.getValues()).toEqual([1, 2]);
    expect(series.hasExplicitXValues()).toBe(false);
    expect(series.getXValues()).toBeUndefined();
    expect(series.getMarkerShape()).toBe(MarkerShape.CIRCLE);
    expect([series.isUseSecondaryAxis(), series.isShowLabels()]).toEqual([false, false]);
    expect(series.getName()).toBe('n');
    expect(series.getType()).toBe(SeriesType.BAR);
    expect(series.getColor()).toBeUndefined();
    expect(series.getStereotype()).toBeUndefined();
  });

  it('coordinate pairs have explicit x values', () => {
    const series = new ChartSeries('n', SeriesType.LINE, [2, 4], [1, 3]);
    expect(series.hasExplicitXValues()).toBe(true);
    expect(series.getXValues()).toEqual([1, 3]);
    expect(series.getValues()).toEqual([2, 4]);
  });

  it('holds its setters', () => {
    const series = new ChartSeries('n', SeriesType.SCATTER, []);
    series.setUseSecondaryAxis(true);
    series.setShowLabels(true);
    series.setMarkerShape(MarkerShape.TRIANGLE);
    expect([series.isUseSecondaryAxis(), series.isShowLabels(), series.getMarkerShape()]).toEqual([
      true,
      true,
      MarkerShape.TRIANGLE,
    ]);
  });
});

describe('ChartAnnotation', () => {
  it('xPosition is a number or a label', () => {
    const numeric = new ChartAnnotation('t', 1.5, 2, true);
    expect([numeric.getText(), numeric.getXPosition(), numeric.getYPosition(), numeric.isShowArrow()]).toEqual([
      't',
      1.5,
      2,
      true,
    ]);
    expect(new ChartAnnotation('t', 'Q1', 2, false).getXPosition()).toBe('Q1');
  });
});
