/**
 * `EntityImageTransitionLabel` — a `STATE_TRANSITION_LABEL` leaf (`stateDiagramEdgeLabelStyle node`, #235): the
 * transition's label drawn as a node. Its size is the label's text block plus {@link TRANSITION_LABEL_MARGIN} on every
 * side; it draws an unfilled, unstroked rectangle rounded {@link TRANSITION_LABEL_ROUND_CORNER}, then the text block
 * centred inside it. `drawU` opens no group, and the DOT shape is a plain rectangle ({@link TRANSITION_LABEL_SHAPE}).
 *
 * The text block is the caller's. Upstream builds it from the entity's display in the font of the merged
 * `StyleQueries.ARROW.add(SName.<diagram>).withStereotype(stereotype)` style (`:65-82`); the diagram's `SName` is the
 * caller's to give (state here; the description diagram creates the same leaf type, `CommandLinkElement.java:462`).
 *
 * The dimension fallback (`:94-97`, 20 x 20 when measuring throws) is not ported: a measured text block cannot throw.
 *
 * @see ~/git/knowvah/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageTransitionLabel.java:55-139
 */
import { rect } from '../../svg-shapes.js';

/** @see EntityImageTransitionLabel.java:59 */
export const TRANSITION_LABEL_MARGIN = 4;

/** `URectangle.build(w, h).rounded(5)` (`:120`); the SVG writes half of it as `rx`/`ry`. */
export const TRANSITION_LABEL_ROUND_CORNER = 5;

/** `getShapeType()` is `ShapeType.RECTANGLE` (`:135-138`): DOT `shape=rect`, not rounded. */
export const TRANSITION_LABEL_SHAPE = 'rect';

/** A width and a height (`XDimension2D`). */
export interface TransitionLabelDim {
  readonly width: number;
  readonly height: number;
}

/** `calculateDimensionSlow`: the text block plus the margin on every side. @see EntityImageTransitionLabel.java:89-98 */
export function transitionLabelDimension(text: TransitionLabelDim): TransitionLabelDim {
  return { width: text.width + TRANSITION_LABEL_MARGIN * 2, height: text.height + TRANSITION_LABEL_MARGIN * 2 };
}

/**
 * `drawU` at the node's top-left `(x, y)`: the rectangle (no colour applied, so no fill and no stroke), then the text
 * block at the centred offset, drawn by `drawText(left, top)`. @see EntityImageTransitionLabel.java:117-133
 */
export function drawTransitionLabel(
  x: number,
  y: number,
  text: TransitionLabelDim,
  drawText: (left: number, top: number) => string,
): string {
  const total = transitionLabelDimension(text);
  const half = TRANSITION_LABEL_ROUND_CORNER / 2;
  const frame = rect(x, y, total.width, total.height, { fill: 'none', stroke: 'none', rx: half, ry: half });
  const xText = (total.width - text.width) / 2;
  const yText = (total.height - text.height) / 2;
  return frame + drawText(x + xText, y + yText);
}
