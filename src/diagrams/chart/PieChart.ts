/**
 * PieChart — a pie (or a donut) once resolved: one slice per value above 0,
 * named by its key or by the a-axis label at its index, with its share of the
 * total. Built by `ChartDiagram#resolvePie`, read by `PieRenderer`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/PieChart.java
 */
import { javaFormatF } from '../../core/java-number-format.js';
import type { LegendPosition } from './chart-modes.js';
import type { ChartSeries } from './ChartSeries.js';
import { formatValue } from './ChartTicks.js';

/** `%.1f` of a share. @see PieChart.java:145 */
const PERCENT_DECIMALS = 1;
/** A whole share. @see PieChart.java:123 */
const HUNDRED = 100;

/** A slice: its name (`undefined` without one), its value, and its index, which gives its colour. @see PieChart.java:58-81 */
export interface Slice {
  readonly name: string | undefined;
  readonly value: number;
  readonly index: number;
}

export class PieChart {
  private readonly slices: Slice[] = [];
  private readonly total: number;

  /** @see PieChart.java:83-101 */
  constructor(
    private readonly series: ChartSeries,
    angularLabels: readonly string[],
    private readonly legendPosition: LegendPosition,
  ) {
    let sum = 0;
    const keys = series.getKeys();
    for (const [i, value] of series.getValues().entries()) {
      if (value === undefined || value <= 0) continue;
      const name = keys !== undefined ? keys[i] : i < angularLabels.length ? angularLabels[i] : undefined;
      this.slices.push({ name, value, index: i });
      sum += value;
    }
    this.total = sum;
  }

  getSeries(): ChartSeries {
    return this.series;
  }

  getLegendPosition(): LegendPosition {
    return this.legendPosition;
  }

  getSlices(): readonly Slice[] {
    return this.slices;
  }

  getTotal(): number {
    return this.total;
  }

  /** The share of a slice, from 0 to 100. @see PieChart.java:122-124 */
  getPercent(slice: Slice): number {
    return (HUNDRED * slice.value) / this.total;
  }

  /** The label `labels` and `percent` ask for, or `undefined`. @see PieChart.java:130-139 */
  getLabel(slice: Slice): string | undefined {
    const { series } = this;
    if (!series.isShowLabels() && !series.isShowPercent()) return undefined;
    const percent = formatPercent(this.getPercent(slice));
    if (series.isShowLabels() && series.isShowPercent()) return `${formatValue(slice.value)} (${percent})`;
    if (series.isShowLabels()) return formatValue(slice.value);
    return percent;
  }
}

/** A share with one decimal at most: 33.3%, 50%, 0.4%. @see PieChart.java:144-147 */
export function formatPercent(percent: number): string {
  const s = javaFormatF(percent, PERCENT_DECIMALS);
  return `${s.endsWith('.0') ? s.substring(0, s.length - 2) : s}%`;
}
