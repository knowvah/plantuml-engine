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
import { javaDoubleToString } from '../../core/java-number-format.js';
import type { ScaleSpec } from '../../core/scale-command.js';
import type { SpriteRegistry } from '../../core/sprite-registry.js';
import { TitledDiagram } from '../../core/TitledDiagram.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import type { UmlSource } from '../../core/TitledDiagram.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import type { ChartAnnotation } from './ChartAnnotation.js';
import { ChartAxis, LabelPosition } from './ChartAxis.js';
import type { ChartSeries } from './ChartSeries.js';
import { SeriesType } from './ChartSeries.js';
import { GridMode, LegendPosition, Orientation, StackMode } from './chart-modes.js';
import { ChartRenderer } from './ChartRenderer.js';
import type { SkinParam } from './chart-skin-param.js';

export { GridMode, LegendPosition, Orientation, StackMode } from './chart-modes.js';

/** @see ChartDiagram.java:198-199 */
const ERROR_PAIRS_LINE_SCATTER_ONLY = 'Coordinate pair notation (x:y) is only supported for line and scatter charts';
/** @see ChartDiagram.java:204-205 */
const ERROR_PAIRS_NEED_NUMERIC =
  'Coordinate pair notation requires numeric h-axis (e.g., h-axis "x" -5 --> 5), not categorical labels';
/** @see ChartDiagram.java:210-211 */
const ERROR_PAIRS_NEED_RANGE = 'Coordinate pair notation requires explicit h-axis range (e.g., h-axis "x" -5 --> 5)';
/** @see ChartDiagram.java:218-219, 240-241 */
const ERROR_SAME_FORMAT = 'All series must use the same data format (either all coordinate pairs or all index-based)';

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

  /** @see ChartDiagram.java:94-97 */
  drawU(ug: UGraphic): void {
    this.getRenderer().drawU(ug);
  }

  /** @see ChartDiagram.java:341-343 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    return this.getRenderer().calculateDimension(stringBounder);
  }

  /**
   * Horizontal passes the v-axis labels as categories and the h-axis as both
   * axes, with the grid modes swapped. `xAxis != null` always holds, and its
   * title is never null.
   * @see ChartDiagram.java:99-121
   */
  private getRenderer(): ChartRenderer {
    const common = this.commonRendererState();
    if (this.orientation === Orientation.HORIZONTAL) {
      return new ChartRenderer({
        ...common,
        xAxisLabels: this.yAxisLabels,
        xAxisTitle: this.yAxis.getTitle(),
        xAxisTickSpacing: undefined,
        yAxis: this.xAxis,
        y2Axis: undefined,
        xGridMode: this.yGridMode,
        yGridMode: this.xGridMode,
      });
    }
    const title = this.xAxis.getTitle();
    return new ChartRenderer({
      ...common,
      xAxisLabels: this.xAxisLabels,
      xAxisTitle: title !== '' ? title : this.xAxisTitle,
      xAxisTickSpacing: this.xAxisTickSpacing,
      yAxis: this.yAxis,
      y2Axis: this.y2Axis,
      xGridMode: this.xGridMode,
      yGridMode: this.yGridMode,
    });
  }

  /** The arguments both `getRenderer` arms pass unchanged. @see ChartDiagram.java:109-120 */
  private commonRendererState() {
    return {
      skinParam: this.skinParam,
      xAxisLabelPosition: this.xAxisLabelPosition,
      series: this.series,
      legendPosition: this.legendPosition,
      stackMode: this.stackMode,
      orientation: this.orientation,
      annotations: this.chartAnnotations,
      xAxis: this.xAxis,
    };
  }

  /** @see ChartDiagram.java:125-129 */
  setXAxisLabels(labels: readonly string[]): CommandExecutionResult {
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

  /** @see ChartDiagram.java:151-159 */
  setXAxis(title: string | undefined, min: number | undefined, max: number | undefined): CommandExecutionResult {
    applyToAxis(this.xAxis, title, min, max);
    return CommandExecutionResult.ok();
  }

  getXAxis(): ChartAxis {
    return this.xAxis;
  }

  /** @see ChartDiagram.java:165-173 */
  setYAxis(title: string | undefined, min: number | undefined, max: number | undefined): CommandExecutionResult {
    applyToAxis(this.yAxis, title, min, max);
    return CommandExecutionResult.ok();
  }

  /** @see ChartDiagram.java:175-179 */
  setYAxisLabels(labels: readonly string[]): CommandExecutionResult {
    this.yAxisLabels.length = 0;
    this.yAxisLabels.push(...labels);
    return CommandExecutionResult.ok();
  }

  getYAxisLabels(): readonly string[] {
    return this.yAxisLabels;
  }

  /** Creates the axis even with all three absent. @see ChartDiagram.java:181-191 */
  setY2Axis(title: string | undefined, min: number | undefined, max: number | undefined): CommandExecutionResult {
    this.y2Axis ??= new ChartAxis();
    applyToAxis(this.y2Axis, title, min, max);
    return CommandExecutionResult.ok();
  }

  /**
   * The checks run in Java's order. `isAutoScale` having passed, `includeValue`
   * on the x axis is a no-op: kept, as upstream has it. The `SeriesType` test is
   * unreachable from a registered command (`bar` and `area` never build pairs).
   * @see ChartDiagram.java:193-255
   */
  addSeries(series: ChartSeries): CommandExecutionResult {
    const refused = series.hasExplicitXValues() ? this.checkCoordinatePairs(series) : this.checkSameFormat(series);
    if (refused !== undefined) return CommandExecutionResult.error(refused);

    if (series.hasExplicitXValues()) for (const x of series.getXValues()!) this.xAxis.includeValue(x);

    this.series.push(series);

    const axis = series.isUseSecondaryAxis() && this.y2Axis !== undefined ? this.y2Axis : this.yAxis;
    for (const value of series.getValues()) axis.includeValue(value);

    return CommandExecutionResult.ok();
  }

  /** @see ChartDiagram.java:195-231 */
  private checkCoordinatePairs(series: ChartSeries): string | undefined {
    if (series.getType() !== SeriesType.LINE && series.getType() !== SeriesType.SCATTER)
      return ERROR_PAIRS_LINE_SCATTER_ONLY;
    if (this.xAxisLabels.length > 0) return ERROR_PAIRS_NEED_NUMERIC;
    if (this.xAxis.isAutoScale() || this.xAxis.getMax() === this.xAxis.getMin()) return ERROR_PAIRS_NEED_RANGE;
    const sameFormat = this.checkSameFormat(series);
    if (sameFormat !== undefined) return sameFormat;
    for (const x of series.getXValues()!) {
      if (x < this.xAxis.getMin() || x > this.xAxis.getMax()) {
        const range = `[${javaDoubleToString(this.xAxis.getMin())}, ${javaDoubleToString(this.xAxis.getMax())}]`;
        return `X-coordinate ${javaDoubleToString(x)} is outside h-axis range ${range}`;
      }
    }
    return undefined;
  }

  /** @see ChartDiagram.java:215-222, 237-243 */
  private checkSameFormat(series: ChartSeries): string | undefined {
    const first = this.series[0];
    if (first !== undefined && first.hasExplicitXValues() !== series.hasExplicitXValues()) return ERROR_SAME_FORMAT;
    return undefined;
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
