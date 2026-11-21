/**
 * RadarChart — a radar once resolved: its categories around the circle, each
 * series' value per category (`undefined` when missing), and its radial scale
 * fitted to the data. Built by `ChartDiagram#resolveRadar`, read by `RadarRenderer`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/RadarChart.java
 */
import type { ChartAxis } from './ChartAxis.js';
import type { LegendPosition } from './chart-modes.js';
import type { ChartSeries, ChartValue } from './ChartSeries.js';

/** @see RadarChart.java:46-61 */
export interface RadarChart {
  readonly categories: readonly string[];
  /** For each series, its value for each category. */
  readonly values: readonly (readonly ChartValue[])[];
  readonly series: readonly ChartSeries[];
  readonly axis: ChartAxis;
  readonly circleGrid: boolean;
  readonly legendPosition: LegendPosition;
}
