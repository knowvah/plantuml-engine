/**
 * The per-group `Colors` a cluster reads at draw time: `LINE` for the border, `TEXT` for the title, and
 * `getSpecificLineStroke()` for the stroke. `Namespace.color` keeps only the BACK half.
 */
import { resolveColorToSvgHex } from '../../core/klimt/color/HColorSet.js';
import { parseColor } from '../../core/paint.js';
import type { Paint } from '../../core/paint.js';
import { strokeForStyle } from '../../core/svek/svek-edge-stroke.js';
import { scaleDashArrayString } from './class-scale-geo-row.js';
import type { NamespaceGeo } from './class-geo-namespace-types.js';

/**
 * `Cluster#drawU`: `if (group.getColors().getColor(ColorType.LINE) != null) borderColor = ...; else borderColor =
 * style.value(PName.LineColor)`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/Cluster.java:317-320
 */
export function groupBorderColor(geo: Pick<NamespaceGeo, 'colors'>, styled: Paint): Paint {
  const line = geo.colors?.line;
  if (line === undefined) return styled;
  const parsed = parseColor(line);
  return typeof parsed === 'string' ? resolveColorToSvgHex(parsed) : parsed;
}

/**
 * `Style#getFontConfiguration(set, colors)`: `colors.getColor(ColorType.TEXT)` wins over `FontColor`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/Style.java:259-263
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/ClusterHeader.java:122-123
 */
export function groupTitleColor(geo: Pick<NamespaceGeo, 'colors'>, styled: string): string {
  const text = geo.colors?.text;
  return text === undefined ? styled : resolveColorToSvgHex(text);
}

/** A `line.<style>` stroke: its thickness and its scaled `stroke-dasharray` (absent when solid). */
export interface GroupSpecificStroke {
  readonly thickness: number;
  readonly dasharray: string | undefined;
}

/**
 * `Cluster#getStrokeInternal`: `colors.getSpecificLineStroke()` replaces `style.getStroke()` outright.
 * `undefined` when the group carries no `line.<style>`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/Cluster.java:437-442
 */
export function groupSpecificStroke(geo: Pick<NamespaceGeo, 'colors'>, k: number): GroupSpecificStroke | undefined {
  const lineStyle = geo.colors?.lineStyle;
  if (lineStyle === undefined) return undefined;
  const stroke = strokeForStyle(lineStyle);
  const dash = stroke.getDasharraySvg();
  return {
    thickness: stroke.getThickness(),
    dasharray: dash === undefined ? undefined : scaleDashArrayString(`${dash[0]},${dash[1]}`, k),
  };
}
