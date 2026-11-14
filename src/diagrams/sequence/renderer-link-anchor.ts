/**
 * Draw pass for `{a1} <-> {a2} : label`, through the page's `UGraphic`
 * (sdd3 T8e).
 *
 * `LinkAnchor#drawAnchor` builds a `Snake` of two points -- the worm's x, from
 * `ymin + 2` down to `ymax - 2` -- with an UP head at its start and a DOWN
 * head at its end, plus a centred label, and calls `Snake#drawInternal`
 * (`LinkAnchor.java:112-117`). `Worm#drawInternalOneColor` strokes the line
 * first (`:134-144`), then the start decoration, then the end decoration under
 * `UStroke.simple()` (`:156-171`); `Snake#drawInternalLabel` closes with the
 * text (`Snake.java:221-231`).
 *
 * `PlayingSpace#drawUInternal` runs the whole loop in BOTH
 * `drawBackground` and `drawForeground` (`PlayingSpace.java:109-134`), so the
 * link is drawn twice: after the background tiles, and again after the
 * foreground ones. The jar's own SVG carries each link twice (fojomu, zoturo,
 * nizuzi).
 *
 * The geometry is layout space (`sequence-layout-link-anchor.ts`), drawn at
 * scale 1; the export scale is the exporter's `SvgGraphics#format` pass.
 *
 * @see ~/git/plantuml/.../sequencediagram/LinkAnchor.java:82-123
 * @see ~/git/plantuml/.../activitydiagram3/ftile/Worm.java:119-172
 */

import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { Back } from '../../core/klimt/Back.js';
import { Fore } from '../../core/klimt/Fore.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import { UPolygon } from '../../core/klimt/shape/UPolygon.js';
import { FontStyle } from '../../core/klimt/shape/UText.js';
import { arrowHeadPointsFor, type ArrowDir } from '../activity/arrows-regular.js';
import type { PageTheme } from './renderer-ug.js';
import type { LinkAnchorGeo } from './geo.js';
import { drawCreoleRuns } from './sequence-text.js';

/** `ug.apply(UStroke.simple())` before an arrow decoration (`Worm.java:162,170`):
 *  thickness 1, whatever the style says. */
const DECORATION_THICKNESS = 1;

/** `Worm#drawInternalOneColor:156-171`: the decoration's colours, then
 *  `UStroke.withThickness(1.5)`, then -- on a fresh child -- the translate to
 *  the point and `UStroke.simple()`, and the polygon in its local frame. */
function drawHead(
  ug: UGraphic,
  dir: ArrowDir,
  tip: { x: number; y: number },
  geo: LinkAnchorGeo,
  theme: PageTheme,
): void {
  const polygon = new UPolygon(arrowHeadPointsFor(theme, dir));
  ug.apply(new Fore(geo.stroke))
    .apply(new Back(geo.stroke))
    .apply(UStroke.withThickness(1.5))
    .apply(new UTranslate(tip.x, tip.y))
    .apply(UStroke.withThickness(DECORATION_THICKNESS))
    .draw(polygon);
}

/** The shaft's `UStroke`: the arrow style's thickness and dash
 *  (`Worm.java:130-132`, `style.getStroke()`). */
function shaftStroke(geo: LinkAnchorGeo): UStroke {
  return geo.dash === undefined
    ? UStroke.withThickness(geo.thickness)
    : new UStroke(geo.dash[0], geo.dash[1], geo.thickness);
}

/** `UClip#isInside` reduced to its y half (`UClip.java:94-127`): closed at both ends. */
function insideClip(geo: LinkAnchorGeo, y: number): boolean {
  return geo.clip === undefined || (y >= geo.clip.top && y <= geo.clip.bottom);
}

/** `UClip#getClippedY` for a page's band. */
function clippedY(geo: LinkAnchorGeo, y: number): number {
  return geo.clip === undefined ? y : Math.min(Math.max(y, geo.clip.top), geo.clip.bottom);
}

/**
 * `UClip#getClippedLine` (`UClip.java:131-157`) on the vertical shaft: both
 * ends outside that clamp to one point is dropped (`newy1 != newy2`,
 * `:137-140`). `undefined` is that `return null`.
 */
function clippedShaft(geo: LinkAnchorGeo): readonly [number, number] | undefined {
  const y1 = clippedY(geo, geo.yStart);
  const y2 = clippedY(geo, geo.yEnd);
  const bothOutside = !insideClip(geo, geo.yStart) && !insideClip(geo, geo.yEnd);
  return bothOutside && y1 === y2 ? undefined : [y1, y2];
}

/** `DriverPolygonSvg:57-61`: a head survives only when EVERY point is inside. */
function headInsideClip(geo: LinkAnchorGeo, dir: ArrowDir, tipY: number, theme: PageTheme): boolean {
  return arrowHeadPointsFor(theme, dir).every((p) => insideClip(geo, tipY + p.y));
}

/** One link: the shaft, its two heads, then the label. Under a page's clip
 *  each shape answers for itself, as the `Driver*Svg`s do. */
function drawLinkAnchor(ug: UGraphic, geo: LinkAnchorGeo, theme: PageTheme): void {
  const [x, yStart, yEnd] = [geo.x, geo.yStart, geo.yEnd];
  const shaft = clippedShaft(geo);
  // `Worm.java:126-132,160-164`: colour, `.bg()`, stroke, then `drawLine`'s
  // `ug.apply(new UTranslate(x1, y1))` and `draw(new ULine(x2 - x1, y2 - y1))`.
  if (shaft !== undefined)
    ug.apply(new Fore(geo.stroke))
      .apply(new Back(geo.stroke))
      .apply(shaftStroke(geo))
      .apply(new UTranslate(x, shaft[0]))
      .draw(new ULine(0, shaft[1] - shaft[0]));
  if (headInsideClip(geo, 'up', yStart, theme)) drawHead(ug, 'up', { x, y: yStart }, geo, theme);
  if (headInsideClip(geo, 'down', yEnd, theme)) drawHead(ug, 'down', { x, y: yEnd }, geo, theme);
  // `DriverTextSvg:88-90`: each run answers for its own anchor.
  const runs = geo.labelRuns.filter((r) => insideClip(geo, r.y));
  drawCreoleRuns(ug, runs, theme, geo.font.size, geo.font.styles.has(FontStyle.BOLD));
}

/** `PlayingSpace#drawUInternal:129-134`'s link loop, once. */
export function drawLinkAnchors(ug: UGraphic, anchors: readonly LinkAnchorGeo[] | undefined, theme: PageTheme): void {
  for (const anchor of anchors ?? []) drawLinkAnchor(ug, anchor, theme);
}
