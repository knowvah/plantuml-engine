/**
 * The per-shape move `UGraphicCompressOnXorY` gives a `USymbolFrame` title drawn as a plain block (`USymbolFrame
 * .java:153-154`): every non-line shape the title draws goes to `ct()` of its own draw point, not rigidly with the
 * frame (`UGraphicCompressOnXorY.java:107-108`, `getTranslate` `:117-122`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/compress/UGraphicCompressOnXorY.java:100-135
 */
import type { Theme } from '../../../../core/theme.js';
import type { ActivityNodeGeo } from '../../activity-geometry.types.js';
import { withCompositeStyle } from '../../activity-composite-theme.js';
import type { StringBounder } from '../../tiles/tile.js';
import type { PiecewiseAffineTransform } from './compression-transform.js';
import { plainFrameTitle } from './shapes-of-frame.js';

type Axis = 'x' | 'y';

/** What the compression pass needs of the node before and after its own transform. */
export interface FrameTitleMove {
  readonly raw: ActivityNodeGeo;
  readonly moved: ActivityNodeGeo;
  readonly ct: PiecewiseAffineTransform;
  readonly mode: Axis;
}

/**
 * `moved` with `titleShapeDeltas` extended by this pass: shape `i` ends at `ct(p_i)`, the frame at `ct(frame)`, so its
 * offset from the rigid translate is `ct(p_i) - ct(frame) - (p_i - frame)` on the pass's axis.
 */
export function withFrameTitleDeltas(
  move: FrameTitleMove,
  env: { readonly bounder: StringBounder; readonly theme: Theme },
): ActivityNodeGeo {
  const { raw, moved, ct, mode } = move;
  if ((raw.kind !== 'group' && raw.kind !== 'partition') || raw.usymbol !== undefined) return moved;
  const drawn = plainFrameTitle(raw, env.bounder, withCompositeStyle(env.theme, raw.compositeStyle));
  if (drawn === undefined) return moved;
  const frame = raw[mode];
  const deltas = drawn.points.map((p, i) => {
    const prior = raw.titleShapeDeltas?.[i] ?? { dx: 0, dy: 0 };
    const at = p[mode];
    const shift = ct.transform(at) - ct.transform(frame) - (at - frame);
    return mode === 'x' ? { dx: prior.dx + shift, dy: prior.dy } : { dx: prior.dx, dy: prior.dy + shift };
  });
  return { ...moved, titleShapeDeltas: deltas };
}
