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

  it('withNiceRange fits 0 and the data to start + 5 * step (2117ccb43cd)', () => {
    const axis = new ChartAxis();
    const range = (lo: number, hi: number): number[] => {
      const fitted = axis.withNiceRange(lo, hi);
      return [fitted.getMin(), fitted.getMax()];
    };
    expect(range(0, 38)).toEqual([0, 40]);
    expect(range(0, 138)).toEqual([0, 150]);
    expect(range(-20, 70)).toEqual([-20, 80]);
    expect(range(0, 0.7)).toEqual([0, 1]);
    expect(range(5, 5)).toEqual([0, 5]);
    expect(range(0, 12)).toEqual([0, 15]);
    expect(range(0, 0)).toEqual([0, 100]);
    expect(axis.withNiceRange(0, 38).isAutoScale()).toBe(false);
  });

  it('withNiceRange stops on an unusable magnitude and throws (plantuml/plantuml#3030, efe6d85e5f3)', () => {
    const messageOf = (lo: number, hi: number): string => {
      try {
        new ChartAxis().withNiceRange(lo, hi);
        return 'no throw';
      } catch (e) {
        return (e as Error).message;
      }
    };
    const prefix = 'IllegalArgumentException: No axis range for values from';
    expect(messageOf(0, Number.POSITIVE_INFINITY)).toBe(`${prefix} 0.0 to Infinity`);
    expect(messageOf(Number.NaN, 1)).toBe(`${prefix} NaN to 1.0`);
    expect(messageOf(-1.7e308, 1)).toBe(`${prefix} -1.7E308 to 1.0`);
    expect(messageOf(-1.7e308, 1.7e308)).toBe(`${prefix} -1.7E308 to 1.7E308`);
    expect(messageOf(4.9e-324, 4.9e-324)).toBe(`${prefix} 4.9E-324 to 4.9E-324`);
    const max = new ChartAxis().withNiceRange(0, Number.MAX_VALUE);
    expect(max.getMax()).toBeGreaterThanOrEqual(Number.MAX_VALUE);
  });

  it('withRange keeps the title, ticks, spacing and label position', () => {
    const axis = new ChartAxis('T', 0, 1);
    axis.setCustomTicks([{ value: 0.5, label: 'half' }]);
    axis.setTickSpacing(0.25);
    axis.setLabelPosition(LabelPosition.TOP);
    const copy = axis.withRange(2, 3);
    expect([copy.getTitle(), copy.getMin(), copy.getMax(), copy.getTickSpacing()]).toEqual(['T', 2, 3, 0.25]);
    expect([copy.getCustomTicks(), copy.getLabelPosition()]).toEqual([[{ value: 0.5, label: 'half' }], 'TOP']);
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
