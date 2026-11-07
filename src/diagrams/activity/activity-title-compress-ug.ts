/**
 * Draws a frame title block with each shape moved by its own compression delta: the draw-side half of
 * `UGraphicCompressOnXorY#draw`, which translates every non-line shape by `ct()` of its own anchor
 * (`klimt/compress/UGraphicCompressOnXorY.java:107-108`). The deltas are the ones `compress/frame-title-deltas.ts`
 * measured; the Nth `draw` takes the Nth delta, the order the compression pass recorded the block's shapes in.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/compress/UGraphicCompressOnXorY.java:100-135
 */
import type { UChange } from '../../core/klimt/UChange.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { UShape } from '../../core/klimt/UShape.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { UGraphicDelegator } from '../../core/klimt/drawing/UGraphicDelegator.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';

type Delta = { readonly dx: number; readonly dy: number };

class DeltaUGraphic extends UGraphicDelegator {
  constructor(
    ug: UGraphic,
    private readonly deltas: readonly Delta[],
    private readonly cursor: { next: number },
  ) {
    super(ug);
  }

  apply(change: UChange): UGraphic {
    return new DeltaUGraphic(this.getUg().apply(change), this.deltas, this.cursor);
  }

  draw(shape: UShape): void {
    const delta = this.deltas[this.cursor.next++];
    if (delta === undefined || (delta.dx === 0 && delta.dy === 0)) super.draw(shape);
    else this.getUg().apply(new UTranslate(delta.dx, delta.dy)).draw(shape);
  }
}

/** `tb` drawn so that its Nth shape is moved by `deltas[N]`; `tb` itself when nothing moves. */
export function withTitleShapeDeltas(tb: TextBlock, deltas: readonly Delta[] | undefined): TextBlock {
  if (deltas === undefined || deltas.every((d) => d.dx === 0 && d.dy === 0)) return tb;
  return {
    calculateDimension: (sb: StringBounder): XDimension2D => tb.calculateDimension(sb),
    drawU: (ug: UGraphic): void => tb.drawU(new DeltaUGraphic(ug, deltas, { next: 0 })),
  };
}
