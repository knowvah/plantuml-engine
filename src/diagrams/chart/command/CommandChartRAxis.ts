/**
 * `CommandChartRAxis` — the radial scale of a radar (e8ef39dd55c):
 * `r-axis 0 --> 5 spacing 1 grid circle`, `r-axis 0 --> 100 ticks [50: "Mid"]`.
 * The rings are always drawn; `grid polygon` (the default) or `grid circle` gives
 * their shape, compared case-sensitively after a case-insensitive regex.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartRAxis.java
 */
import * as ChartNumber from './ChartNumber.js';
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { ChartTick } from '../ChartAxis.js';
import type { ChartDiagram } from '../ChartDiagram.js';
import { bracketGroup, RANGE_PART, SP0, SP1 } from './chart-command-text.js';
import { parseCustomTicks } from './CommandChartVAxis.js';

/** @see CommandChartRAxis.java:70-90 */
export const CHART_R_AXIS_RE = new RegExp(
  `^${SP0}r-axis${SP0}${RANGE_PART}${SP0}(?:ticks${SP1}${bracketGroup('TICKS')})?${SP0}` +
    `(?:spacing${SP1}(?<SPACING>[0-9.]+))?${SP0}(?:grid(?:${SP1}(?<GRID>circle|polygon))?)?${SP0}$`,
  'i',
);

/** @see CommandChartRAxis.java:99-138 */
export function applyChartRAxis(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  let min: number | undefined = undefined;
  let max: number | undefined = undefined;
  if (g['RANGE_0'] !== undefined && g['RANGE_1'] !== undefined) {
    min = ChartNumber.parse(g['RANGE_0']);
    max = ChartNumber.parse(g['RANGE_1']);
    if (min === undefined || max === undefined)
      return CommandExecutionResult.error('Invalid number format in axis range');
  }
  const ticks = ticksOf(g['TICKS']);
  if (typeof ticks === 'string') return CommandExecutionResult.error(ticks);
  const tickSpacing = spacingOf(g['SPACING']);
  if (typeof tickSpacing === 'string') return CommandExecutionResult.error(tickSpacing);
  const circleGrid = g['GRID'] === undefined ? undefined : g['GRID'] === 'circle';
  return diagram.setRadialAxis({ min, max, customTicks: ticks, tickSpacing, circleGrid });
}

/** @see CommandChartRAxis.java:115-120 */
function ticksOf(ticksStr: string | undefined): readonly ChartTick[] | undefined | string {
  if (ticksStr === undefined) return undefined;
  return parseCustomTicks(ticksStr) ?? 'Invalid tick format. Expected: [value:"label", ...]';
}

/** @see CommandChartRAxis.java:122-131 */
function spacingOf(spacingStr: string | undefined): number | undefined | string {
  if (spacingStr === undefined) return undefined;
  const spacing = ChartNumber.parse(spacingStr);
  if (spacing === undefined) return 'Invalid number format in spacing value';
  if (spacing <= 0) return 'Tick spacing must be greater than 0';
  return spacing;
}
