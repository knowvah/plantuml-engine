import { layoutGraph, type DotInputEdge, type DotInputGraph, type DotInputNode } from '../../core/graph-layout.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { XPoint2D } from '../../core/klimt/geom/XPoint2D.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { HColor } from '../../core/style/Value.js';
import { Mirror } from '../json/Mirror.js';
import { GitCurve } from './GitCurve.js';
import type { GNode } from './GNode.js';
import { gitStyleOf, MagicBox, type GitSkinParam } from './MagicBox.js';

/** `agsafeset(g, "ranksep", "0.35")`. @see SmetanaForGit.java:152 */
const RANKSEP = '0.35';
/** `SmetanaForGit#createEdge`'s three attributes. @see SmetanaForGit.java:193-195 */
const EDGE_ATTRS = { arrowsize: '.7', arrowtail: 'none', arrowhead: 'normal' } as const;

/** One laid-out node in the engine's frame: `ND_coord` (centre, y up) and `ND_width/height * 72`. */
interface EngineNode {
  readonly cx: number;
  readonly cy: number;
  readonly width: number;
  readonly height: number;
}

/** One laid-out edge in the engine's frame: the bezier control points and `bezier.ep`. */
interface EngineEdge {
  readonly points: readonly XPoint2D[];
  readonly ep: XPoint2D | undefined;
}

/**
 * SmetanaForGit — builds the git graph, lays it out, and draws every box then
 * every edge.
 *
 * Upstream lays out through Smetana; this port calls `core/graph-layout`
 * (`@knowvah/dot-engine`, ruling 2026-08-09) with the same graph, attribute for
 * attribute (gip D2): `ranksep=0.35` only, one `shape=box` node per `GNode`
 * named `N<num>` with `getBigDim / 72` inches and no `fixedsize`/`label`, one
 * edge per `getDowns()` entry. Every position and size drawn is the engine's,
 * read back as upstream reads `ND_coord`/`ND_width`/`ND_height`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/gitlog/SmetanaForGit.java:71-214
 */
export class SmetanaForGit {
  /** @see SmetanaForGit.java:73-74 */
  private readonly skinParam: GitSkinParam;
  private readonly stringBounder: StringBounder;
  /** `nodes` keeps insertion order, as the `LinkedHashMap`. @see SmetanaForGit.java:78 */
  private nodes: Map<GNode, EngineNode> | undefined;
  /** @see SmetanaForGit.java:79 */
  private readonly edges: EngineEdge[] = [];
  /** @see SmetanaForGit.java:80 */
  private yMirror: Mirror | undefined;

  /** @see SmetanaForGit.java:82-85 */
  constructor(stringBounder: StringBounder, skinParam: GitSkinParam) {
    this.stringBounder = stringBounder;
    this.skinParam = skinParam;
  }

  /** @see SmetanaForGit.java:92-94 */
  private arrowColor(): HColor {
    return gitStyleOf(this.skinParam).value('LineColor').asColor(this.skinParam.getIHtmlColorSet());
  }

  /** Every box (rect, comment, names), then every edge. `ND_width * 72` is already points here. @see SmetanaForGit.java:96-113 */
  drawMe(ug: UGraphic, gnodes: readonly GNode[]): void {
    const nodes = this.initGraph(gnodes);
    const styled = gitStyleOf(this.skinParam).applyStrokeAndLineColor(ug, this.skinParam.getIHtmlColorSet());
    for (const [gnode, node] of nodes) {
      const pos = this.getPosition(node);
      const magicBox = new MagicBox(this.skinParam, gnode);
      magicBox.drawBorder(styled.apply(pos), SmetanaForGit.getSize(node));
    }
    for (const edge of this.edges)
      new GitCurve(edge.points, edge.ep, this.yMirror!).drawCurve(this.arrowColor(), styled);
  }

  /** The farthest box corner; edges do not count. @see SmetanaForGit.java:115-127 */
  calculateDimension(gnodes: readonly GNode[]): XDimension2D {
    const nodes = this.initGraph(gnodes);
    let maxX = 0;
    let maxY = 0;
    for (const node of nodes.values()) {
      const pos = this.getPosition(node);
      const size = SmetanaForGit.getSize(node);
      maxX = Math.max(maxX, pos.getDx() + size.getWidth());
      maxY = Math.max(maxY, pos.getDy() + size.getHeight());
    }
    return new XDimension2D(maxX, maxY);
  }

  /** @see SmetanaForGit.java:129-134 */
  private static getSize(node: EngineNode): XDimension2D {
    return new XDimension2D(node.width, node.height);
  }

  /** The top-left corner, y mirrored about the lowest box bottom. @see SmetanaForGit.java:136-143 */
  private getPosition(node: EngineNode): UTranslate {
    return new UTranslate(node.cx - node.width / 2, this.yMirror!.inv(node.cy + node.height / 2));
  }

  /**
   * Builds and lays out the graph once. `createEdge`'s null-endpoint skip
   * (`:188-190`) cannot fire: every `getDowns()` target is a node of
   * `GNodeBuilder#getAllNodes`, folding rewires links only between kept nodes.
   * @see SmetanaForGit.java:145-183
   */
  private initGraph(gnodes: readonly GNode[]): Map<GNode, EngineNode> {
    if (this.nodes !== undefined) return this.nodes;
    const ids = new Map<GNode, string>();
    const dotNodes: DotInputNode[] = [];
    for (const gnode of gnodes) {
      const dim = new MagicBox(this.skinParam, gnode).getBigDim(this.stringBounder);
      ids.set(gnode, SmetanaForGit.createNode(dotNodes, dim));
    }
    const dotEdges: DotInputEdge[] = [];
    for (const [gnode, id] of ids)
      for (const parent of gnode.getDowns()) {
        const to = ids.get(parent);
        if (to !== undefined) dotEdges.push({ id: `e${dotEdges.length}`, from: id, to, attributes: { ...EDGE_ATTRS } });
      }
    const input: DotInputGraph = { nodes: dotNodes, edges: dotEdges, smetanaRankSep: RANKSEP };
    const { engineNodes = [], engineEdges = [] } = layoutGraph(input, { read: 'exact' });
    const byId = new Map(engineNodes.map((n) => [n.id, n]));
    this.nodes = new Map([...ids].map(([gnode, id]) => [gnode, byId.get(id)!]));
    // In creation order, as upstream's `edges` list: the snapshot's order is the engine's.
    const edgeById = new Map(engineEdges.map((e) => [e.id, e]));
    for (const { id } of dotEdges) {
      const e = edgeById.get(id)!;
      const ep = e.epX === undefined || e.epY === undefined ? undefined : new XPoint2D(e.epX, e.epY);
      this.edges.push({ points: e.points.map((p) => new XPoint2D(p.x, p.y)), ep });
    }
    let max = 0;
    for (const node of this.nodes.values()) max = Math.max(max, node.cy + node.height);
    this.yMirror = new Mirror(max);
    return this.nodes;
  }

  /**
   * `N<num>`, `shape=box`, height then width in Java `"" + double` inches
   * (`DotInputNodeShape` 'box', gip T1c).
   * @see SmetanaForGit.java:199-212
   */
  private static createNode(dotNodes: DotInputNode[], dim: XDimension2D): string {
    const id = `N${dotNodes.length}`;
    dotNodes.push({ id, width: dim.getWidth(), height: dim.getHeight(), shape: 'box' });
    return id;
  }
}
