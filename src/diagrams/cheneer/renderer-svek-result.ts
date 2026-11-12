/**
 * `SvekResult` for the Chen engine: the text block `GraphvizImageBuilder#buildImage` returns. `drawU` is
 * `SvekResult#drawU`'s sequence (every leaf image translated to its corner, then every edge; Chen has no
 * clusters); `calculateDimension` measures that drawing's ink once and shifts everything by
 * `moveDelta(6 - minX, 6 - minY)` (`svekDimension` and `svekInkShift`, the one owner of those constants), answering
 * `minMax.getDimension().delta(15, 15)`. Adapted from `activity-legacy/renderer-svek-result.ts` (cheneer D2).
 *
 * Port-only: upstream mutates every node and edge position in `moveDelta`; here the shift is one translate applied
 * to the whole drawing, which gives the same coordinates.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekResult.java:60-140
 */
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { MinMax } from '../../core/klimt/geom/MinMax.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { svekDimension, svekInkShift, type InkExtent } from '../../core/svek/SvekResult.js';
import type { ChenEerSkinParam } from './cheneer-skin-param.js';
import type { ChenGeometry } from './layout.js';
import { drawEdge, edgeInputOf } from './renderer-edge.js';

/** The seam that measures the ink of a drawing: `TextBlockUtils.getMinMax(this, stringBounder, false)`. */
export type InkWalk = (draw: (ug: UGraphic) => void) => MinMax;

/** What `SvekResult` holds: the solved geometry and the skin param its dot data carried. */
export interface SvekResultInput {
  readonly geometry: ChenGeometry;
  readonly skinParam: ChenEerSkinParam;
  readonly inkWalk: InkWalk;
}

function inkOf(minMax: MinMax): InkExtent {
  return { minX: minMax.getMinX(), minY: minMax.getMinY(), maxX: minMax.getMaxX(), maxY: minMax.getMaxY() };
}

export class ChenSvekResult implements TextBlock {
  private readonly input: SvekResultInput;
  private ink: InkExtent | undefined;
  private shift = UTranslate.none();

  constructor(input: SvekResultInput) {
    this.input = input;
  }

  /** @see SvekResult.java:64-100 */
  drawU(ug: UGraphic): void {
    const { geometry, skinParam } = this.input;
    const shifted = ug.apply(this.shift);
    for (const node of geometry.nodes) {
      if (node.image.isHidden()) continue;
      node.image.drawU(shifted.apply(new UTranslate(node.x, node.y)));
    }

    const ids = new Set<string>();
    for (const edge of geometry.edges) {
      if (edge.link.isInvis()) continue;
      drawEdge(shifted, edge, edgeInputOf(edge, skinParam), ids);
    }
  }

  /** @see SvekResult.java:126-133 */
  calculateDimension(_stringBounder: StringBounder): XDimension2D {
    if (this.ink === undefined) {
      this.ink = inkOf(this.input.inkWalk((ug) => this.drawU(ug)));
      const { dx, dy } = svekInkShift(this.ink);
      this.shift = new UTranslate(dx, dy);
    }
    const { width, height } = svekDimension(this.ink);
    return new XDimension2D(width, height);
  }
}
