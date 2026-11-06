/**
 * `CommandChartVAxis`: `v-axis`, `y-axis`, `v2-axis` or `y2-axis`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/CommandChartVAxis.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { javaTrim, parseDouble } from '../../../core/java-number-format.js';
import { LabelPosition, type ChartAxis, type ChartTick } from '../ChartAxis.js';
import { GridMode, type ChartDiagram } from '../ChartDiagram.js';
import { bracketGroup, javaSplitComma, parseLabels, RANGE_PART, SP0, SP1, TITLE_PART } from './chart-command-text.js';

/** @see CommandChartVAxis.java:61-86 */
export const CHART_V_AXIS_RE = new RegExp(
  `^${SP0}(?<AXIS>[vy]2?-axis)${SP0}${TITLE_PART}${SP0}${RANGE_PART}${SP0}(?:\\[(?<LABELS>[^\\]]+)\\])?${SP0}` +
    `(?:ticks${SP1}${bracketGroup('TICKS')})?${SP0}(?:spacing${SP1}(?<SPACING>[0-9.]+))?${SP0}` +
    `(?:(?<LABELTOP>label-top))?${SP0}(?:(?<GRID>grid))?${SP0}$`,
  'i',
);

/** Case-sensitive after a case-insensitive regex: `V2-axis` configures the primary axis. @see CommandChartVAxis.java:198-200 */
function isSecondaryAxis(axisType: string): boolean {
  return axisType.startsWith('v2') || axisType.startsWith('y2');
}

/** `ticks.put`: a `LinkedHashMap` overwrite keeps the first position, and `Double#equals` is `Object.is` (D6). */
function putTick(ticks: ChartTick[], tick: ChartTick): void {
  const at = ticks.findIndex((t) => Object.is(t.value, tick.value));
  if (at < 0) ticks.push(tick);
  else ticks[at] = tick;
}

/**
 * `[value:"label", ...]`, split on every comma, so a label with a comma fails.
 * `undefined` for Java's `null`.
 * @see CommandChartVAxis.java:219-252
 */
export function parseCustomTicks(ticksStr: string): ChartTick[] | undefined {
  const ticks: ChartTick[] = [];
  if (javaTrim(ticksStr) === '') return ticks;

  for (const rawPair of javaSplitComma(ticksStr)) {
    const pair = javaTrim(rawPair);
    const colonIndex = pair.indexOf(':');
    if (colonIndex < 0) return undefined;
    const label = javaTrim(pair.slice(colonIndex + 1));
    if (!label.startsWith('"') || !label.endsWith('"') || label.length <= 1) return undefined;
    const value = parseDouble(javaTrim(pair.slice(0, colonIndex)));
    if (value === undefined) return undefined;
    putTick(ticks, { value, label: label.slice(1, -1) });
  }
  return ticks;
}

/** The range, ticks and spacing the line carries, or the message it fails with. */
interface ParsedVAxis {
  readonly min: number | undefined;
  readonly max: number | undefined;
  readonly customTicks: readonly ChartTick[] | undefined;
  readonly tickSpacing: number | undefined;
}

/** @see CommandChartVAxis.java:115-147 */
function parseVAxisFields(g: Readonly<Record<string, string | undefined>>): ParsedVAxis | string {
  let min: number | undefined = undefined;
  let max: number | undefined = undefined;
  if (g['RANGE_0'] !== undefined && g['RANGE_1'] !== undefined) {
    min = parseDouble(g['RANGE_0']);
    max = parseDouble(g['RANGE_1']);
    if (min === undefined || max === undefined) return 'Invalid number format in axis range';
  }

  let customTicks: readonly ChartTick[] | undefined = undefined;
  if (g['TICKS'] !== undefined) {
    customTicks = parseCustomTicks(g['TICKS']);
    if (customTicks === undefined) return 'Invalid tick format. Expected: [value:"label", ...]';
  }

  let tickSpacing: number | undefined = undefined;
  if (g['SPACING'] !== undefined) {
    tickSpacing = parseDouble(g['SPACING']);
    if (tickSpacing === undefined) return 'Invalid number format in spacing value';
    if (tickSpacing <= 0) return 'Tick spacing must be greater than 0';
  }
  return { min, max, customTicks, tickSpacing };
}

/**
 * `LABELS` returns before the title, range, ticks, spacing, `label-top` and
 * `grid` are read, and fills `yAxisLabels` even for `v2-axis`.
 * @see CommandChartVAxis.java:97-196
 */
export function applyChartVAxis(diagram: ChartDiagram, match: RegExpExecArray): CommandExecutionResult {
  const g = match.groups!;
  if (g['LABELS'] !== undefined) return diagram.setYAxisLabels(parseLabels(g['LABELS']));

  const fields = parseVAxisFields(g);
  if (typeof fields === 'string') return CommandExecutionResult.error(fields);

  const secondary = isSecondaryAxis(g['AXIS']!);
  const result = secondary
    ? diagram.setY2Axis(g['TITLE'], fields.min, fields.max)
    : diagram.setYAxis(g['TITLE'], fields.min, fields.max);
  // `getY2Axis() != null` upstream holds here: `setY2Axis` above has just created it.
  const axis: ChartAxis = secondary ? diagram.getY2Axis()! : diagram.getYAxis();

  if (fields.customTicks !== undefined) axis.setCustomTicks(fields.customTicks);
  if (fields.tickSpacing !== undefined) axis.setTickSpacing(fields.tickSpacing);
  if (g['LABELTOP'] !== undefined) axis.setLabelPosition(LabelPosition.TOP);
  if (g['GRID'] !== undefined) diagram.setYGridMode(GridMode.MAJOR);

  return result;
}
