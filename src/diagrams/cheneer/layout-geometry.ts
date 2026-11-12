/**
 * The solved geometry of the one `GraphvizImageBuilder#buildImage` pass of a Chen diagram: the DOT goes through the
 * one dot-engine seam, and what comes back is mapped onto the leaves and links it was built from. The T2c -> T2d
 * contract (`layoutChen` returns it, `renderChen` reads it, nothing recomputes it).
 *
 * Frame: the one `layoutGraph` answers: node `x`/`y` are the top-left corner, edge points and label centres share
 * the node frame, and `originShift` is what `shiftToOrigin` took off.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GraphvizImageBuilder.java:145-256
 */
import type { DotInputGraph, DotLayoutResult } from '../../core/graph-layout.js';
import { layoutGraph } from '../../core/graph-layout.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { buildChenDot, type ChenDotContext, type ChenDotEdge, type ChenDotNode } from './cheneer-dot.js';

/** A solved leaf: `SvekNode` after `moveDelta`. `x`/`y` are the top-left corner. */
export interface ChenNodeGeo extends ChenDotNode {
  readonly x: number;
  readonly y: number;
}

/** A solved link: `SvekEdge` after `solve`. Points are the spline's control points, label and end-label centres. */
export interface ChenEdgeGeo extends ChenDotEdge {
  readonly points: readonly { readonly x: number; readonly y: number }[];
  /** The centre of the label table (`SvekEdge#getXY` is its corner). */
  readonly labelX?: number;
  readonly labelY?: number;
  readonly labelWidth?: number;
  readonly labelHeight?: number;
  readonly tailLabelX?: number;
  readonly tailLabelY?: number;
  readonly headLabelX?: number;
  readonly headLabelY?: number;
  /** The head arrow attachment point, when the engine reports one. */
  readonly epX?: number;
  readonly epY?: number;
  /** The engine drew the edge head-to-tail (a back edge). */
  readonly reversed?: boolean;
}

/** What the renderer reads. */
export interface ChenGeometry {
  /** The `DotInputGraph` handed to `layoutGraph` (what the DOT-parity gate observes); empty when degenerate. */
  readonly dot: DotInputGraph;
  readonly nodes: readonly ChenNodeGeo[];
  readonly edges: readonly ChenEdgeGeo[];
  /** The size of the solved layout, before `SvekResult#calculateDimension`'s ink measure. */
  readonly width: number;
  readonly height: number;
  /** `shiftToOrigin`'s translation; absent for a diagram that never reached graphviz. */
  readonly originShift?: { readonly x: number; readonly y: number };
  /**
   * `DotData#isDegeneratedWithFewEntities(1)`: the one leaf is drawn as an `EntityImageDegenerated`, with no
   * graphviz pass. `nodes` then holds that leaf at `(0, 0)`. @see GraphvizImageBuilder.java:149-158
   */
  readonly degenerate: boolean;
  /**
   * The `MyElkDrawing` of a diagram laid out by `CucaDiagramFileMakerElk`; `nodes` and `edges` are then empty and the
   * renderer draws this block as is. @see CucaDiagram.java:478-479
   */
  readonly elk?: TextBlock;
}

function nodesOf(nodes: readonly ChenDotNode[], result: DotLayoutResult): ChenNodeGeo[] {
  const byId = new Map(result.nodes.map((n) => [n.id, n] as const));
  return nodes.map((node) => {
    const placed = byId.get(node.id);
    if (placed === undefined) throw new Error(`dot-engine: no position for node ${node.id}`);
    return { ...node, x: placed.x, y: placed.y };
  });
}

function edgesOf(edges: readonly ChenDotEdge[], result: DotLayoutResult): ChenEdgeGeo[] {
  const byId = new Map(result.edges.map((e) => [e.id, e] as const));
  return edges.map((edge) => {
    const solved = byId.get(edge.id);
    if (solved === undefined) throw new Error(`dot-engine: no spline for edge ${edge.id}`);
    // The optional fields are carried only when the engine reported them (`exactOptionalPropertyTypes`).
    const { id: _id, ...rest } = solved;
    return { ...edge, ...rest };
  });
}

/**
 * The DOT of the diagram, its layout, and the leaves and links placed. Calls `layoutGraph` once, in the order the
 * jar writes `svek-1.dot`.
 * @see GraphvizImageBuilder.java:232-256
 */
export function solveChen(ctx: ChenDotContext): ChenGeometry {
  const dot = buildChenDot(ctx);
  const result = layoutGraph(dot.graph);
  return {
    dot: dot.graph,
    nodes: nodesOf(dot.nodes, result),
    edges: edgesOf(dot.edges, result),
    width: result.width,
    height: result.height,
    ...(result.originShift !== undefined ? { originShift: result.originShift } : {}),
    degenerate: false,
  };
}
