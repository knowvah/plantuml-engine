/**
 * `SvekResult` for the legacy activity engine: the text block `GraphvizImageBuilder#buildImage` returns. `drawU`
 * is `SvekResult#drawU`'s sequence (every partition, every leaf image translated to its corner, every edge);
 * `calculateDimension` measures that drawing's ink once and shifts everything by `moveDelta(6 - minX, 6 - minY)`
 * (`svekDimension` and `svekInkShift`, the one owner of those constants), answering `minMax.getDimension()
 * .delta(15, 15)`.
 *
 * Port-only: upstream mutates every node, edge and partition position in `moveDelta`; here the shift is one
 * translate applied to the whole drawing, which gives the same coordinates.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekResult.java:60-140
 */
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { svekDimension, svekInkShift, type InkExtent } from '../../core/svek/SvekResult.js';
import type { MinMax } from '../../core/klimt/geom/MinMax.js';
import type { ActivityLegacyEdgeGeo, ActivityLegacyGeometry } from './layout.js';
import type { ActivityLegacySkinParam } from './activity-legacy-skin-param.js';
import { drawCluster } from './renderer-cluster.js';
import { drawEdge, edgeInputOf } from './renderer-edge.js';
import { bindOpaleNotes } from './renderer-opale.js';

/** The seam that measures the ink of a drawing: `TextBlockUtils.getMinMax(this, stringBounder, false)`. */
export type InkWalk = (draw: (ug: UGraphic) => void) => MinMax;

/** What `SvekResult` holds: the solved geometry and the skin param its dot data carried. */
export interface SvekResultInput {
  readonly geometry: ActivityLegacyGeometry;
  readonly skinParam: ActivityLegacySkinParam;
  readonly inkWalk: InkWalk;
  /** The bounder `drawU` measures text with while it builds its inputs. */
  readonly stringBounder: StringBounder;
}

function inkOf(minMax: MinMax): InkExtent {
  return { minX: minMax.getMinX(), minY: minMax.getMinY(), maxX: minMax.getMaxX(), maxY: minMax.getMaxY() };
}

export class ActivityLegacySvekResult implements TextBlock {
  private readonly input: SvekResultInput;
  private ink: InkExtent | undefined;
  private shift = UTranslate.none();
  /** The links an opalised note replaces: `SvekEdge#drawU` returns for them. */
  private readonly opale: ReadonlySet<ActivityLegacyEdgeGeo>;

  constructor(input: SvekResultInput) {
    this.input = input;
    this.opale = bindOpaleNotes(input.geometry, input.skinParam);
  }

  /** @see SvekResult.java:64-100 */
  drawU(ug: UGraphic): void {
    const { geometry, skinParam } = this.input;
    // Under swimlanes the lane lines start at the svek frame's y = 0, so everything else must sit in that frame too:
    // `originShift` is what `shiftToOrigin` took off. Without swimlanes the ink shift alone cancels it.
    const origin = skinParam.swimlanes() ? this.originShiftOf() : UTranslate.none();
    const shifted = ug.apply(this.shift).apply(origin);
    // `drawSwinLinesState` draws the title and the lane lines from y = 0 of the untouched `ug`: only `rectangleArea`
    // and `xyTitle` are moved by `moveDelta`, so a swimlane keeps the ink's x shift and none of its y shift.
    // @see Cluster.java:347-350, 438-446, 129-136
    const clusterUg = skinParam.swimlanes() ? ug.apply(UTranslate.dx(this.shift.getDx() + origin.getDx())) : shifted;
    for (const cluster of geometry.clusters) drawCluster(clusterUg, cluster, skinParam);

    for (const node of geometry.nodes) {
      if (node.image.isHidden()) continue;
      node.image.drawU(shifted.apply(new UTranslate(node.x, node.y)));
    }

    const ids = new Set<string>();
    for (const edge of geometry.edges) {
      if (edge.link.isInvis() || this.opale.has(edge)) continue;
      drawEdge(
        shifted.apply(UTranslate.dx(this.autoLinkOfAGroupDx(edge, origin))),
        edge,
        edgeInputOf(edge, {
          skinParam,
          stringBounder: this.input.stringBounder,
          nodes: geometry.nodes,
          clusters: geometry.clusters,
        }),
        ids,
      );
    }
  }

  /**
   * `link.isAutoLinkOfAGroup()`: the link is drawn `cl.width - (dotPath.start.x - cl.minX)` further right. By the final
   * draw `Cluster#moveDelta` has moved the box while the edge only accumulated `dx` (`SvekEdge.java:1241-1244`), so the
   * jar's `dx` counts a second time; while `calculateDimension` measures, `dx` is 0 and the box unmoved. The jar's `dx`
   * is this pass's translation less `originShift` (this frame plus `originShift` is the svek frame). The start is the
   * clipped path's (`simulateCompound` ran in `solveLine`).
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekEdge.java:863-871
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/Cluster.java:127-137
   */
  private autoLinkOfAGroupDx(edge: ActivityLegacyEdgeGeo, origin: UTranslate): number {
    const cluster = edge.tailCluster;
    const start = edge.points[0];
    if (!edge.link.isAutoLinkOfAGroup() || cluster === undefined || start === undefined) return 0;
    const box = this.input.geometry.clusters.find((c) => c.id === cluster.id)!;
    const measuring = this.ink === undefined;
    const jarDx = measuring ? 0 : this.shift.getDx() + origin.getDx() - (this.input.geometry.originShift?.x ?? 0);
    return box.width - (start.x - box.x) + jarDx;
  }

  private originShiftOf(): UTranslate {
    const shift = this.input.geometry.originShift;
    return shift === undefined ? UTranslate.none() : new UTranslate(shift.x, shift.y);
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
