/**
 * ChartDiagram — one `@startchart` block: the axes, the series and the plot
 * annotations the commands fill. `annotations` holds the chrome, as every klimt
 * diagram's does, so the plot list is `chartAnnotations`, with upstream's
 * `getAnnotations` and `addAnnotation` (D3).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartDiagram.java
 */
import { createAnnotations, type DiagramAnnotations } from '../../core/annotations/index.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import type { ScaleSpec } from '../../core/scale-command.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import { TitledDiagram } from '../../core/TitledDiagram.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { UmlSource } from '../../core/TitledDiagram.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import type { ChartAnnotation } from './ChartAnnotation.js';
import { ChartAxis, LabelPosition } from './ChartAxis.js';
import {
  checkCartesianKey,
  checkCartesianKeys,
  checkCoordinatePairs,
  checkSameFormat,
  ERROR_KEYS_NEED_CATEGORIES,
  ERROR_PAIRS_NEED_NUMERIC,
  ERROR_SAME_FORMAT,
  checkRange,
  type CartesianCheckState,
} from './chart-checks.js';
import {
  ChartKind,
  checkFinalPie,
  ERROR_ONE_PIE,
  isPolar,
  Kind,
  keywordOf,
  kindOf,
  PolarAxes,
  type RadialAxisSettings,
} from './chart-polar.js';
import type { PieChart } from './PieChart.js';
import { PieRenderer } from './PieRenderer.js';
import type { RadarChart } from './RadarChart.js';
import { RadarRenderer } from './RadarRenderer.js';
import { SeriesType, type ChartSeries, type ChartValue } from './ChartSeries.js';
import type { HColor } from '../../core/style/Value.js';
import type { CartesianChart } from './CartesianChart.js';
import { hasCoordinatePairs, resolveCartesian } from './chart-resolve.js';
import { checkAutomaticRanges } from './chart-ranges.js';
import { GridMode, LegendPosition, Orientation, StackMode } from './chart-modes.js';
import { ChartRenderer } from './ChartRenderer.js';
import type { SkinParam } from './chart-skin-param.js';

export { GridMode, LegendPosition, Orientation, StackMode } from './chart-modes.js';
export { Kind, type RadialAxisSettings } from './chart-polar.js';

/** @see ChartDiagram.java:686-687 */
const ERROR_RANGE_AFTER_PAIRS = 'h-axis range must be given before coordinate pair data';
/** @see ChartDiagram.java:610-611 */
const ERROR_ITEM_WITHOUT_SERIES = 'A list item must follow a series written without data, as in: pie "Air"';
/** @see ChartDiagram.java:613 */
const ERROR_MIXED_KEYS = 'Either every value has a key (key: value), or none has';
/** The skin param is built by the factory and passed in, as `WBSDiagram`'s is. */
export class ChartDiagram extends TitledDiagram implements TextBlock {
  private readonly xAxisLabels: string[] = [];
  private xAxisTitle: string | undefined = undefined;
  private xAxisTickSpacing: number | undefined = undefined;
  private xAxisLabelPosition: LabelPosition = LabelPosition.DEFAULT;
  /** For numeric x-axis (horizontal bar charts). @see ChartDiagram.java:74 */
  private readonly xAxis = new ChartAxis();
  private readonly yAxisLabels: string[] = [];
  private readonly series: ChartSeries[] = [];
  private readonly yAxis = new ChartAxis();
  private y2Axis: ChartAxis | undefined = undefined;
  private legendPosition: LegendPosition = LegendPosition.NONE;
  private xGridMode: GridMode = GridMode.OFF;
  private yGridMode: GridMode = GridMode.OFF;
  private stackMode: StackMode = StackMode.GROUPED;
  private orientation: Orientation = Orientation.VERTICAL;
  /** Upstream's `annotations` (D3). @see ChartDiagram.java:84 */
  private readonly chartAnnotations: ChartAnnotation[] = [];
  private readonly skinParam: SkinParam;
  /** The series written without data, which takes the list items after it. @see ChartDiagram.java:113 */
  private openedSeries: ChartSeries | undefined = undefined;
  /** `angularLabels`, `radialAxis`, `radarCircleGrid`. @see ChartDiagram.java:105-108 */
  private readonly polar = new PolarAxes();
  /** `kind` and `kindKeyword`. @see ChartDiagram.java:110-111 */
  private readonly kind = new ChartKind();
  /** `TitledDiagram`'s title/caption/legend/header/footer/mainframe, read by the chrome step. */
  readonly annotations: DiagramAnnotations = createAnnotations();
  /** `CommandScale*`'s target (`UmlDiagram#setScale`), as `WBSDiagram.ts` has it. */
  scale: ScaleSpec | undefined = undefined;

  /** @see ChartDiagram.java:90-92 */
  constructor(source: UmlSource, preprocessing: PreprocessingArtifact, skinParam: SkinParam) {
    super(source, 'CHART', undefined, preprocessing);
    this.skinParam = skinParam;
  }

  getSkinParam(): SkinParam {
    return this.skinParam;
  }

  /**
   * `skinParam.handwritten()`, else `!option handwritten` through the artifact.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/TitledDiagram.java:114-118
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/UgDiagram.java:117-121
   */
  isHandwritten(): boolean {
    if (this.skinParam.getValue('handwritten')?.toLowerCase() === 'true') return true;
    return this.preprocessing.getOptions().get(OptionKey.HANDWRITTEN)?.toLowerCase() === 'true';
  }

  /** The skin param's sprites, read by the sprite commands and the chrome step. */
  get sprites(): SpriteRegistry {
    return this.skinParam.getSprites();
  }

  /** @see ChartDiagram.java:86-88 */
  getDescription(): string {
    return 'Chart Diagram';
  }

  /** Upstream's anonymous `TextBlock`; the diagram itself, as `WBSDiagram`'s. @see ChartDiagram.java:333-345 */
  getTextBlock(): TextBlock {
    return this;
  }

  /** @see ChartDiagram.java:123-130 */
  drawU(ug: UGraphic): void {
    this.getKindRenderer().drawU(ug);
  }

  /** @see ChartDiagram.java:132-138 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    return this.getKindRenderer().calculateDimension(stringBounder);
  }

  /** `drawMe`'s and `calculateDimension`'s dispatch on the kind. @see ChartDiagram.java:123-146 */
  private getKindRenderer(): ChartRenderer | PieRenderer | RadarRenderer {
    const kind = this.kind.getKind();
    if (kind === Kind.PIE) return new PieRenderer(this.skinParam, this.resolvePie());
    if (kind === Kind.RADAR) return new RadarRenderer(this.skinParam, this.resolveRadar());
    return this.getRenderer();
  }

  /** The pie, its slices resolved. @see ChartDiagram.java:151-153 */
  resolvePie(): PieChart {
    return this.polar.resolvePie(this.series, this.legendPosition);
  }

  /** The radar, its categories, values and scale resolved. @see ChartDiagram.java:158-161 */
  resolveRadar(): RadarChart {
    return this.polar.resolveRadar(this.series, this.legendPosition);
  }

  getKind(): Kind | undefined {
    return this.kind.getKind();
  }

  /** @see ChartDiagram.java:490-504 */
  checkKind(keyword: string, wanted: Kind): CommandExecutionResult | undefined {
    return errorOf(this.kind.checkKind(keyword, wanted));
  }

  /** @see ChartDiagram.java:506-519 */
  setAngularLabels(labels: readonly string[]): CommandExecutionResult {
    return this.checkKind('a-axis', Kind.POLAR) ?? okOr(this.polar.setAngularLabels(this.series, labels));
  }

  /** @see ChartDiagram.java:530-548 */
  setRadialAxis(r: RadialAxisSettings): CommandExecutionResult {
    return this.checkKind('r-axis', Kind.RADAR) ?? okOr(this.polar.setRadialAxis(r));
  }

  /** @see ChartDiagram.java:550-565 */
  private addPolarSeries(s: ChartSeries): CommandExecutionResult {
    const refused = this.polar.checkPolarSeries(this.series, s);
    if (refused !== undefined) return CommandExecutionResult.error(refused);
    this.series.push(s);
    return CommandExecutionResult.ok();
  }

  /**
   * A pie written as a list is checked once all its items are read, then the
   * automatic ranges (3a4d96cb3); `super.checkFinalError()` is null.
   * @see ChartDiagram.java:649-662
   */
  checkFinalError(): string | undefined {
    return checkFinalPie(this.series) ?? checkAutomaticRanges(this);
  }

  /** What the cartesian checks read. */
  private checkState(): CartesianCheckState {
    return { orientation: this.orientation, xAxis: this.xAxis, xAxisLabels: this.xAxisLabels, series: this.series };
  }

  /** @see ChartDiagram.java:222-224 */
  private getRenderer(): ChartRenderer {
    return new ChartRenderer(this.skinParam, this.resolveCartesian());
  }

  /** The chart as drawn on cartesian axes, every implicit value resolved. @see ChartDiagram.java:230-255 */
  resolveCartesian(): CartesianChart {
    return resolveCartesian({
      orientation: this.orientation,
      xAxisLabels: this.xAxisLabels,
      xAxisTitle: this.xAxisTitle,
      xAxisTickSpacing: this.xAxisTickSpacing,
      xAxisLabelPosition: this.xAxisLabelPosition,
      xAxis: this.xAxis,
      yAxisLabels: this.yAxisLabels,
      yAxis: this.yAxis,
      y2Axis: this.y2Axis,
      series: this.series,
      legendPosition: this.legendPosition,
      xGridMode: this.xGridMode,
      yGridMode: this.yGridMode,
      stackMode: this.stackMode,
      annotations: this.chartAnnotations,
    });
  }

  /** The labels of the category axis. @see ChartDiagram.java:412-414 */
  private getCategoryLabels(): readonly string[] {
    return this.orientation === Orientation.HORIZONTAL ? this.yAxisLabels : this.xAxisLabels;
  }

  /** The first refusal of `checkCartesianKeys` over every series. @see ChartDiagram.java:652-657, 719-724 */
  private checkAllKeys(labels: readonly string[]): CommandExecutionResult {
    for (const s of this.series) {
      const unknown = checkCartesianKeys(this.checkState(), s, labels);
      if (unknown !== undefined) return CommandExecutionResult.error(unknown);
    }
    return CommandExecutionResult.ok();
  }

  /**
   * A series written without data: the list items that follow give its values.
   * A pie is checked once every line is read (`checkFinalError`).
   * @see ChartDiagram.java:587-603
   */
  openSeries(s: ChartSeries): CommandExecutionResult {
    const kind = kindOf(s);
    const error = this.checkKind(keywordOf(s), kind);
    if (error !== undefined) return error;
    if (s.getType() === SeriesType.PIE && this.series.length > 0) return CommandExecutionResult.error(ERROR_ONE_PIE);
    if (kind === Kind.CARTESIAN && hasCoordinatePairs(this.series))
      return CommandExecutionResult.error(ERROR_SAME_FORMAT);
    this.series.push(s);
    this.openedSeries = s;
    return CommandExecutionResult.ok();
  }

  /**
   * A value written on a line of a list, such as `* Nitrogen : 78`, added to the
   * series written without data before it.
   * @see ChartDiagram.java:608-632
   */
  addItem(key: string | undefined, value: ChartValue, color: HColor | undefined): CommandExecutionResult {
    const open = this.openedSeries;
    if (open === undefined) return CommandExecutionResult.error(ERROR_ITEM_WITHOUT_SERIES);
    const mixed = open.getValues().length > 0 && open.hasKeys() !== (key !== undefined) ? ERROR_MIXED_KEYS : undefined;
    const refused = mixed ?? this.polar.checkPolarItem(open, key, value) ?? this.checkCartesianItem(open, key, color);
    if (refused !== undefined) return CommandExecutionResult.error(refused);
    open.addItem(key, value, color);
    return CommandExecutionResult.ok();
  }

  /** A bar, line, area or scatter item takes no colour, and a key among the categories. @see ChartDiagram.java:620-630 */
  private checkCartesianItem(
    open: ChartSeries,
    key: string | undefined,
    color: HColor | undefined,
  ): string | undefined {
    if (isPolar(open)) return undefined;
    if (color !== undefined) return `A value of a ${keywordOf(open)} cannot have a color of its own`;
    return key === undefined ? undefined : checkCartesianKey(this.checkState(), key, this.getCategoryLabels());
  }

  /** @see ChartDiagram.java:647-662 */
  setXAxisLabels(labels: readonly string[]): CommandExecutionResult {
    if (labels.length > 0 && this.xAxis.isAutoScale() && hasCoordinatePairs(this.series))
      return CommandExecutionResult.error(ERROR_PAIRS_NEED_NUMERIC);
    if (this.orientation === Orientation.VERTICAL) {
      const refused = this.checkAllKeys(labels);
      if (!refused.isOk()) return refused;
    }
    this.xAxisLabels.length = 0;
    this.xAxisLabels.push(...labels);
    return CommandExecutionResult.ok();
  }

  setXAxisTitle(title: string | undefined): void {
    this.xAxisTitle = title;
  }

  getXAxisTitle(): string | undefined {
    return this.xAxisTitle;
  }

  setXAxisLabelPosition(position: LabelPosition): void {
    this.xAxisLabelPosition = position;
  }

  getXAxisLabelPosition(): LabelPosition {
    return this.xAxisLabelPosition;
  }

  setXAxisTickSpacing(spacing: number): void {
    this.xAxisTickSpacing = spacing;
  }

  getXAxisTickSpacing(): number | undefined {
    return this.xAxisTickSpacing;
  }

  /**
   * The range is checked first (93ebfacc5); coordinate pairs given without a range
   * were never checked against one; keyed values need categories, not a range.
   * @see ChartDiagram.java:748-769
   */
  setXAxis(title: string | undefined, min: number | undefined, max: number | undefined): CommandExecutionResult {
    const range = errorOf(checkRange('h-axis', min, max));
    if (range !== undefined) return range;
    const ranged = min !== undefined || max !== undefined;
    if (ranged && this.xAxis.isAutoScale() && hasCoordinatePairs(this.series))
      return CommandExecutionResult.error(ERROR_RANGE_AFTER_PAIRS);
    if (ranged && this.orientation === Orientation.VERTICAL && this.series.some((s) => s.hasKeys() && !isPolar(s)))
      return CommandExecutionResult.error(ERROR_KEYS_NEED_CATEGORIES);
    applyToAxis(this.xAxis, title, min, max);
    return CommandExecutionResult.ok();
  }

  getXAxis(): ChartAxis {
    return this.xAxis;
  }

  /** @see ChartDiagram.java:775-786 */
  setYAxis(title: string | undefined, min: number | undefined, max: number | undefined): CommandExecutionResult {
    const range = errorOf(checkRange('v-axis', min, max));
    if (range !== undefined) return range;
    applyToAxis(this.yAxis, title, min, max);
    return CommandExecutionResult.ok();
  }

  /** @see ChartDiagram.java:718-728 */
  setYAxisLabels(labels: readonly string[]): CommandExecutionResult {
    if (this.orientation === Orientation.HORIZONTAL) {
      const refused = this.checkAllKeys(labels);
      if (!refused.isOk()) return refused;
    }
    this.yAxisLabels.length = 0;
    this.yAxisLabels.push(...labels);
    return CommandExecutionResult.ok();
  }

  getYAxisLabels(): readonly string[] {
    return this.yAxisLabels;
  }

  /** Creates the axis even with all three absent, once the range is checked. @see ChartDiagram.java:800-813 */
  setY2Axis(title: string | undefined, min: number | undefined, max: number | undefined): CommandExecutionResult {
    const range = errorOf(checkRange('v2-axis', min, max));
    if (range !== undefined) return range;
    this.y2Axis ??= new ChartAxis();
    applyToAxis(this.y2Axis, title, min, max);
    return CommandExecutionResult.ok();
  }

  /**
   * The checks run in Java's order. The axes are no longer widened here: they are
   * fitted when the chart is resolved (2117ccb43cd).
   * @see ChartDiagram.java:742-807
   */
  addSeries(series: ChartSeries): CommandExecutionResult {
    this.openedSeries = undefined;
    const kindError = this.checkKind(keywordOf(series), kindOf(series));
    if (kindError !== undefined) return kindError;
    if (isPolar(series)) return this.addPolarSeries(series);
    const state = this.checkState();
    const refused = series.hasExplicitXValues()
      ? checkCoordinatePairs(state, series)
      : (checkCartesianKeys(state, series, this.getCategoryLabels()) ?? checkSameFormat(state, series));
    if (refused !== undefined) return CommandExecutionResult.error(refused);
    this.series.push(series);
    return CommandExecutionResult.ok();
  }

  getXAxisLabels(): readonly string[] {
    return this.xAxisLabels;
  }

  getSeries(): readonly ChartSeries[] {
    return this.series;
  }

  getYAxis(): ChartAxis {
    return this.yAxis;
  }

  getY2Axis(): ChartAxis | undefined {
    return this.y2Axis;
  }

  setLegendPosition(position: LegendPosition): CommandExecutionResult {
    this.legendPosition = position;
    return CommandExecutionResult.ok();
  }

  getLegendPosition(): LegendPosition {
    return this.legendPosition;
  }

  /** Unreachable from a registered command: `CommandChartGrid` is not registered. @see ChartDiagram.java:282-286 */
  setGridMode(mode: GridMode): CommandExecutionResult {
    this.xGridMode = mode;
    this.yGridMode = mode;
    return CommandExecutionResult.ok();
  }

  setXGridMode(mode: GridMode): CommandExecutionResult {
    this.xGridMode = mode;
    return CommandExecutionResult.ok();
  }

  setYGridMode(mode: GridMode): CommandExecutionResult {
    this.yGridMode = mode;
    return CommandExecutionResult.ok();
  }

  getXGridMode(): GridMode {
    return this.xGridMode;
  }

  getYGridMode(): GridMode {
    return this.yGridMode;
  }

  setStackMode(mode: StackMode): CommandExecutionResult {
    this.stackMode = mode;
    return CommandExecutionResult.ok();
  }

  getStackMode(): StackMode {
    return this.stackMode;
  }

  setOrientation(orientation: Orientation): CommandExecutionResult {
    this.orientation = orientation;
    return CommandExecutionResult.ok();
  }

  getOrientation(): Orientation {
    return this.orientation;
  }

  /** @see ChartDiagram.java:324-327 */
  addAnnotation(annotation: ChartAnnotation): CommandExecutionResult {
    this.chartAnnotations.push(annotation);
    return CommandExecutionResult.ok();
  }

  getAnnotations(): readonly ChartAnnotation[] {
    return this.chartAnnotations;
  }
}

/** The body `setXAxis`, `setYAxis` and `setY2Axis` share: each only if present. */
function applyToAxis(
  axis: ChartAxis,
  title: string | undefined,
  min: number | undefined,
  max: number | undefined,
): void {
  if (title !== undefined) axis.setTitle(title);
  if (min !== undefined) axis.setMin(min);
  if (max !== undefined) axis.setMax(max);
}

/** An error result for a message, `undefined` for none. */
function errorOf(message: string | undefined): CommandExecutionResult | undefined {
  return message === undefined ? undefined : CommandExecutionResult.error(message);
}

/** `ok()`, or the error for a message. */
function okOr(message: string | undefined): CommandExecutionResult {
  return errorOf(message) ?? CommandExecutionResult.ok();
}
