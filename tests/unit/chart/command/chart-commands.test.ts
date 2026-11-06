/**
 * The chart commands, one by one: each regex against what the jar's planning
 * probes accepted and refused, and each `executeArg` against the diagram state.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/
 */
import { describe, expect, it } from 'vitest';
import { HColorSet } from '../../../../src/core/klimt/color/HColorSet.js';
import { GridMode, type ChartDiagram } from '../../../../src/diagrams/chart/ChartDiagram.js';
import { MarkerShape, SeriesType } from '../../../../src/diagrams/chart/ChartSeries.js';
import { LabelPosition } from '../../../../src/diagrams/chart/ChartAxis.js';
import {
  javaSplitComma,
  parseCoordinatePairs,
  parseLabels,
  parseValues,
} from '../../../../src/diagrams/chart/command/chart-command-text.js';
import {
  applyChartAnnotation,
  CHART_ANNOTATION_RE,
} from '../../../../src/diagrams/chart/command/CommandChartAnnotation.js';
import { applyChartArea, CHART_AREA_RE } from '../../../../src/diagrams/chart/command/CommandChartArea.js';
import { applyChartBar, CHART_BAR_RE } from '../../../../src/diagrams/chart/command/CommandChartBar.js';
import { applyChartGrid, CHART_GRID_RE } from '../../../../src/diagrams/chart/command/CommandChartGrid.js';
import { applyChartHAxis, CHART_H_AXIS_RE } from '../../../../src/diagrams/chart/command/CommandChartHAxis.js';
import { applyChartLegend, CHART_LEGEND_RE } from '../../../../src/diagrams/chart/command/CommandChartLegend.js';
import { applyChartLine, CHART_LINE_RE } from '../../../../src/diagrams/chart/command/CommandChartLine.js';
import {
  applyChartOrientation,
  CHART_ORIENTATION_RE,
} from '../../../../src/diagrams/chart/command/CommandChartOrientation.js';
import { applyChartScatter, CHART_SCATTER_RE } from '../../../../src/diagrams/chart/command/CommandChartScatter.js';
import {
  applyChartStackMode,
  CHART_STACK_MODE_RE,
} from '../../../../src/diagrams/chart/command/CommandChartStackMode.js';
import {
  applyChartVAxis,
  CHART_V_AXIS_RE,
  parseCustomTicks,
} from '../../../../src/diagrams/chart/command/CommandChartVAxis.js';
import { emptyChartDiagram } from '../helpers/chart-diagram.js';

type Apply = (d: ChartDiagram, m: RegExpExecArray) => ReturnType<typeof applyChartBar>;

function run(d: ChartDiagram, re: RegExp, apply: Apply, line: string): ReturnType<Apply> {
  const match = re.exec(line);
  if (match === null) throw new Error(`no match: ${line}`);
  return apply(d, match);
}

/** A match carrying one group, for the `default` arms a regex cannot reach. */
function fakeMatch(groups: Record<string, string>): RegExpExecArray {
  return { groups } as unknown as RegExpExecArray;
}

const hAxis = (d: ChartDiagram, line: string) => run(d, CHART_H_AXIS_RE, applyChartHAxis, line);
const vAxis = (d: ChartDiagram, line: string) => run(d, CHART_V_AXIS_RE, applyChartVAxis, line);

describe('chart-command-text', () => {
  it('javaSplitComma drops trailing empties and answers a no-match whole', () => {
    expect(javaSplitComma('1,2,')).toEqual(['1', '2']);
    expect(javaSplitComma(',')).toEqual([]);
    expect(javaSplitComma('')).toEqual(['']);
    expect(javaSplitComma(',a')).toEqual(['', 'a']);
    expect(javaSplitComma(' ,')).toEqual([' ']);
  });

  it('parseLabels trims, unquotes, and crashes on a lone quote as Java does', () => {
    expect(parseLabels(undefined)).toEqual([]);
    expect(parseLabels('  ')).toEqual([]);
    expect(parseLabels(' A , "B C" ,')).toEqual(['A', 'B C']);
    expect(parseLabels('"",x')).toEqual(['', 'x']);
    expect(() => parseLabels('",x')).toThrow(/StringIndexOutOfBoundsException/);
  });

  it('parseValues is empty for blanks, undefined for a bad number', () => {
    expect(parseValues('  ')).toEqual([]);
    expect(parseValues('1, 2.5,')).toEqual([1, 2.5]);
    expect(parseValues('1,,2')).toBeUndefined();
    expect(parseValues('x')).toBeUndefined();
    expect(parseValues('0x1p3, 1d')).toEqual([8, 1]);
  });

  it('parseCoordinatePairs strips brackets and whitespace', () => {
    expect(parseCoordinatePairs('(1, 2), (3,4)')).toEqual({ xValues: [1, 3], yValues: [2, 4] });
    expect(parseCoordinatePairs('((1,2)')).toEqual({ xValues: [1], yValues: [2] });
    // `split` drops the trailing empty after the last `),(`.
    expect(parseCoordinatePairs('(1,2),(')).toEqual({ xValues: [1], yValues: [2] });
    expect(parseCoordinatePairs('(1,2,3)')).toBeUndefined();
    expect(parseCoordinatePairs('(a,2)')).toBeUndefined();
    expect(parseCoordinatePairs('(1,b)')).toBeUndefined();
  });
});

describe('CommandChartHAxis', () => {
  it('title, labels and label-right', () => {
    const d = emptyChartDiagram();
    expect(hAxis(d, 'h-axis "Quarters" [Q1, Q2] label-right').isOk()).toBe(true);
    expect(d.getXAxisLabels()).toEqual(['Q1', 'Q2']);
    expect(d.getXAxisTitle()).toBe('Quarters');
    expect(d.getXAxisLabelPosition()).toBe(LabelPosition.RIGHT);
  });

  it('a trailing comma draws two labels, as the planning probe', () => {
    const d = emptyChartDiagram();
    hAxis(d, 'h-axis [A,B,]');
    expect(d.getXAxisLabels()).toEqual(['A', 'B']);
  });

  it('a numeric range returns without reading DATA, spacing and grid first', () => {
    const d = emptyChartDiagram();
    hAxis(d, 'x-axis "x" -5 --> 5 [A] spacing 2 grid');
    expect([d.getXAxis().getMin(), d.getXAxis().getMax(), d.getXAxis().getTitle()]).toEqual([-5, 5, 'x']);
    expect(d.getXAxisLabels()).toEqual([]);
    expect(d.getXAxisTickSpacing()).toBe(2);
    expect(d.getXGridMode()).toBe(GridMode.MAJOR);
  });

  it('a missing title overwrites an earlier one', () => {
    const d = emptyChartDiagram();
    hAxis(d, 'h-axis "T" [A]');
    hAxis(d, 'h-axis [B]');
    expect(d.getXAxisTitle()).toBeUndefined();
  });

  it('refuses a bad range and bad spacing with Java messages', () => {
    expect(hAxis(emptyChartDiagram(), 'h-axis 1.2.3 --> 5').getError()).toBe('Invalid number format in axis range');
    expect(hAxis(emptyChartDiagram(), 'h-axis 1 --> 1.2.3').getError()).toBe('Invalid number format in axis range');
    expect(hAxis(emptyChartDiagram(), 'h-axis [A] spacing 0').getError()).toBe('X-axis spacing must be greater than 0');
    expect(hAxis(emptyChartDiagram(), 'h-axis [A] spacing 2147483648').getError()).toBe(
      'Invalid number format in spacing value',
    );
  });

  it('fixes the field order', () => {
    expect(CHART_H_AXIS_RE.test('h-axis [A] grid spacing 5')).toBe(false);
    expect(CHART_H_AXIS_RE.test('  H-AXIS  ')).toBe(true);
    expect(CHART_H_AXIS_RE.test('h-axis [A] spacing 1.5')).toBe(false);
  });

  it('accepts the arrow without its first dash and folds no unicode', () => {
    const d = emptyChartDiagram();
    hAxis(d, 'h-axis 1 -> 2');
    expect(d.getXAxis().getMax()).toBe(2);
  });
});

describe('CommandChartVAxis', () => {
  it('LABELS returns before the title, range, ticks, spacing and grid', () => {
    const d = emptyChartDiagram();
    vAxis(d, 'v-axis "T" 0 --> 5 [A, B] ticks [1:"x"] spacing 2 label-top grid');
    expect(d.getYAxisLabels()).toEqual(['A', 'B']);
    expect(d.getYAxis().getTitle()).toBe('');
    expect(d.getYAxis().isAutoScale()).toBe(true);
    expect(d.getYAxis().hasCustomTicks()).toBe(false);
    expect(d.getYGridMode()).toBe(GridMode.OFF);
  });

  it('LABELS applies to yAxisLabels even for v2-axis, creating nothing', () => {
    const d = emptyChartDiagram();
    vAxis(d, 'v2-axis [A]');
    expect(d.getYAxisLabels()).toEqual(['A']);
    expect(d.getY2Axis()).toBeUndefined();
  });

  it('v2-axis with nothing creates the axis', () => {
    const d = emptyChartDiagram();
    vAxis(d, 'y2-axis');
    expect(d.getY2Axis()?.isAutoScale()).toBe(true);
  });

  it('isSecondaryAxis is case-sensitive: V2-axis is the primary', () => {
    const d = emptyChartDiagram();
    vAxis(d, 'V2-axis 0 --> 5');
    expect(d.getY2Axis()).toBeUndefined();
    expect([d.getYAxis().getMin(), d.getYAxis().getMax()]).toEqual([0, 5]);
  });

  it('applies ticks, spacing, label-top and grid to the axis named', () => {
    const d = emptyChartDiagram();
    vAxis(d, 'v-axis "L" 0 --> 10 ticks [0:"a", 5:"b"] spacing 2.5 label-top grid');
    const y = d.getYAxis();
    expect([y.getTitle(), y.getTickSpacing(), y.getLabelPosition()]).toEqual(['L', 2.5, LabelPosition.TOP]);
    expect(y.getCustomTicks()).toEqual([
      { value: 0, label: 'a' },
      { value: 5, label: 'b' },
    ]);
    expect(d.getYGridMode()).toBe(GridMode.MAJOR);

    vAxis(d, 'v2-axis "R" 0 --> 1 ticks [1:"z"] spacing 0.5 label-top grid');
    const y2 = d.getY2Axis()!;
    expect([y2.getTitle(), y2.getMax(), y2.getTickSpacing(), y2.getLabelPosition()]).toEqual([
      'R',
      1,
      0.5,
      LabelPosition.TOP,
    ]);
    expect(y2.getCustomTicks()).toEqual([{ value: 1, label: 'z' }]);
  });

  it('refuses with Java messages', () => {
    const format = 'Invalid tick format. Expected: [value:"label", ...]';
    expect(vAxis(emptyChartDiagram(), 'v-axis 0 --> 10 ticks [0:"a,b"]').getError()).toBe(format);
    expect(vAxis(emptyChartDiagram(), 'v-axis 1.2.3 --> 10').getError()).toBe('Invalid number format in axis range');
    expect(vAxis(emptyChartDiagram(), 'v-axis spacing 0').getError()).toBe('Tick spacing must be greater than 0');
    expect(vAxis(emptyChartDiagram(), 'v-axis spacing 1.2.3').getError()).toBe(
      'Invalid number format in spacing value',
    );
  });

  it('parseCustomTicks: empty, overwrite keeps position, -0.0 apart from 0.0', () => {
    expect(parseCustomTicks('  ')).toEqual([]);
    expect(parseCustomTicks('1:"a",2:"b",1:"c"')).toEqual([
      { value: 1, label: 'c' },
      { value: 2, label: 'b' },
    ]);
    expect(parseCustomTicks('0:"a",-0:"b"')).toHaveLength(2);
    expect(parseCustomTicks('1')).toBeUndefined();
    expect(parseCustomTicks('1:a')).toBeUndefined();
    expect(parseCustomTicks('1:"')).toBeUndefined();
    expect(parseCustomTicks('x:"a"')).toBeUndefined();
  });

  it('fixes the field order', () => {
    expect(CHART_V_AXIS_RE.test('v-axis 0 --> 10 grid spacing 5')).toBe(false);
    expect(CHART_V_AXIS_RE.test('v-axis 0 --> 10 spacing 5 grid')).toBe(true);
    expect(CHART_V_AXIS_RE.test('z-axis')).toBe(false);
  });
});

describe('CommandChartBar', () => {
  it('reads stereotype, name, values, colour and labels', () => {
    const d = emptyChartDiagram();
    expect(run(d, CHART_BAR_RE, applyChartBar, 'bar <<primary>> "Revenue" [45, 62] #3498db labels').isOk()).toBe(true);
    const s = d.getSeries()[0]!;
    expect([s.getType(), s.getName(), s.getValues(), s.isShowLabels()]).toEqual([
      SeriesType.BAR,
      'Revenue',
      [45, 62],
      true,
    ]);
    expect(s.getStereotype()?.getStyleNames()).toEqual(['primary']);
    expect(s.getColor()).toEqual(HColorSet.instance().getColor('#3498db'));
  });

  it('has no v2 group', () => {
    expect(CHART_BAR_RE.test('bar [1,2] v2')).toBe(false);
  });

  it('names by series count', () => {
    const d = emptyChartDiagram();
    run(d, CHART_BAR_RE, applyChartBar, 'bar [1]');
    run(d, CHART_BAR_RE, applyChartBar, 'bar [2]');
    expect(d.getSeries().map((s) => s.getName())).toEqual(['bar0', 'bar1']);
  });

  it('reaches parseValues with pairs, and accepts blanks', () => {
    const d = emptyChartDiagram();
    expect(run(d, CHART_BAR_RE, applyChartBar, 'bar [(1,2)]').getError()).toBe('Invalid number format in bar data');
    expect(run(d, CHART_BAR_RE, applyChartBar, 'bar [ ]').isOk()).toBe(true);
    expect(d.getSeries()[0]!.getValues()).toEqual([]);
  });

  it('an unknown colour is a bad-colour result', () => {
    const result = run(emptyChartDiagram(), CHART_BAR_RE, applyChartBar, 'bar [1] #nosuchcolor');
    expect(result.getError()).toBe('No such color');
  });
});

describe('CommandChartLine', () => {
  it('reads coordinate pairs and flags', () => {
    const d = emptyChartDiagram();
    hAxis(d, 'h-axis 0 --> 5');
    expect(run(d, CHART_LINE_RE, applyChartLine, 'line [(1,2), (3,4)] #red v2 labels').isOk()).toBe(true);
    const s = d.getSeries()[0]!;
    expect([s.getXValues(), s.getValues(), s.isUseSecondaryAxis(), s.isShowLabels(), s.getName()]).toEqual([
      [1, 3],
      [2, 4],
      true,
      true,
      'line0',
    ]);
  });

  it('refuses a bad pair and a bad value', () => {
    expect(run(emptyChartDiagram(), CHART_LINE_RE, applyChartLine, 'line [(1,2,3)]').getError()).toBe(
      'Invalid coordinate pair format in line data',
    );
    expect(run(emptyChartDiagram(), CHART_LINE_RE, applyChartLine, 'line [x]').getError()).toBe(
      'Invalid number format in line data',
    );
  });

  it('reads values, an index-based series, and a bad colour', () => {
    const d = emptyChartDiagram();
    run(d, CHART_LINE_RE, applyChartLine, 'line "L" [1,2,]');
    expect(d.getSeries()[0]!.getValues()).toEqual([1, 2]);
    expect(run(d, CHART_LINE_RE, applyChartLine, 'line [1] #nosuch').getError()).toBe('No such color');
  });

  it('fixes v2 before labels', () => {
    expect(CHART_LINE_RE.test('line [1] labels v2')).toBe(false);
  });
});

describe('CommandChartArea', () => {
  it('reads values, v2 and labels; pairs fail parseValues', () => {
    const d = emptyChartDiagram();
    run(d, CHART_AREA_RE, applyChartArea, 'area "A" [1, 2] #00ff00 y2 labels');
    const s = d.getSeries()[0]!;
    expect([s.getType(), s.getName(), s.isUseSecondaryAxis(), s.isShowLabels()]).toEqual([
      SeriesType.AREA,
      'A',
      true,
      true,
    ]);
    expect(run(d, CHART_AREA_RE, applyChartArea, 'area [(1,2)]').getError()).toBe('Invalid number format in area data');
    expect(run(emptyChartDiagram(), CHART_AREA_RE, applyChartArea, 'area [1]').isOk()).toBe(true);
  });
});

describe('CommandChartScatter', () => {
  it('a leading <<triangle>> is a stereotype and the marker stays CIRCLE', () => {
    const d = emptyChartDiagram();
    run(d, CHART_SCATTER_RE, applyChartScatter, 'scatter <<triangle>> "S" [1,2]');
    const s = d.getSeries()[0]!;
    expect(s.getMarkerShape()).toBe(MarkerShape.CIRCLE);
    expect(s.getStereotype()?.getStyleNames()).toEqual(['triangle']);
  });

  it.each([
    ['triangle', MarkerShape.TRIANGLE],
    ['square', MarkerShape.SQUARE],
    ['circle', MarkerShape.CIRCLE],
    ['SQUARE', MarkerShape.SQUARE],
  ])('a trailing <<%s>> sets the shape with no stereotype', (name, shape) => {
    const d = emptyChartDiagram();
    run(d, CHART_SCATTER_RE, applyChartScatter, `scatter [1,2] <<${name}>>`);
    expect(d.getSeries()[0]!.getMarkerShape()).toBe(shape);
    expect(d.getSeries()[0]!.getStereotype()).toBeUndefined();
  });

  it('pairs, refusals and the default name', () => {
    const d = emptyChartDiagram();
    hAxis(d, 'h-axis 0 --> 5');
    run(d, CHART_SCATTER_RE, applyChartScatter, 'scatter [(1,2)] v2 labels <<square>>');
    expect(d.getSeries()[0]!.getName()).toBe('scatter0');
    expect(d.getSeries()[0]!.getXValues()).toEqual([1]);
    expect(run(d, CHART_SCATTER_RE, applyChartScatter, 'scatter [(1)]').getError()).toBe(
      'Invalid coordinate pair format in scatter data',
    );
    expect(run(d, CHART_SCATTER_RE, applyChartScatter, 'scatter [x]').getError()).toBe(
      'Invalid number format in scatter data',
    );
    expect(run(emptyChartDiagram(), CHART_SCATTER_RE, applyChartScatter, 'scatter [1] #nosuch').getError()).toBe(
      'No such color',
    );
  });
});

describe('CommandChartAnnotation', () => {
  it('reads a numeric and a categorical x', () => {
    const d = emptyChartDiagram();
    run(d, CHART_ANNOTATION_RE, applyChartAnnotation, 'annotation "a" at (1.5, 2) <<arrow>>');
    run(d, CHART_ANNOTATION_RE, applyChartAnnotation, 'annotation "b" at (Q1 , 3)');
    const [a, b] = d.getAnnotations();
    expect([a!.getText(), a!.getXPosition(), a!.getYPosition(), a!.isShowArrow()]).toEqual(['a', 1.5, 2, true]);
    expect([b!.getText(), b!.getXPosition(), b!.getYPosition(), b!.isShowArrow()]).toEqual(['b', 'Q1', 3, false]);
  });

  it('refuses a non-numeric y', () => {
    const result = run(emptyChartDiagram(), CHART_ANNOTATION_RE, applyChartAnnotation, 'annotation "a" at (A, b)');
    expect(result.getError()).toBe('Y position must be a numeric value: b');
  });
});

describe('the small commands', () => {
  it.each([
    ['left', 'LEFT'],
    ['RIGHT', 'RIGHT'],
    ['top', 'TOP'],
    ['bottom', 'BOTTOM'],
  ])('legend %s', (word, position) => {
    const d = emptyChartDiagram();
    run(d, CHART_LEGEND_RE, applyChartLegend, `legend ${word}`);
    expect(d.getLegendPosition()).toBe(position);
  });

  it('a bare legend does not match, and the default arms answer Java text', () => {
    expect(CHART_LEGEND_RE.test('legend')).toBe(false);
    expect(applyChartLegend(emptyChartDiagram(), fakeMatch({ POSITION: 'x' })).getError()).toBe(
      'Invalid legend position: x',
    );
    expect(applyChartStackMode(emptyChartDiagram(), fakeMatch({ MODE: 'x' })).getError()).toBe('Invalid stack mode: x');
    expect(applyChartOrientation(emptyChartDiagram(), fakeMatch({ ORIENTATION: 'x' })).getError()).toBe(
      'Invalid orientation: x',
    );
  });

  it('stackMode and orientation', () => {
    const d = emptyChartDiagram();
    run(d, CHART_STACK_MODE_RE, applyChartStackMode, 'stackMode stacked');
    expect(d.getStackMode()).toBe('STACKED');
    run(d, CHART_STACK_MODE_RE, applyChartStackMode, 'STACKMODE GROUPED');
    expect(d.getStackMode()).toBe('GROUPED');
    run(d, CHART_ORIENTATION_RE, applyChartOrientation, 'orientation horizontal');
    expect(d.getOrientation()).toBe('HORIZONTAL');
    run(d, CHART_ORIENTATION_RE, applyChartOrientation, 'orientation vertical');
    expect(d.getOrientation()).toBe('VERTICAL');
  });

  it('CommandChartGrid works, case-sensitively, though it is not registered', () => {
    const d = emptyChartDiagram();
    run(d, CHART_GRID_RE, applyChartGrid, 'grid h-axis');
    expect(d.getXGridMode()).toBe('MAJOR');
    run(d, CHART_GRID_RE, applyChartGrid, 'grid y-axis');
    expect(d.getYGridMode()).toBe('MAJOR');
    expect(run(d, CHART_GRID_RE, applyChartGrid, 'grid H-axis').getError()).toBe('Invalid axis: H-axis');
  });
});
