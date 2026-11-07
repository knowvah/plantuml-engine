/**
 * A leaf state whose `name` and `description` zones differ (dss T3c), drawn the
 * way `EntityImageState#drawU` does it: through `RoundedContainer`.
 *
 *   northBackcolor = styleName.value(BackGroundColor)          EntityImageState.java:138
 *   southBackcolor = styleDescription.value(BackGroundColor)   EntityImageState.java:139
 *   equal      -> one filled shape                              EntityImageState.java:141-142
 *   otherwise  -> RoundedContainer(.., yLine, 0, north, south, south, ..)
 *                                                               EntityImageState.java:143-150
 *
 * Neither zone reads the inline `#color` (`applyColor` feeds only the single
 * shape), so a differing pair ignores it. `RoundedContainer#drawU`
 * (`RoundedContainer.java:76-95`) draws, in order: the shadow rect, `RoundedNorth`,
 * `RoundedSouth`, the transparent outline and a divider at `nameHeight`;
 * `EntityImageState#drawU` then draws its own divider at the same y
 * (`EntityImageState.java:152`), which is why the jar emits two identical `<line>`s.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageState.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/RoundedContainer.java
 */
import { isTransparentColor, type Paint } from '../../core/paint.js';
import { roundedBottomRectD, roundedTopRectD } from '../../core/svg-path-builder.js';
import { line, path, rect } from '../../core/svg.js';
import type { Theme } from '../../core/theme.js';
import { STATE_DESCRIPTION_BUCKET, STATE_NAME_BUCKET } from './state-bucket-colors.js';
import type { State } from './ast.js';
import type { StateNodeGeo, StateTextLine } from './state-geo-types.js';
import {
  resolveStateFillBucketed,
  STATE_DEFAULT_BACKGROUND,
  stateBorderStrokeAttrs,
  stateRoundCornerOf,
} from './state-render-colors.js';
import { stateShadowFilterUrl } from './state-shadow.js';

/** The two zone fills of a leaf. */
export interface LeafZoneFills {
  readonly north: Paint;
  readonly south: Paint;
}

/**
 * The `name` and `description` fills, or `undefined` when they are equal (the single-shape branch).
 * No `color`: the zones read the style alone (`EntityImageState.java:138-139`).
 *
 * Two gradients are never equal (`EntityImageState.java:141`): `HColorGradient` declares no `equals`
 * (`HColorSimple.java:85` is the only one), and `ValueImpl#asColor` (`ValueImpl.java:92-103`) parses a new one per read
 * (`HColorSet.java:109-116`). So a gradient state always takes `RoundedContainer`, identical stops included.
 */
export function resolveLeafZoneFills(node: Pick<StateNodeGeo, 'stereotype'>, theme: Theme): LeafZoneFills | undefined {
  const styleOnly = node.stereotype === undefined ? {} : { stereotype: node.stereotype };
  const north = resolveStateFillBucketed(styleOnly, theme, STATE_DEFAULT_BACKGROUND, STATE_NAME_BUCKET);
  const south = resolveStateFillBucketed(styleOnly, theme, STATE_DEFAULT_BACKGROUND, STATE_DESCRIPTION_BUCKET);
  return typeof north === 'string' && north === south ? undefined : { north, south };
}

/** What {@link renderZonedLeafBox} draws with. */
export interface ZonedLeafGeometry {
  readonly zones: LeafZoneFills;
  readonly border: Paint;
  readonly radius: number;
  /** The y of the name/description divider (`yLine`, `EntityImageState.java:136`). */
  readonly dividerY: number;
  /** stdd T3b: for the state style's `LineThickness` (`stateBorderStrokeAttrs`). */
  readonly theme: Pick<Theme, 'colors'>;
}

/**
 * `RoundedNorth#drawU` / `RoundedSouth#drawU`: `ug.apply(UStroke.simple()).apply(backColor).apply(backColor.bg())`
 * (`RoundedNorth.java:84`). A solid strokes nothing (`DriverPathSvg.java:65-69`, equal colours); a gradient strokes itself.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/RoundedNorth.java:84
 */
export function roundedZone(d: string, back: Paint): string {
  return typeof back === 'string' ? path(d, { fill: back }) : path(d, { fill: back, stroke: back, strokeWidth: 1 });
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
    ...stateBorderStrokeAttrs(node, geometry.theme),
    rx: radius,
    ry: radius,
  };
  const shadow =
    node.shadowing !== undefined && node.shadowing > 0
      ? rect(node.x, node.y, node.width, node.height, { fill: 'none', ...outline, filter: stateShadowFilterUrl() })
      : '';
  return (
    shadow +
    roundedZone(roundedTopRectD(node.x, node.y, x1, dividerY, radius), zones.north) +
    roundedZone(roundedBottomRectD(node.x, dividerY, x1, y1, radius), zones.south) +
    rect(node.x, node.y, node.width, node.height, { fill: 'none', ...outline }) +
    line(node.x, dividerY, x1, dividerY, { stroke: border, ...stateBorderStrokeAttrs(node, geometry.theme) })
  );
}

/** `skinparam`-less default of the radius the south path rounds with (`plantuml.skin:277-278`, `RoundCorner 25`). */
const STATE_DEFAULT_ROUND_CORNER = 25;

/**
 * stdd T3c: a leaf's name block is created with the `state` style's `HorizontalAlignment`
 * (`EntityImageStateCommon.java:75-78`), `root { HorizontalAlignment left }` (`plantuml.skin:12`),
 * so its lines start at the block's left edge, and the block is centred in the box
 * (`EntityImageState.java:160-162`, `EntityImageStateEmptyDescription.java:88-90`): one x for every line.
 */
export function nameBlockLeft(node: Pick<StateNodeGeo, 'x' | 'width'>, lines: readonly StateTextLine[]): number {
  let blockWidth = 0;
  for (const ln of lines) if (ln.width > blockWidth) blockWidth = ln.width;
  return node.x + (node.width - blockWidth) / 2;
}

/**
 * Whether the leaf's `RoundedSouth` is drawn as a path: the zones differ
 * (`EntityImageState.java:141-150`), the south colour is not transparent
 * (`RoundedSouth.java:60-61`) and the corner is not 0 (`RoundedSouth.java:62-64`
 * draws a `URectangle`, whose ink has the `-1` inset). `<<sdlreceive>>` is
 * `EntityImageState2`, which has no zones (`GeneralImageBuilder.java:138-141`).
 */
export function leafSouthZoneDrawn(state: Pick<State, 'stereotype'>, theme: Theme): boolean {
  if (state.stereotype?.toLowerCase() === 'sdlreceive') return false;
  const zones = resolveLeafZoneFills(state, theme);
  if (zones === undefined || isTransparentColor(zones.south)) return false;
  return (theme.strictUml === true ? 0 : (stateRoundCornerOf(theme) ?? STATE_DEFAULT_ROUND_CORNER)) !== 0;
}
