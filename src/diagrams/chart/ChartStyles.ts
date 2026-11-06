/**
 * The merged styles and small drawing helpers `ChartRenderer` and its series
 * renderers share (D5). Each style read is the Java's. The port's `asColor` is
 * typed non-null, so Java's `if (color == null)` fallbacks cannot fire: they stay
 * where Java has them, through {@link asNullable}, with `ValueNull` answering
 * black, which is exactly why a chart's unset `MarkerColor` draws black.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartRenderer.java:941-1076
 */
import { Back } from '../../core/klimt/Back.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import { CreoleMode } from '../../core/klimt/creole/CreoleMode.js';
import { Display } from '../../core/klimt/creole/Display.js';
import { create0 } from '../../core/klimt/creole/DisplayCreole.js';
import { Fore } from '../../core/klimt/Fore.js';
import { FontConfiguration as AbelFontConfiguration } from '../../core/abel/FontConfiguration.js';
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import type { UFont } from '../../core/klimt/font/UFont.js';
import { UFontFace } from '../../core/klimt/font/UFont.js';
import { UFontFactory } from '../../core/klimt/font/UFontFactory.js';
import type { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { HorizontalAlignment as Alignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { LineBreakStrategy } from '../../core/klimt/LineBreakStrategy.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { UStroke } from '../../core/klimt/UStroke.js';
import { isLongValued, javaFormatE, javaFormatF, javaFormatLong } from '../../core/java-number-format.js';
import { MergeStrategy } from '../../core/style/MergeStrategy.js';
import type { Style } from '../../core/style/Style.js';
import type { StyleSignature } from '../../core/style/StyleSignature.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { HColor } from '../../core/style/Value.js';
import type { ChartAnnotation } from './ChartAnnotation.js';
import type { ChartAxis, LabelPosition } from './ChartAxis.js';
import type { GridMode, LegendPosition, Orientation, StackMode } from './chart-modes.js';
import type { ChartSeries } from './ChartSeries.js';
import type { SkinParam } from './chart-skin-param.js';

/** The style font the abel `FontConfiguration` wraps: `getFontConfiguration`'s result. */
export type StyleFontConfiguration = AbelFontConfiguration;

/**
 * `ChartRenderer`'s fields. `xAxis` is never null (`ChartDiagram.java:74`) and its
 * type stays optional so Java's `xAxis == null` tests stay honest; `yAxis` is
 * passed non-null on both `getRenderer` arms and its null tests are not kept.
 * @see ChartRenderer.java:64-78
 */
export interface ChartRendererState {
  readonly skinParam: SkinParam;
  readonly xAxisLabels: readonly string[];
  readonly xAxisTitle: string | undefined;
  readonly xAxisTickSpacing: number | undefined;
  readonly xAxisLabelPosition: LabelPosition;
  readonly series: readonly ChartSeries[];
  readonly xAxis: ChartAxis | undefined;
  readonly yAxis: ChartAxis;
  readonly y2Axis: ChartAxis | undefined;
  readonly legendPosition: LegendPosition;
  readonly xGridMode: GridMode;
  readonly yGridMode: GridMode;
  readonly stackMode: StackMode;
  readonly orientation: Orientation;
  readonly annotations: readonly ChartAnnotation[];
}

/** @see ChartRenderer.java:81 */
export const MARGIN = 20;
/** @see ChartRenderer.java:82 */
export const AXIS_LABEL_SPACE = 40;
/** @see ChartRenderer.java:83 */
export const TITLE_SPACE = 30;
/** @see ChartRenderer.java:84 */
export const TICK_SIZE = 5;
/** @see ChartRenderer.java:85 */
export const LEGEND_MARGIN = 10;
/** @see ChartRenderer.java:86 */
export const LEGEND_SYMBOL_SIZE = 12;
/** @see ChartRenderer.java:87 */
export const LEGEND_TEXT_SPACING = 5;
/** @see ChartRenderer.java:88 */
export const LEGEND_ITEM_SPACING = 15;

/** `String.format("%.2f", ...)`'s decimals in `formatValue`. @see ChartRenderer.java:938 */
const VALUE_DECIMALS = 2;
/** `String.format("%.1f", ...)`'s decimals in `formatAxisValue`. @see ChartRenderer.java:1034 */
const AXIS_VALUE_DECIMALS = 1;
/** `%.2e`. @see ChartRenderer.java:935 */
const EXPONENT_DECIMALS = 2;
/** Below this magnitude a non-zero value prints with an exponent. @see ChartRenderer.java:934 */
const EXPONENT_BELOW = 0.01;
/** `UFontFactory.sansSerif(10)`, the value labels and horizontal axis. @see ChartRenderer.java:639, BarRenderer.java:384 */
export const SMALL_FONT_SIZE = 10;
/** The value labels' colour. @see BarRenderer.java:385 */
const LABEL_COLOR = '#000000';
/** A value label's gap above its anchor. @see BarRenderer.java:391 */
const LABEL_GAP = 2;

/**
 * `ug.apply(color)`. A colour the driver cannot paint is Java's checked cast
 * in the port's narrower `UGraphic` (the `Style.ts#foregroundOf` precedent).
 */
export function fore(color: HColor): Fore {
  return new Fore(drawable(color));
}

/** `color.bg()`. */
export function back(color: HColor): Back {
  return new Back(drawable(color));
}

function drawable(color: HColor): HColorSimple | HColorGradient {
  if (color instanceof HColorSimple || color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: chart colour is not an HColorSimple');
}

/** A style colour as Java types it, so its `== null` fallback survives; see the module doc comment. */
export function asNullable(color: HColor): HColor | undefined {
  return color;
}

/** `signature.getMergedStyle(skinParam.getCurrentStyleBuilder())`; the builder always exists here. */
export function mergedStyle(signature: StyleSignature, skinParam: SkinParam): Style {
  const style = signature.getMergedStyle(skinParam.getCurrentStyleBuilder());
  if (style === undefined) throw new Error('NullPointerException: chart style builder answered no style');
  return style;
}

/** A style's line colour. */
export function lineColorOf(style: Style, skinParam: SkinParam): HColor {
  return style.value('LineColor').asColor(skinParam.getIHtmlColorSet());
}

/** @see ChartRenderer.java:951-953 */
export function getStyleSignature(): StyleSignatureBasic {
  return StyleSignatureBasic.of('root', 'element', 'chartDiagram');
}

/** @see ChartRenderer.java:955-957 */
export function getBarStyleSignature(): StyleSignatureBasic {
  return StyleSignatureBasic.of('root', 'element', 'chartDiagram', 'bar');
}

/** @see ChartRenderer.java:980-982 */
export function getLineStyleSignature(): StyleSignatureBasic {
  return StyleSignatureBasic.of('root', 'element', 'chartDiagram', 'line');
}

/** @see ChartRenderer.java:1004-1006 */
export function getAreaStyleSignature(): StyleSignatureBasic {
  return StyleSignatureBasic.of('root', 'element', 'chartDiagram', 'area');
}

/** @see ChartRenderer.java:1037-1039 */
export function getScatterStyleSignature(): StyleSignatureBasic {
  return StyleSignatureBasic.of('root', 'element', 'chartDiagram', 'scatter');
}

/** @see ChartRenderer.java:1061-1064 */
export function getAxisStyleSignature(horizontal: boolean): StyleSignatureBasic {
  return StyleSignatureBasic.of('root', 'element', 'chartDiagram', 'axis', horizontal ? 'hAxis' : 'vAxis');
}

/** @see ChartRenderer.java:1066-1068 */
export function getGridStyleSignature(): StyleSignatureBasic {
  return StyleSignatureBasic.of('root', 'element', 'chartDiagram', 'grid');
}

/** @see ChartRenderer.java:1070-1072 */
export function getLegendStyleSignature(): StyleSignatureBasic {
  return StyleSignatureBasic.of('root', 'element', 'chartDiagram', 'legend');
}

/** @see ChartRenderer.java:1074-1076 */
export function getAnnotationStyleSignature(): StyleSignatureBasic {
  return StyleSignatureBasic.of('root', 'element', 'chartDiagram', 'annotation');
}

/**
 * The body of `ChartRenderer#getBarStyle`, `getLineStyle`, `getAreaStyle` and
 * `getScatterStyle`: `withTOBECHANGED` merged with `forStereotypeItself`.
 * `BarRenderer` and `ScatterRenderer` have their own that do not merge the
 * second, so stereotype selectors reach colour and border differently.
 * @see ChartRenderer.java:959-978
 */
function stereotypedStyle(signature: StyleSignatureBasic, series: ChartSeries, skinParam: SkinParam): Style {
  const stereotype = series.getStereotype();
  if (stereotype === undefined) return mergedStyle(signature, skinParam);
  const style = mergedStyle(signature.withTOBECHANGED(stereotype), skinParam);
  const stereoStyle = mergedStyle(signature.forStereotypeItself(stereotype), skinParam);
  return style.mergeWith(stereoStyle, MergeStrategy.OVERWRITE_EXISTING_VALUE);
}

/** @see ChartRenderer.java:959-978 */
export function getBarStyle(series: ChartSeries, skinParam: SkinParam): Style {
  return stereotypedStyle(getBarStyleSignature(), series, skinParam);
}

/** @see ChartRenderer.java:984-1002 */
export function getLineStyle(series: ChartSeries, skinParam: SkinParam): Style {
  return stereotypedStyle(getLineStyleSignature(), series, skinParam);
}

/** @see ChartRenderer.java:1008-1026 */
export function getAreaStyle(series: ChartSeries, skinParam: SkinParam): Style {
  return stereotypedStyle(getAreaStyleSignature(), series, skinParam);
}

/** @see ChartRenderer.java:1041-1059 */
export function getScatterStyle(series: ChartSeries, skinParam: SkinParam): Style {
  return stereotypedStyle(getScatterStyleSignature(), series, skinParam);
}

/**
 * `formatValue`: byte-identical in `ChartRenderer`, `BarRenderer`, `AreaRenderer`
 * and `ScatterRenderer`, so one function keeps the name.
 * @see ChartRenderer.java:933-939
 */
export function formatValue(value: number): string {
  if (Math.abs(value) < EXPONENT_BELOW && value !== 0) return javaFormatE(value, EXPONENT_DECIMALS);
  if (isLongValued(value)) return javaFormatLong(value);
  return javaFormatF(value, VALUE_DECIMALS);
}

/** @see ChartRenderer.java:1028-1035 */
export function formatAxisValue(value: number): string {
  if (Math.abs(value) < EXPONENT_BELOW && value !== 0) return javaFormatE(value, EXPONENT_DECIMALS);
  if (isLongValued(value)) return javaFormatLong(value);
  return javaFormatF(value, AXIS_VALUE_DECIMALS);
}

/** @see ChartRenderer.java:941-949 */
const DEFAULT_COLORS: readonly string[] = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
];

/** @see ChartRenderer.java:941-949 */
export function getDefaultColor(index: number, skinParam: SkinParam): HColor {
  return skinParam.getIHtmlColorSet().getColor(DEFAULT_COLORS[index % DEFAULT_COLORS.length]!);
}

/** `Display.getWithNewlines(pragma, text).create(fontConfig, alignment, skinParam)`. @see klimt/creole/Display.java:614-617 */
export function displayBlock(
  skinParam: SkinParam,
  text: string,
  fontConfig: StyleFontConfiguration,
  horizontalAlignment: HorizontalAlignment,
): TextBlock {
  return create0(
    Display.getWithNewlines(skinParam.getPragma(), text),
    {
      fontConfiguration: bridgeFontConfiguration(fontConfig),
      spriteContainer: skinParam,
      atomOps: skinParam.atomOps,
    },
    { horizontalAlignment, maxMessageSize: LineBreakStrategy.NONE, creoleMode: CreoleMode.FULL },
  );
}

/**
 * `FontConfiguration.create(font, color, color, null)`: a null underline stroke,
 * which the port's constructor types out, stands for no hyperlink underline.
 * @see ChartRenderer.java:640, klimt/font/FontConfiguration.java:335-340
 */
export function plainFontConfiguration(font: UFont, color: HColor): StyleFontConfiguration {
  return AbelFontConfiguration.create(font, color, color, null as unknown as UStroke);
}

/**
 * `UFontFactory.sansSerif(10).withFontFace(UFontFace.bold())` in black, the value
 * labels' font. @see BarRenderer.java:384-386
 */
export function valueLabelFontConfiguration(skinParam: SkinParam): StyleFontConfiguration {
  const font = UFontFactory.sansSerif(SMALL_FONT_SIZE).withFontFace(UFontFace.bold());
  return plainFontConfiguration(font, skinParam.getIHtmlColorSet().getColor(LABEL_COLOR));
}

/**
 * `drawLabel`: byte-identical in `BarRenderer`, `AreaRenderer` and
 * `ScatterRenderer`, so one function keeps the name. Its `try` swallows nothing
 * the port can raise, so no `catch` is ported.
 * @see BarRenderer.java:381-396
 */
export function drawLabel(ug: UGraphic, skinParam: SkinParam, value: number, x: number, y: number): void {
  const textBlock = displayBlock(
    skinParam,
    formatValue(value),
    valueLabelFontConfiguration(skinParam),
    Alignment.CENTER,
  );
  const textDim = textBlock.calculateDimension(ug.getStringBounder());
  const labelX = x - textDim.getWidth() / 2;
  const labelY = y - textDim.getHeight() - LABEL_GAP;
  textBlock.drawU(ug.apply(UTranslate.dx(labelX).compose(UTranslate.dy(labelY))));
}

/** `value` at a plot height, as every series renderer computes it. */
export function plotY(axis: ChartAxis, value: number, plotHeight: number): number {
  return plotHeight - ((value - axis.getMin()) / (axis.getMax() - axis.getMin())) * plotHeight;
}
