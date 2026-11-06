/**
 * The dash of an object-family or class box's stroke and of its body divider. Split from
 * `renderer-classifier-colors.ts` (500-line cap).
 */
import { strokeForStyle } from '../../core/svek/svek-edge-stroke.js';
import { lineStyleDash } from '../../core/style-line-style.js';
import type { Theme } from '../../core/theme.js';
import { parseDeclarationColors } from './class-declaration-extractors.js';
import { scaleDashArrayString } from './class-scale-geo-row.js';
import type { ClassifierGeo } from './layout.js';
import { isObjectKind } from './object-kind-style.js';

/**
 * CDD T20 (M1): the SAME `colors.getSpecificLineStroke()` override
 * {@link classBorderStrokeWidth} consults, for the SVG `stroke-dasharray`
 * half of the SAME `UStroke` (`LinkStyle#getStroke3()`, `decoration/
 * LinkStyle.java:97-108` -- DASHED `(7,7)`, DOTTED `(1,3)`, BOLD/unset no
 * dash). Every `rect(...)`/`path(...)`/`line(...)` call that reads {@link
 * classBorder}/{@link classBorderLine} for its `stroke` reads this for its
 * `strokeDasharray`, mirroring the fill/border split's own "one call reads
 * both halves" convention -- `undefined` (no attribute) for every
 * classifier with no inline line-style override, zero behavior change.
 */
export function classBorderStrokeDasharray(geo: ClassifierGeo, theme: Theme, k: number): string | undefined {
  const lineStyle = parseDeclarationColors(geo.color).lineStyle;
  if (lineStyle === undefined) return objectKindDasharray(geo, theme, k);
  const dash = strokeForStyle(lineStyle).getDasharraySvg();
  return dash === undefined ? undefined : scaleDashArrayString(`${dash[0]},${dash[1]}`, k);
}

/**
 * The dash of a body divider. object/map/json: the `<sname>` `LineStyle` dash
 * reaches only the empty-fields placeholder divider (`EntityImageObject.java
 * :110-113` `TextBlockLineBefore(thickness, TextBlockEmpty)`, drawn under the
 * box's own stroke via `UGraphicStencil.create(ug, this, stroke)`, `:215`);
 * a populated object's divider is `BodyEnhanced1`'s thickness-only stroke
 * (jar `object/lisepi-64-mudo307`: `Object_user` line `stroke-width:2`, no
 * dash; `London` placeholder line `stroke-width:2;stroke-dasharray:10,5`).
 */
export function classDividerDasharray(geo: ClassifierGeo, theme: Theme, k: number): string | undefined {
  const inline = parseDeclarationColors(geo.color).lineStyle;
  if (inline === undefined && geo.kind === 'object' && geo.emptyFieldPlaceholder !== true) return undefined;
  return classBorderStrokeDasharray(geo, theme, k);
}

/** object/map/json `style.getStroke()` dash half: `<style> <sname> {
 *  LineStyle 10-5 }` (`Style.java:299-320`); `{0,0}` is an explicit solid. */
function objectKindDasharray(geo: ClassifierGeo, theme: Theme, k: number): string | undefined {
  const scoped = geo.objectStyle?.box.lineStyle;
  const dash =
    scoped !== undefined
      ? lineStyleDash(scoped)
      : isObjectKind(geo.kind)
        ? theme.colors.elements?.[geo.kind]?.lineStyle
        : undefined;
  if (dash === undefined || dash.dashVisible === 0) return undefined;
  return scaleDashArrayString(`${dash.dashVisible},${dash.dashSpace}`, k);
}
