/**
 * The colours and stroke an activity edge is drawn with when no inline `-[#color]->` replaces them. Split out of
 * `renderer.ts`, at the 500-line cap.
 */
import type { Theme } from '../../core/theme.js';
import type { ActivityEdgeGeo } from './activity-geometry.types.js';
import { activityArrowHeadColor, activityBoxLine, arrowLineColor } from './activity-scoped-colors.js';
import { activityLineThickness } from './activity-style-defaults.js';
import type { Paint } from '../../core/paint.js';

export type LineStroke = { readonly width: number; readonly dash?: string };

/** One worm's colours and stroke (`Worm#drawInternalOneColor`). */
export interface EdgeLook {
  /** A worm's segments are `ULine`s: `line()` draws a gradient's first colour (`DriverLineSvg.java:76-82`). */
  readonly line: Paint;
  /** The head is a `UPolygon`, filled and stroked (`Worm.java:153-154`): a gradient stays whole (`DriverPolygonSvg.java:63-64`). */
  readonly head: Paint;
  readonly stroke: LineStroke;
  readonly invisible: boolean;
}

/**
 * The default look. T2c:
 * `skinparam ArrowHeadColor` reaches the decoration only (`ftile/Worm.java:146-154`;
 * absent -> `activityArrowHeadColor` tracks the line). T4a: the line is the
 * merged `LineColor` (`arrowLineColor`). The line stroke is `style.getStroke()` (`:128-129`, the `linkStyle.isNormal()`
 * branch, `plantuml.skin:374`); the `withThickness(1.5)` at `:157,165` is overridden by `UStroke.simple()` (`:162,170`).
 *
 * TE1: an edge tagged {@link ActivityEdgeGeo.lineSName} is `fork ... end merge`'s `Rainbow.build(style, set)` over the
 * `activity` signature (`ParallelBuilderMerge.java:80-82,96-111`): `LineColor` is the box's line, and with no
 * `HeadColor` there the head is the line (`Rainbow.java:84-90`). The stroke stays the `Snake`'s own.
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/vcompact/ParallelBuilderMerge.java:80-82,96-111
 */
export function defaultEdgeLook(theme: Theme, edge: ActivityEdgeGeo): EdgeLook {
  const stroke = { width: activityLineThickness(theme, 'arrow') };
  if (edge.lineSName === 'activity') {
    const line = activityBoxLine(theme);
    return { line, head: line, stroke, invisible: false };
  }
  return {
    line: arrowLineColor(theme),
    head: activityArrowHeadColor(theme),
    stroke,
    invisible: false,
  };
}
