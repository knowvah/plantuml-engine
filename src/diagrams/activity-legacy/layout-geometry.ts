/**
 * The solved geometry of one `GraphvizImageBuilder#buildImage` pass: the DOT of a scope goes through the one
 * dot-engine seam, and what comes back is mapped onto the leaves, links and partitions it was built from. The root
 * pass ({@link ./layout.ts}) and each nested autarkic pass (`GroupMakerActivity`) share it.
 *
 * Frame: the one `layoutGraph` answers: node `x`/`y` are the top-left corner, edge points and label centres share
 * the node frame, and `originShift` is what `shiftToOrigin` took off, so `+ originShift` is the jar's svek frame.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GraphvizImageBuilder.java:145-256
 */
import type { DotInputGraph, DotLayoutResult } from '../../core/graph-layout.js';
import { layoutGraph } from '../../core/graph-layout.js';
import { UPolygon } from '../../core/klimt/shape/UPolygon.js';
import {
  buildActivityLegacyDot,
  type ActivityLegacyDot,
  type ActivityLegacyDotCluster,
  type ActivityLegacyDotContext,
  type ActivityLegacyDotEdge,
  type ActivityLegacyDotNode,
  type NodePolygonStore,
} from './activity-legacy-dot.js';

/** A solved leaf: `SvekNode` after `moveDelta`. `x`/`y` are the top-left corner. */
export interface ActivityLegacyNodeGeo extends ActivityLegacyDotNode {
  readonly x: number;
  readonly y: number;
}

/** A solved link: `SvekEdge` after `solve`. Points are the spline's control points, label and end-label centres. */
export interface ActivityLegacyEdgeGeo extends ActivityLegacyDotEdge {
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

/** A solved partition: `Cluster` after `setPosition`. `x`/`y` are the top-left corner of the box. */
export interface ActivityLegacyClusterGeo extends ActivityLegacyDotCluster {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** The title's centre and size, when the cluster carries a title. */
  readonly label?: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
}

/** What the renderer reads. */
export interface ActivityLegacyGeometry {
  /** The `DotInputGraph` handed to `layoutGraph` (what the DOT-parity gate observes). */
  readonly dot: DotInputGraph;
  readonly nodes: readonly ActivityLegacyNodeGeo[];
  readonly edges: readonly ActivityLegacyEdgeGeo[];
  readonly clusters: readonly ActivityLegacyClusterGeo[];
  /** The size of the solved layout, before `SvekResult#calculateDimension`'s ink measure. */
  readonly width: number;
  readonly height: number;
  /** `shiftToOrigin`'s translation; absent for an empty diagram. */
  readonly originShift?: { readonly x: number; readonly y: number };
  /** The octagon polygons `SvekNode#getPolygon` answers: the renderer fills them from the solved layout. */
  readonly polygons: NodePolygonStore;
}

function nodesOf(dot: ActivityLegacyDot, result: DotLayoutResult): ActivityLegacyNodeGeo[] {
  const byId = new Map(result.nodes.map((n) => [n.id, n] as const));
  return dot.nodes.map((node) => {
    const placed = byId.get(node.id);
    if (placed === undefined) throw new Error(`dot-engine: no position for node ${node.id}`);
    return { ...node, x: placed.x, y: placed.y };
  });
}

function edgesOf(dot: ActivityLegacyDot, result: DotLayoutResult): ActivityLegacyEdgeGeo[] {
  const byId = new Map(result.edges.map((e) => [e.id, e] as const));
  return dot.edges.map((edge) => {
    const solved = byId.get(edge.id);
    if (solved === undefined) throw new Error(`dot-engine: no spline for edge ${edge.id}`);
    // The optional fields are carried only when the engine reported them (`exactOptionalPropertyTypes`).
    const { id: _id, ...rest } = solved;
    return { ...edge, ...rest };
  });
}

function clustersOf(dot: ActivityLegacyDot, result: DotLayoutResult): ActivityLegacyClusterGeo[] {
  const byId = new Map((result.clusters ?? []).map((c) => [c.id, c] as const));
  return dot.clusters.map((cluster) => {
    const box = byId.get(cluster.id);
    if (box === undefined) throw new Error(`dot-engine: no box for cluster ${cluster.id}`);
    const { id: _id, ...rest } = box;
    return { ...cluster, ...rest };
  });
}

/**
 * `SvekNode#setPolygon(minX, minY, points)` for the octagon/hexagon nodes: the printed points, already translated.
 * @see DotStringFactory.java:411-421, SvekNode.java:412-420
 */
function storePolygons(dot: ActivityLegacyDot, result: DotLayoutResult): void {
  const byId = new Map(result.nodes.map((n) => [n.id, n] as const));
  for (const node of dot.nodes) {
    const polygon = byId.get(node.id)?.polygon;
    if (polygon !== undefined) dot.polygons.setPolygon(node.entity, new UPolygon(polygon));
  }
}

/**
 * The DOT of `ctx`'s scope, its layout, and the leaves, links and partitions placed. Calls `layoutGraph` once, in
 * the order the jar writes `svek-N.dot`.
 * @see GraphvizImageBuilder.java:232-256
 */
export function solveActivityLegacy(ctx: ActivityLegacyDotContext): ActivityLegacyGeometry {
  const dot = buildActivityLegacyDot(ctx);
  const result = layoutGraph(dot.graph);
  storePolygons(dot, result);
  return {
    dot: dot.graph,
    nodes: nodesOf(dot, result),
    edges: edgesOf(dot, result),
    clusters: clustersOf(dot, result),
    width: result.width,
    height: result.height,
    ...(result.originShift !== undefined ? { originShift: result.originShift } : {}),
    polygons: dot.polygons,
  };
}
