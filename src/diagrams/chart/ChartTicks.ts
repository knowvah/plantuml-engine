/**
 * ChartTicks — the ticks of a chart's axes and how their values are written.
 * They depend only on the axes: every renderer places its ticks at the same
 * values with the same labels.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartTicks.java
 */
import { isLongValued, javaFormatE, javaFormatF, javaFormatLong } from '../../core/java-number-format.js';
import { isInfinite, type ChartAxis } from './ChartAxis.js';

/** The intervals the automatic ticks of a value axis draw. @see ChartTicks.java:51 */
const TICK_INTERVALS = 5;
/** About ten numeric h-axis ticks without a spacing. @see ChartTicks.java:153 */
const NUMERIC_DIVISIONS = 10.0;
/** `spacing * 0.01`, the loops' floating-point tolerance. @see ChartTicks.java:105, 157 */
const TOLERANCE = 0.01;
/** Below this magnitude a non-zero value prints with an exponent. @see ChartTicks.java:171 */
const EXPONENT_BELOW = 0.01;
/** `%.2e`. @see ChartTicks.java:172 */
const EXPONENT_DECIMALS = 2;
/** `%.2f` in `formatValue`. @see ChartTicks.java:175 */
const VALUE_DECIMALS = 2;
/** `%.1f` in `formatNumericValue`. @see ChartTicks.java:184 */
const NUMERIC_DECIMALS = 1;

/** A tick: its value, its position from 0 (min) to 1 (max), and its label. @see ChartTicks.java:60-84 */
export interface Tick {
  readonly value: number;
  readonly ratio: number;
  readonly label: string;
}

/**
 * A vertical value axis: custom ticks if defined, else every spacing, else five
 * automatic intervals.
 * @see ChartTicks.java:89-117
 */
export function valueTicks(axis: ChartAxis): Tick[] {
  const range = axis.getMax() - axis.getMin();
  if (axis.hasCustomTicks()) {
    const result: Tick[] = [];
    for (const { value, label } of axis.getCustomTicks()!) {
      const ratio = (value - axis.getMin()) / range;
      if (ratio >= 0 && ratio <= 1) result.push({ value, ratio, label });
    }
    return result;
  }
  if (axis.hasTickSpacing()) return spacedTicks(axis, range);
  return Array.from({ length: TICK_INTERVALS + 1 }, (_, i) => {
    const value = tickValue(axis, range, i);
    return { value, ratio: i / TICK_INTERVALS, label: formatValue(value) };
  });
}

/**
 * The i-th automatic tick. `range * i` overflows above `Double.MAX_VALUE / 5` (an
 * axis fitted to -1.7e308 and 1): `range / 5 * i` is used in that case only, so
 * ordinary ticks keep their exact values (3a4d96cb3).
 * @see ChartTicks.java:126-131
 */
function tickValue(axis: ChartAxis, range: number, i: number): number {
  const scaled = range * i;
  if (isInfinite(scaled)) return axis.getMin() + (range / TICK_INTERVALS) * i;
  return axis.getMin() + scaled / TICK_INTERVALS;
}

/** The spacing arm. @see ChartTicks.java:99-108 */
function spacedTicks(axis: ChartAxis, range: number): Tick[] {
  const result: Tick[] = [];
  const spacing = axis.getTickSpacing()!;
  const startValue = Math.ceil(axis.getMin() / spacing) * spacing;
  for (let value = startValue; value <= axis.getMax(); value += spacing) {
    // Upstream's floating-point guard, unreachable under the loop's own test.
    if (value > axis.getMax() + spacing * TOLERANCE) break;
    result.push({ value, ratio: (value - axis.getMin()) / range, label: formatValue(value) });
  }
  return result;
}

/** A horizontal chart's value axis: five automatic intervals, written `%.0f`. @see ChartTicks.java:133-141 */
export function horizontalValueTicks(axis: ChartAxis): Tick[] {
  const range = axis.getMax() - axis.getMin();
  return Array.from({ length: TICK_INTERVALS + 1 }, (_, i) => {
    const value = tickValue(axis, range, i);
    return { value, ratio: i / TICK_INTERVALS, label: javaFormatF(value, 0) };
  });
}

/**
 * A numeric h-axis (coordinate pairs, or an h-axis range): one every spacing when
 * given, else about ten, from a multiple of the interval.
 * @see ChartTicks.java:148-163
 */
export function numericTicks(axis: ChartAxis | undefined, spacing: number | undefined): Tick[] {
  if (axis === undefined) return [];
  const result: Tick[] = [];
  const range = axis.getMax() - axis.getMin();
  const tickInterval = spacing !== undefined && spacing > 0 ? spacing : range / NUMERIC_DIVISIONS;
  const startValue = Math.floor(axis.getMin() / tickInterval) * tickInterval;
  const tolerance = tickInterval * TOLERANCE;
  for (let value = startValue; value <= axis.getMax() + tolerance; value += tickInterval) {
    if (value < axis.getMin() - tolerance || value > axis.getMax() + tolerance) continue;
    result.push({ value, ratio: (value - axis.getMin()) / range, label: formatNumericValue(value) });
  }
  return result;
}

/**
 * A value on a value axis: trailing zeros dropped, 0.80 written 0.8 (2117ccb43cd).
 * `replaceAll("0+$", "")` keeps a trailing dot (99.999 gives "100.").
 * @see ChartTicks.java:170-176
 */
export function formatValue(value: number): string {
  if (Math.abs(value) < EXPONENT_BELOW && value !== 0) return javaFormatE(value, EXPONENT_DECIMALS);
  if (isLongValued(value)) return javaFormatLong(value);
  return javaFormatF(value, VALUE_DECIMALS).replace(/0+$/, '');
}

/** A value on a numeric h-axis: one decimal at most. @see ChartTicks.java:179-185 */
function formatNumericValue(value: number): string {
  if (Math.abs(value) < EXPONENT_BELOW && value !== 0) return javaFormatE(value, EXPONENT_DECIMALS);
  if (isLongValued(value)) return javaFormatLong(value);
  return javaFormatF(value, NUMERIC_DECIMALS);
}
