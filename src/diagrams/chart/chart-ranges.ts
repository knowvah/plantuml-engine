/**
 * `ChartDiagram.checkFinalError`'s range checks (3a4d96cb3, plantuml/plantuml#3030):
 * an automatic range is fitted to the values (`ChartAxis#withNiceRange`), and values
 * near the limits of a double can make it infinite (a stack of 1e308 + 1e308, a
 * spread from -1.7e308 to 1.7e308); every renderer would then place its values at
 * NaN. A range written on the axis line is checked there (`checkRange`), but a stack
 * can still overflow against it: `StackLayout` gives the renderers an infinite top.
 * Split out of `ChartDiagram.ts` under the 500-line hook; each Java method keeps its
 * name and takes the diagram fields it reads.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartDiagram.java:664-709
 */
import type { CartesianChart } from './CartesianChart.js';
import { isInfinite, type ChartAxis } from './ChartAxis.js';
import { StackMode } from './chart-modes.js';
import { Kind } from './chart-polar.js';
import { SeriesType, type ChartSeries } from './ChartSeries.js';
import type { RadarChart } from './RadarChart.js';
import { StackLayout } from './StackLayout.js';

/** @see ChartDiagram.java:709 */
export const TOO_LARGE = 'The values are too large to be drawn';

/** What `checkAutomaticRanges` reads of the diagram: `ChartDiagram` itself. */
export interface AutomaticRangeState {
  getKind(): Kind | undefined;
  getSeries(): readonly ChartSeries[];
  getY2Axis(): ChartAxis | undefined;
  getStackMode(): StackMode;
  resolveRadar(): RadarChart;
  resolveCartesian(): CartesianChart;
}

/** @see ChartDiagram.java:670-685 */
export function checkAutomaticRanges(d: AutomaticRangeState): string | undefined {
  const kind = d.getKind();
  if (kind === Kind.PIE) return undefined;
  if (kind === Kind.RADAR) return d.resolveRadar().axis.isDrawable() ? undefined : TOO_LARGE;
  if (!hasFiniteStacks(d, false) || !hasFiniteStacks(d, true)) return TOO_LARGE;
  const chart = d.resolveCartesian();
  if (!chart.getNumericAxis()!.isDrawable() || !chart.getValueAxis().isDrawable()) return TOO_LARGE;
  const valueAxis2 = chart.getValueAxis2();
  if (valueAxis2 !== undefined && !valueAxis2.isDrawable()) return TOO_LARGE;
  return undefined;
}

/**
 * Whether every stack drawn against the primary (or secondary) value axis has a
 * finite top. Areas are always stacked, bars only in stacked mode, as in `getValueAxis`.
 * @see ChartDiagram.java:687-699
 */
function hasFiniteStacks(d: AutomaticRangeState, secondary: boolean): boolean {
  const bars: ChartSeries[] = [];
  const areas: ChartSeries[] = [];
  const hasY2Axis = d.getY2Axis() !== undefined;
  for (const s of d.getSeries())
    if ((s.isUseSecondaryAxis() && hasY2Axis) === secondary)
      if (s.getType() === SeriesType.BAR) bars.push(s);
      else if (s.getType() === SeriesType.AREA) areas.push(s);
  if (d.getStackMode() === StackMode.STACKED && !hasFiniteTops(StackLayout.bars(bars), bars)) return false;
  return hasFiniteTops(StackLayout.areas(areas), areas);
}

/** @see ChartDiagram.java:701-707 */
function hasFiniteTops(stack: StackLayout, series: readonly ChartSeries[]): boolean {
  for (const [s, one] of series.entries())
    for (let i = 0; i < one.getValues().length; i++)
      if (stack.has(s, i) && isInfinite(stack.getTop(s, i))) return false;
  return true;
}
