/**
 * A leaf state whose `name` and `description` zones differ (dss T3c), drawn the
 * way `EntityImageState#drawU` does it: through `RoundedContainer`.
 *
 *   northBackcolor = styleName.value(BackGroundColor)          EntityImageState.java:131
 *   southBackcolor = styleDescription.value(BackGroundColor)   EntityImageState.java:132
 *   equal      -> one filled shape                              EntityImageState.java:134-135
 *   otherwise  -> RoundedContainer(.., yLine, 0, north, south, south, ..)
 *                                                               EntityImageState.java:137-142
 *
 * Neither zone reads the inline `#color` (`applyColor` feeds only the single
 * shape), so a differing pair ignores it. `RoundedContainer#drawU`
 * (`RoundedContainer.java:76-95`) draws, in order: the shadow rect, `RoundedNorth`,
 * `RoundedSouth`, the transparent outline and a divider at `nameHeight`;
 * `EntityImageState#drawU` then draws its own divider at the same y
 * (`EntityImageState.java:144`), which is why the jar emits two identical `<line>`s.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageState.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/RoundedContainer.java
 */
import { isTransparentColor } from '../../core/paint.js';
import { roundedBottomRectD, roundedTopRectD } from '../../core/svg-path-builder.js';
import { line, path, rect } from '../../core/svg.js';
import type { Theme } from '../../core/theme.js';
import { STATE_DESCRIPTION_BUCKET, STATE_NAME_BUCKET } from './state-bucket-colors.js';
import type { State } from './ast.js';
import type { StateNodeGeo } from './state-geo-types.js';
import {
  STATE_BORDER_STROKE_WIDTH,
  resolveStateFillBucketed,
  STATE_DEFAULT_BACKGROUND,
} from './state-render-colors.js';
import { stateShadowFilterUrl } from './state-shadow.js';

/** The two zone fills of a leaf. */
export interface LeafZoneFills {
  readonly north: string;
  readonly south: string;
}

/**
 * The `name` and `description` fills, or `undefined` when they are equal (the single-shape branch).
 * No `color`: the zones read the style alone (`EntityImageState.java:131-132`).
 */
export function resolveLeafZoneFills(node: Pick<StateNodeGeo, 'stereotype'>, theme: Theme): LeafZoneFills | undefined {
  const styleOnly = node.stereotype === undefined ? {} : { stereotype: node.stereotype };
  const north = resolveStateFillBucketed(styleOnly, theme, STATE_DEFAULT_BACKGROUND, STATE_NAME_BUCKET);
  const south = resolveStateFillBucketed(styleOnly, theme, STATE_DEFAULT_BACKGROUND, STATE_DESCRIPTION_BUCKET);
  return north === south ? undefined : { north, south };
}

/** What {@link renderZonedLeafBox} draws with. */
export interface ZonedLeafGeometry {
  readonly zones: LeafZoneFills;
  readonly border: string;
  readonly radius: number;
  /** The y of the name/description divider (`yLine`, `EntityImageState.java:125`). */
  readonly dividerY: number;
}

/**
 * `RoundedContainer#drawU` for a leaf: shadow rect (if any), north path, south path, outline, divider.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/RoundedContainer.java:76-95
 */
export function renderZonedLeafBox(node: StateNodeGeo, geometry: ZonedLeafGeometry): string {
  const { zones, border, radius, dividerY } = geometry;
  const x1 = node.x + node.width;
  const y1 = node.y + node.height;
  const outline = {
    stroke: border,
    strokeWidth: STATE_BORDER_STROKE_WIDTH,
    rx: radius,
    ry: radius,
  };
  const shadow =
    node.shadowing !== undefined && node.shadowing > 0
      ? rect(node.x, node.y, node.width, node.height, { fill: 'none', ...outline, filter: stateShadowFilterUrl() })
      : '';
  return (
    shadow +
    path(roundedTopRectD(node.x, node.y, x1, dividerY, radius), { fill: zones.north }) +
    path(roundedBottomRectD(node.x, dividerY, x1, y1, radius), { fill: zones.south }) +
    rect(node.x, node.y, node.width, node.height, { fill: 'none', ...outline }) +
    line(node.x, dividerY, x1, dividerY, { stroke: border, strokeWidth: STATE_BORDER_STROKE_WIDTH })
  );
}

/** `skinparam`-less default of the radius the south path rounds with (`plantuml.skin:277-278`, `RoundCorner 25`). */
const STATE_DEFAULT_ROUND_CORNER = 25;

/**
 * Whether the leaf's `RoundedSouth` is drawn as a path: the zones differ
 * (`EntityImageState.java:134-142`), the south colour is not transparent
 * (`RoundedSouth.java:60-61`) and the corner is not 0 (`RoundedSouth.java:62-64`
 * draws a `URectangle`, whose ink has the `-1` inset). `<<sdlreceive>>` is
 * `EntityImageState2`, which has no zones (`GeneralImageBuilder.java:138-141`).
 */
export function leafSouthZoneDrawn(state: Pick<State, 'stereotype'>, theme: Theme): boolean {
  if (state.stereotype?.toLowerCase() === 'sdlreceive') return false;
  const zones = resolveLeafZoneFills(state, theme);
  if (zones === undefined || isTransparentColor(zones.south)) return false;
  return (
    (theme.strictUml === true ? 0 : (theme.colors.graph.stateCascadeRoundCorner ?? STATE_DEFAULT_ROUND_CORNER)) !== 0
  );
}
