/**
 * state-colors.ts — a state's `Colors` (stdd T3a, D6). `CommandCreateState.java:216-228`:
 * `color().getColor(arg, colorSet)` parses the `#...` spec (`Colors.java:95-110`: a bare colour is
 * BACK, `line:`/`text:`/`back:` name a type, `line.dashed|dotted|bold` set the line style), the
 * `##[style]colour` adds the LINE colour and `addLegacyStroke(style)`. `CommandCreatePackageState`
 * does the same for a composite. What the images read:
 * - the LINE colour for the border (`EntityImageStateCommon.java:144-150`, `Cluster.java:452-456`,
 *   `InnerStateAutonom.java:104-106`), else the style's LineColor;
 * - `colors.getSpecificLineStroke()` for the stroke (`Style.java:322-328`, `Cluster.java:480-484`,
 *   `InnerStateAutonom.java:101-103`), else the style's;
 * - the TEXT colour for the name's font (`EntityImageStateCommon.java:73-76`, `Style.java:259-264`).
 */
import { Colors } from '../../core/abel/Colors.js';
import { ColorType } from '../../core/abel/ColorType.js';
import { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { HColorSimple } from '../../core/klimt/color/HColorSimple.js';
import { HColorGradient } from '../../core/klimt/color/HColorGradient.js';
import { ColorMapper, toSvgPaint } from '../../core/klimt/color/ColorMapper.js';
import type { Paint } from '../../core/paint.js';
import type { State } from './ast.js';

/** `UStroke` as plain data: `getThickness()` and `getDasharraySvg()`. */
export interface StateLineStroke {
  readonly thickness: number;
  readonly dash?: readonly [number, number];
}

/** The resolved reads of a state's `Colors`; absent fields fall back to the style. */
export interface StateColors {
  readonly lineColor?: Paint;
  readonly lineStroke?: StateLineStroke;
  readonly textColor?: Paint;
}

/** `##[dotted|dashed|bold]colour`: `LINECOLOR` group 0 is the style word, group 1 the colour. */
const LINE_COLOR_SPEC = /^##(?:\[(dotted|dashed|bold)\])?(\w*)$/;

/** `HColor#toSvg` for the port's two colour classes; anything else has no SVG paint. */
export function hcolorToPaint(color: object | undefined): Paint | undefined {
  if (color instanceof HColorSimple || color instanceof HColorGradient) return toSvgPaint(color, ColorMapper.IDENTITY);
  return undefined;
}

/** `CommandCreateState.java:216-228` over the raw `color` and `lineColor` specs. */
export function stateColorsOf(state: Pick<State, 'color' | 'lineColor'>): StateColors | undefined {
  if (state.color === undefined && state.lineColor === undefined) return undefined;
  const set = HColorSet.instance();
  let colors = Colors.parse(state.color ?? '', set, ColorType.BACK);
  const spec = state.lineColor === undefined ? null : LINE_COLOR_SPEC.exec(state.lineColor);
  if (spec !== null) {
    const name = spec[2];
    if (name !== undefined && name !== '') colors = colors.add(ColorType.LINE, set.getColorOrNull(name));
    if (spec[1] !== undefined) colors = colors.addLegacyStroke(spec[1]);
  }
  const lineColor = hcolorToPaint(colors.getColor(ColorType.LINE));
  const textColor = hcolorToPaint(colors.getColor(ColorType.TEXT));
  const stroke = colors.getSpecificLineStroke();
  const dash = stroke?.getDasharraySvg();
  const lineStroke =
    stroke === undefined ? undefined : { thickness: stroke.getThickness(), ...(dash !== undefined ? { dash } : {}) };
  if (lineColor === undefined && textColor === undefined && lineStroke === undefined) return undefined;
  return {
    ...(lineColor !== undefined ? { lineColor } : {}),
    ...(lineStroke !== undefined ? { lineStroke } : {}),
    ...(textColor !== undefined ? { textColor } : {}),
  };
}
