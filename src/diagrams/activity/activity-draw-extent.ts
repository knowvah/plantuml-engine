/**
 * activity-draw-extent -- the `SvgGraphics#ensureVisible` fold of every
 * `TextBlock` an activity render draws into a throwaway graphic.
 *
 * Upstream draws the whole document into ONE `SvgGraphics`, whose canvas is
 * the running maximum `ensureVisible` keeps over every drawn point
 * (`SvgGraphics.java:129-136`), which is not always the layout's ink box: an
 * `SEG_ARCTO` segment asks for `(endX + rx, endY + ry)` (`:854`), past the
 * `UPath`'s own minmax (an SVG sprite's `<ellipse>`). This port splices each
 * text block's markup from a throwaway graphic
 * (`activity-text-sheet.ts#drawActivityTextBlock`), so that graphic's fold
 * would be lost; the render's sink keeps the maximum, which travels as
 * `RenderFragment.drawnMaxX/Y`. The sink rides on the theme the way
 * `activity-string-bounder.ts`'s measurer does; a theme without one
 * (layout-time callers) records nothing.
 *
 * Concurrency: one sink per `renderActivity` call, mutated only by that
 * call's synchronous draw.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/drawing/svg/SvgGraphics.java:129-136,854
 */
import type { Theme } from '../../core/theme.js';

/** The running maximum of the throwaway graphics' `ensureVisible` folds. */
export interface ActivityDrawExtent {
  maxX: number;
  maxY: number;
}

const EXTENT_KEY: unique symbol = Symbol('activity.drawExtent');

type ThemeWithExtent = Theme & { readonly [EXTENT_KEY]?: ActivityDrawExtent };

/** `theme` carrying `sink` as the render's draw-extent accumulator. */
export function withActivityDrawExtent<T extends Theme>(theme: T, sink: ActivityDrawExtent): T {
  return { ...theme, [EXTENT_KEY]: sink };
}

/** Raise the render's fold to `extent` (a no-op for a theme with no sink). */
export function reportActivityDrawExtent(
  theme: Theme,
  extent: { readonly width: number; readonly height: number },
): void {
  const sink = (theme as ThemeWithExtent)[EXTENT_KEY];
  if (sink === undefined) return;
  sink.maxX = Math.max(sink.maxX, extent.width);
  sink.maxY = Math.max(sink.maxY, extent.height);
}
