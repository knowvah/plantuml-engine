/**
 * What the activity readers take from `theme.colors.elements` per element: T2a's resolved `BackGroundColor` (D2) and
 * the stereotype tier above it (`withTOBECHANGED`, `FtileBox.java:146`, re-signed at +1000,
 * `StyleLoader.java:178-186`). Split out of `activity-style-defaults.ts`, at the 500-line cap.
 */
import { isTransparentColor, type Paint } from '../../core/paint.js';
import { PAINT_NONE } from '../../core/svg.js';
import type { Theme } from '../../core/theme.js';
import { stereotypeFontColor, stereotypePaint } from '../../core/theme-element-resolve.js';
import { resolveColorToSvgHex } from '../../core/klimt/color/HColorSet.js';

/**
 * `HColor#toSvg` collapses a transparent colour to `#00000000` (`HColor.java:74-76`) and `SvgGraphics#fixColor` prints
 * that as `none` (`SvgGraphics.java:517-525,540`), where `svg.ts` would print a `fill-opacity`.
 */
export function svgBack(paint: Paint | undefined): Paint | undefined {
  return typeof paint === 'string' && isTransparentColor(paint) ? PAINT_NONE : paint;
}

/** A `FontConfiguration`'s colour: `null` is `isTransparent()` there (`UText.ts`), and `DriverTextSvg.java:92-93` then
 *  draws no text. */
export function fontConfigurationColor(color: string): string | null {
  return isTransparentColor(color) ? null : color;
}

/** The merged `BackGroundColor` T2a wrote to `bucket`, absent where the flat path stands (D3). */
export function scopedBack(theme: Theme, bucket: string): Paint | undefined {
  return svgBack(theme.colors.elements?.[bucket]?.background);
}

/** The stereotype's `BackGroundColor` on `sname`, `Style#value` of a `withTOBECHANGED` signature. */
export function stereotypeBack(theme: Theme, sname: string, stereotype: string | undefined): Paint | undefined {
  return stereotype === undefined ? undefined : svgBack(stereotypePaint(theme, sname, 'background', [stereotype]));
}

/** The stereotype's `FontColor` on `sname`, as {@link stereotypeBack}. */
export function stereotypeFont(theme: Theme, sname: string, stereotype: string | undefined): string | undefined {
  const color = stereotype === undefined ? undefined : stereotypeFontColor(theme, sname, 'title', [stereotype]);
  return color === undefined ? undefined : resolveColorToSvgHex(color);
}

/** `theme` with `activity`'s font the stereotype's: the box's own `style` (`FtileBox.java:146,167`) in the only form
 *  `buildActionTextBlock` reads it. */
export function withStereotypeFont(theme: Theme, stereotype: string | undefined): Theme {
  const font = stereotypeFont(theme, 'activity', stereotype);
  if (font === undefined) return theme;
  const elements = theme.colors.elements;
  return {
    ...theme,
    colors: { ...theme.colors, elements: { ...elements, activity: { ...elements?.['activity'], font } } },
  };
}
