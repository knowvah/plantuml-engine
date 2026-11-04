/**
 * `EntityImageStateBorder` — the image class upstream instantiates for a
 * border point (`<<entrypoint>>`/`<<exitpoint>>`/`<<inputPin>>`/
 * `<<outputPin>>`), instead of the ordinary state box.
 *
 * G9/T7: this port had no such dispatch. Every border point rendered through
 * `renderNormal`, which gave it a rounded 12x12 state box (rx/ry=12.5, stroke
 * 0.5), a divider `<line>` below it, and its label at the box's own header
 * position — where jar draws a bare circle or square at stroke 1.5, no
 * divider, and the label OUTSIDE the symbol, above or below.
 *
 * Two upstream methods define the whole shape:
 *
 * - `EntityPosition#drawSymbol` (`abel/EntityPosition.java:82-118`): a
 *   `RADIUS*2` circle for ENTRY_POINT/EXIT_POINT (plus two crossing lines for
 *   EXIT_POINT), a `RADIUS*2` square for INPUT_PIN/OUTPUT_PIN, drawn at the
 *   node's own origin — its dimension is exactly `RADIUS*2` both ways
 *   (`:120-128`), so that origin IS the symbol's top-left.
 * - `EntityImageStateBorder#drawU` (`svek/image/EntityImageStateBorder.java
 *   :79-104`): the label is translated by
 *   `x = -(descWidth - 2*RADIUS)/2` — centred on the symbol — and
 *   `y = -(2*RADIUS + descHeight)` when `upPosition()`, else `y = +2*RADIUS`.
 *
 * Jar-verified against cached oracles: `lulozu-10-bopu547`'s `en1` —
 * `<ellipse cx="25" cy="39.611" rx="6" ry="6" stroke-width:1.5>` with its
 * label at `x=13.319 y=18.5`, which is `symbolTop(33.611) - 12 - 14 +
 * ascent(10.889)` exactly; and `cinoni-00-sere847`'s `EC` — the same ellipse
 * plus `(29.389,176.72)-(21.611,168.942)` and `(29.389,168.942)-(21.611,
 * 176.72)`, which are `getPointOnCircle` at ±PI/4 around `(origin + RADIUS +
 * .5)` with `radius = RADIUS - .5`, to the digit.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageStateBorder.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/abel/EntityPosition.java
 */

import type { StateNodeGeo } from './state-geo-types.js';
import { isTransparentColor, type Paint } from '../../core/paint.js';
import type { Theme } from '../../core/theme.js';
import { ellipse, line, rect, text } from '../../core/svg.js';
import { positionFromStereotype, type EntityPositionKind } from './state-entity-position.js';
import {
  STATE_DEFAULT_BACKGROUND,
  resolveStateBorder,
  resolveStateFillBucketed,
  resolveStateFontColor,
  resolveStateFontSize,
  textAscent,
} from './state-render-colors.js';

/** `EntityPosition.RADIUS` (`:56`). */
import { RADIUS } from '../../core/abel/EntityPosition.js';
import { resolveColorToSvgHex } from '../../core/klimt/color/HColorSet.js';

/** `EntityImageStateBorder#getUStroke` (`:106-108`) — 1.5 for the symbol,
 *  where an ordinary state box uses 0.5. */
const BORDER_POINT_STROKE_WIDTH = 1.5;

/** The two positions `EntityPosition#drawSymbol` gives a circle; every other
 *  border point gets the square. */
const CIRCLE_POSITIONS: ReadonlySet<EntityPositionKind> = new Set(['entrypoint', 'exitpoint']);
const EXPANSION_POSITIONS: ReadonlySet<EntityPositionKind> = new Set(['expansioninput', 'expansionoutput']);

/** `EntityPosition#drawSymbol` for EXPANSION_INPUT/EXPANSION_OUTPUT (`EntityPosition.java:100-116`): a
 *  `RADIUS*2*4` by `RADIUS*2` bar split by three lines under `TOP_TO_BOTTOM`, its transpose otherwise; the
 *  node already carries that dimension (`getBorderPointDimension`, `EntityPosition.java:120-127`).
 *  stdd T6c, bujuta-44's `<<expansionInput>>` under `left to right direction`. */
function expansionSymbol(node: StateNodeGeo, fill: Paint, stroke: Paint): string {
  const lineOpts = { stroke, strokeWidth: BORDER_POINT_STROKE_WIDTH };
  let out = rect(node.x, node.y, node.width, node.height, { fill, ...lineOpts });
  for (let i = 1; i <= 3; i++) {
    const d = RADIUS * 2 * i;
    out +=
      node.width > node.height
        ? line(node.x + d, node.y, node.x + d, node.y + RADIUS * 2, lineOpts)
        : line(node.x, node.y + d, node.x + RADIUS * 2, node.y + d, lineOpts);
  }
  return out;
}

/** `getPointOnCircle` (`EntityPosition.java:130-134`). */
function pointOnCircle(xc: number, yc: number, angle: number, radius: number): [number, number] {
  return [xc + radius * Math.cos(angle), yc + radius * Math.sin(angle)];
}

/** EXIT_POINT's cross (`EntityPosition.java:88-96`) — two chords at ±PI/4
 *  about a centre offset half a pixel from the symbol's own, at a radius half
 *  a pixel inside it. Both offsets are upstream's, not a nudge. */
function exitCross(node: StateNodeGeo, stroke: Paint): string {
  const xc = node.x + RADIUS + 0.5;
  const yc = node.y + RADIUS + 0.5;
  const r = RADIUS - 0.5;
  const opts = { stroke, strokeWidth: BORDER_POINT_STROKE_WIDTH };
  const [ax, ay] = pointOnCircle(xc, yc, Math.PI / 4, r);
  const [bx, by] = pointOnCircle(xc, yc, Math.PI + Math.PI / 4, r);
  const [cx, cy] = pointOnCircle(xc, yc, -Math.PI / 4, r);
  const [dx, dy] = pointOnCircle(xc, yc, Math.PI - Math.PI / 4, r);
  return line(ax, ay, bx, by, opts) + line(cx, cy, dx, dy, opts);
}

/** `EntityPosition#drawSymbol` (`:82-118`). EXPANSION_INPUT/EXPANSION_OUTPUT
 *  draw a four-cell bar of a different size upstream; no corpus fixture
 *  exercises them and `state-leaf-node.ts` already sizes them as the plain
 *  `RADIUS*2` square, so they keep that square here rather than acquire an
 *  unverified shape. */
function drawSymbol(node: StateNodeGeo, pos: EntityPositionKind, fill: Paint, stroke: Paint): string {
  if (EXPANSION_POSITIONS.has(pos)) return expansionSymbol(node, fill, stroke);
  if (!CIRCLE_POSITIONS.has(pos)) {
    // `rect` names the SVG attribute in camelCase; `ellipse`/`line` take the
    // paint bag, which is keyed by the attribute's own hyphenated name.
    return rect(node.x, node.y, RADIUS * 2, RADIUS * 2, {
      fill,
      stroke,
      strokeWidth: BORDER_POINT_STROKE_WIDTH,
    });
  }
  const circle = ellipse(node.x + RADIUS, node.y + RADIUS, RADIUS, RADIUS, {
    fill,
    stroke,
    'stroke-width': BORDER_POINT_STROKE_WIDTH,
  });
  return pos === 'exitpoint' ? circle + exitCross(node, stroke) : circle;
}

/**
 * One border point: its symbol, then its name label above or below.
 *
 * `desc` is a single text block whose height is `lines * fontSize` — the same
 * `MEASURE_LINES` convention every other state box uses for
 * `dimDesc.getHeight()`. The baseline of line `i` is `labelTop + ascent + i *
 * fontSize`, so `drawU`'s `y` offsets land as:
 *   above → `node.y - 2*RADIUS - descHeight`
 *   below → `node.y + 2*RADIUS`
 */
export function renderBorderPoint(node: StateNodeGeo, theme: Theme): string {
  const pos = positionFromStereotype(node.stereotype);
  // `EntityImageStateBorder.java:94-98`: a transparent back colour is replaced by the diagram's own
  // background (`skinParam.getBackgroundColor()`); stdd T6c, xipela-98's `StateBackgroundColor transparent`.
  const styled = resolveStateFillBucketed(node, theme, STATE_DEFAULT_BACKGROUND);
  const fill = isTransparentColor(styled) ? resolveColorToSvgHex(theme.colors.background) : styled;
  const stroke = resolveStateBorder(node, theme);
  const symbol = drawSymbol(node, pos, fill, stroke);
  const lines = node.headerLines ?? [];
  if (lines.length === 0) return symbol;
  // stdd T1b: `EntityImageStateBorder.java:89` draws `desc` before `:103`'s
  // `entityPosition.drawSymbol`, so the label precedes the symbol.
  const fontSize = resolveStateFontSize(node, theme, theme.fontSize);
  const descHeight = lines.length * fontSize;
  const labelTop = node.borderPointLabelAbove === true ? node.y - 2 * RADIUS - descHeight : node.y + 2 * RADIUS;
  const fontColor = resolveStateFontColor(node, theme, '#000000');
  let out = '';
  lines.forEach((ln, i) => {
    out += text(
      // `x = 0 - (dimDesc.getWidth() - 2 * RADIUS) / 2`, relative to the
      // symbol's own origin — i.e. the label is centred on the symbol.
      node.x - (ln.width - 2 * RADIUS) / 2,
      labelTop + textAscent(fontSize) + i * fontSize,
      ln.text,
      {
        fill: fontColor,
        fontFamily: theme.fontFamily,
        fontSize,
        lengthAdjust: 'spacing',
        textLength: ln.width,
      },
    );
  });
  return out + symbol;
}
