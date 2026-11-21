/**
 * StackLayout — where each value of stacked series lies, in values: for the
 * i-th value of the s-th series, the segment from its base to its top. Stacked
 * bars pile positive values from 0 upwards and negative ones downwards, apart;
 * areas put each value on the previous series' at the same index, whatever the
 * sign. A missing value has no segment. The value axes (`ChartDiagram`) and the
 * renderers read the same layout, so a stack always fits its axis.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/StackLayout.java
 */
import type { ChartSeries } from './ChartSeries.js';

export class StackLayout {
  /** `bases[s][i]` is `undefined` when the value is missing. @see StackLayout.java:53-54 */
  private readonly bases: (number | undefined)[][] = [];
  private readonly tops: (number | undefined)[][] = [];
  /** Areas only: whether a series before the s-th has a value at index i. @see StackLayout.java:56 */
  private readonly onPrevious: boolean[][] = [];

  private constructor() {}

  /** @see StackLayout.java:64-89 */
  static bars(series: readonly ChartSeries[]): StackLayout {
    const result = new StackLayout();
    const up: number[] = [];
    const down: number[] = [];
    for (const s of series) {
      const base: (number | undefined)[] = [];
      const top: (number | undefined)[] = [];
      for (const [i, value] of s.getValues().entries()) {
        if (value === undefined) {
          base.push(undefined);
          top.push(undefined);
          continue;
        }
        const totals = value >= 0 ? up : down;
        base.push(get(totals, i));
        top.push(addAt(totals, i, value));
      }
      result.bases.push(base);
      result.tops.push(top);
    }
    return result;
  }

  /** @see StackLayout.java:94-129 */
  static areas(series: readonly ChartSeries[]): StackLayout {
    const result = new StackLayout();
    const totals: number[] = [];
    const reached: boolean[] = [];
    for (const s of series) {
      const base: (number | undefined)[] = [];
      const top: (number | undefined)[] = [];
      const previous: boolean[] = [];
      const values = s.getValues();
      for (const [i, value] of values.entries()) {
        previous.push(i < reached.length && reached[i]!);
        base.push(value === undefined ? undefined : get(totals, i));
        top.push(value === undefined ? undefined : addAt(totals, i, value));
      }
      markReached(reached, values);
      result.bases.push(base);
      result.tops.push(top);
      result.onPrevious.push(previous);
    }
    return result;
  }

  /** @see StackLayout.java:134-136 */
  has(s: number, i: number): boolean {
    return i < this.tops[s]!.length && this.tops[s]![i] !== undefined;
  }

  /** @see StackLayout.java:141-143 */
  getBase(s: number, i: number): number {
    return this.bases[s]![i]!;
  }

  /** @see StackLayout.java:149-151 */
  getTop(s: number, i: number): number {
    return this.tops[s]![i]!;
  }

  /**
   * Areas only: the base of each value of the s-th series, or `undefined` where no
   * previous series has a value; `undefined` as a whole for the first series.
   * @see StackLayout.java:158-165
   */
  getAreaBaseline(s: number): (number | undefined)[] | undefined {
    if (s === 0) return undefined;
    return this.onPrevious[s]!.map((on, i) => (on ? get(this.bases[s]!, i) : undefined));
  }
}

/** @see StackLayout.java:119-124 */
function markReached(reached: boolean[], values: readonly (number | undefined)[]): void {
  for (const [i, value] of values.entries()) {
    if (value === undefined) continue;
    while (reached.length <= i) reached.push(false);
    reached[i] = true;
  }
}

/** @see StackLayout.java:167-171 */
function get(totals: readonly (number | undefined)[], index: number): number {
  if (index >= totals.length || totals[index] === undefined) return 0;
  return totals[index];
}

/** @see StackLayout.java:173-179 */
function addAt(totals: number[], index: number, value: number): number {
  while (totals.length <= index) totals.push(0.0);
  const result = totals[index]! + value;
  totals[index] = result;
  return result;
}
