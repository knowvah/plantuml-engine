/**
 * The one merged `Style` of a stereotyped box (`FtileBox.create`, `FtileBox.java:138-146`), as the theme its sizer and its
 * renderer both read (mission ubt, T1b, D3).
 *
 * `FtileBox`'s constructor takes line and back colour, the font configuration, horizontal alignment, padding, round
 * corner, shadowing, wrap width and minimum width off that one style (`:164-176`), and `drawU` its stroke (`:208`).
 * The activity readers already take each of them from `theme.colors.elements.activity`, so {@link withActivityBox}
 * writes the merged style's values there once, for this box alone; the three the readers have no tier for -- padding,
 * the font face and the shadow -- ride on a symbol, as `activity-string-bounder.ts` carries the measurer.
 */
import { bridgeFontConfiguration } from '../../core/klimt/font/FontConfigurationBridge.js';
import { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { ClockwiseTopRightBottomLeft } from '../../core/klimt/geom/ClockwiseTopRightBottomLeft.js';
import { paintOf } from '../../core/activity-circle-style.js';
import type { Style } from '../../core/style/Style.js';
import type { Theme } from '../../core/theme.js';
import type { ElementColors } from '../../core/theme-graph-colors.js';
import type { FontConfiguration } from '../../core/klimt/shape/UText.js';
import { ACTIVITY_PADDING } from './activity-style-defaults.js';
import { activityShadowFilter, activityShadowingOf } from './activity-shadow.js';

/** What the activity readers have no `elements` tier for. */
interface BoxExtras {
  readonly font: FontConfiguration;
  readonly padding: ClockwiseTopRightBottomLeft;
  readonly shadowing: number;
  readonly dash: readonly [number, number] | undefined;
}

const BOX_KEY: unique symbol = Symbol('activity.box');

type ThemeWithBox = Theme & { readonly [BOX_KEY]?: BoxExtras };

/** `FtileBox`'s `style.getPadding()` where the style declares none of its own: `plantuml.skin:360`. */
const DEFAULT_PADDING = ClockwiseTopRightBottomLeft.same(ACTIVITY_PADDING);

/** `style.value(PName.MaximumWidth).asString()`, `LineBreakStrategy`'s own input (`Style.java:330-333`). */
function maximumWidthOf(style: Style): number {
  const width = Number(style.value('MaximumWidth').asString());
  return Number.isFinite(width) ? width : 0;
}

/** The `elements.activity` fields `FtileBox` reads off its style. */
export function activityBucketOf(style: Style, font: FontConfiguration): ElementColors {
  const back = paintOf(style, 'BackGroundColor', false);
  const line = paintOf(style, 'LineColor', false);
  return {
    ...(back === undefined ? {} : { background: back }),
    ...(line === undefined ? {} : { border: line }),
    ...(font.color === null ? {} : { font: font.color }),
    fontSize: font.size,
    fontFamily: font.family,
    lineThickness: style.getStroke().getThickness(),
    roundCorner: style.value('RoundCorner').asDouble(),
    minimumWidth: style.value('MinimumWidth').asDouble(),
    maximumWidth: maximumWidthOf(style),
  };
}

/**
 * `theme` as the box with merged style `style` reads it. `undefined` leaves `theme` as it is: a box with no stereotype
 * style reads the flat tiers.
 */
export function withActivityBox(theme: Theme, style: Style | undefined): Theme {
  if (style === undefined) return theme;
  const font = bridgeFontConfiguration(style.getFontConfiguration(HColorSet.instance()));
  const elements = theme.colors.elements;
  const alignment = style.getHorizontalAlignment();
  const root = alignment === undefined ? elements?.['root'] : { ...elements?.['root'], horizontalAlignment: alignment };
  const extras: BoxExtras = {
    font,
    padding: style.getPadding(),
    shadowing: style.getShadowing(),
    dash: style.getStroke().getDasharraySvg(),
  };
  const withElements: Theme = {
    ...theme,
    colors: {
      ...theme.colors,
      elements: { ...elements, activity: { ...elements?.['activity'], ...activityBucketOf(style, font) }, root },
    },
  };
  return { ...withElements, [BOX_KEY]: extras } as ThemeWithBox;
}

/** The box's merged-style font configuration, absent for a box that reads the flat tiers. */
export function boxFontConfiguration(theme: Theme): FontConfiguration | undefined {
  return (theme as ThemeWithBox)[BOX_KEY]?.font;
}

/** `style.getPadding()` (`FtileBox.java:170`): the merged style's, else `plantuml.skin:360`'s 10 on every side. */
export function boxPadding(theme: Theme): ClockwiseTopRightBottomLeft {
  return (theme as ThemeWithBox)[BOX_KEY]?.padding ?? DEFAULT_PADDING;
}

/** `style.getShadowing()` (`FtileBox.java:173`): the stereotyped box's own style, else the plain `activity` signature's. */
export function boxShadowing(theme: Theme): number {
  return (theme as ThemeWithBox)[BOX_KEY]?.shadowing ?? activityShadowingOf(theme).box;
}

/** `style.getStroke()`'s dash (`FtileBox.java:208`), absent for a solid line. */
export function boxDash(theme: Theme): readonly [number, number] | undefined {
  return (theme as ThemeWithBox)[BOX_KEY]?.dash;
}

/** The box outline's `stroke-dasharray` and shadow `filter` (`FtileBox.java:173,208,222`), each absent when unset. */
export function boxPaintExtras(theme: Theme): { strokeDasharray?: string; filter?: string } {
  const dash = boxDash(theme);
  return {
    ...(dash === undefined ? {} : { strokeDasharray: `${dash[0]},${dash[1]}` }),
    ...activityShadowFilter(boxShadowing(theme)),
  };
}
