/**
 * What the activity readers take from `theme.colors.elements` per element: T2a's resolved `BackGroundColor` (D2) and
 * the stereotype tier above it (`withTOBECHANGED`, `FtileBox.java:146`, re-signed at +1000,
 * `StyleLoader.java:178-186`). Split out of `activity-style-defaults.ts`, at the 500-line cap.
 */
import { isTransparentColor, parseColor, type Paint } from '../../core/paint.js';
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

/**
 * A node's own inline `#color`, as `HColorSet` parses every colour token: `#a-b` is a gradient (`HColorSet.java:109-116`),
 * which the rect, polygon or ellipse drawn with it keeps (`DriverRectangleSvg.java:82-96`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/color/HColorSet.java:109-116
 */
export function inlineBack(node: { readonly color?: string | undefined }): Paint | undefined {
  return node.color === undefined ? undefined : parseColor(node.color);
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

/** The merged `LineColor` T2a wrote to `bucket`, absent where the flat path stands (D3). A transparent line prints
 *  `none`, as {@link svgBack} (`SvgGraphics.java:517-525,540`). */
export function scopedLine(theme: Theme, bucket: string): Paint | undefined {
  return svgBack(theme.colors.elements?.[bucket]?.border);
}

/**
 * The `activity` signature's line (`of(root, element, activityDiagram, activity)`, `FtileBox.java:98,164`): T2a's
 * merged `LineColor`, else the flat tiers. A box's border, and `fork ... end merge`'s connectors and rhombus
 * (`ParallelBuilderMerge.java:96-99`).
 */
export function activityBoxLine(theme: Theme): Paint {
  return scopedLine(theme, 'activity') ?? theme.colors.graph.activity?.border ?? theme.colors.border;
}

/**
 * An arrow's line: the merged `LineColor` of `of(root, element, activityDiagram, arrow)`
 * (`FtileFactoryDelegator.java:83-84`, `Rainbow.java:84-85`), else the flat `colors.arrow`. An inline `-[#color]->`
 * replaces it before this is read (`FtileFactoryDelegator.java:93-100`).
 */
export function arrowLineColor(theme: Theme): Paint {
  return scopedLine(theme, 'arrow') ?? theme.colors.arrow;
}

/**
 * `skinparam ArrowHeadColor` -- `FromSkinparamToStyle.java:153` registers it as `PName.HeadColor` on `SName.arrow`.
 * `Rainbow.build(Style, HColorSet)` (`decoration/Rainbow.java:84-95`) reads `style.value(PName.HeadColor)`; ABSENT means
 * "track the arrow's own `LineColor`" (`colorHead = color` at `:89`), never a fixed default, so this falls back to
 * {@link arrowLineColor}, the merged line.
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/Worm.java:146-154
 *  (`drawInternalOneColor` switches to this color for the arrowhead decoration only, AFTER the line segments already
 *  drew with the arrow's own `LineColor`).
 */
export function activityArrowHeadColor(theme: Theme): Paint {
  return theme.colors.arrowHead ?? arrowLineColor(theme);
}

/** The stereotype's `BackGroundColor` on `sname`, `Style#value` of a `withTOBECHANGED` signature. */
export function stereotypeBack(theme: Theme, sname: string, stereotype: string | undefined): Paint | undefined {
  return stereotype === undefined ? undefined : svgBack(stereotypePaint(theme, sname, 'background', [stereotype]));
}

/** The stereotype's `LineColor` on `sname`, as {@link stereotypeBack}. */
export function stereotypeLine(theme: Theme, sname: string, stereotype: string | undefined): Paint | undefined {
  return stereotype === undefined ? undefined : svgBack(stereotypePaint(theme, sname, 'border', [stereotype]));
}

/** The stereotype's `FontColor` on `sname`, as {@link stereotypeBack}. */
export function stereotypeFont(theme: Theme, sname: string, stereotype: string | undefined): string | undefined {
  const color = stereotype === undefined ? undefined : stereotypeFontColor(theme, sname, 'title', [stereotype]);
  return color === undefined ? undefined : resolveColorToSvgHex(color);
}

/** `theme` with `sname`'s font the stereotype's: the box's own `style` (`FtileBox.java:146,167`; a note's,
 *  `FtileWithNoteOpale.java:137`) in the only form `buildActionTextBlock` reads it. */
export function withStereotypeFont(theme: Theme, stereotype: string | undefined, sname = 'activity'): Theme {
  const font = stereotypeFont(theme, sname, stereotype);
  if (font === undefined) return theme;
  const elements = theme.colors.elements;
  return {
    ...theme,
    colors: { ...theme.colors, elements: { ...elements, [sname]: { ...elements?.[sname], font } } },
  };
}
