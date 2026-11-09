/**
 * The swimlane DOT of a cluster, shared by the three consumers of one `DotInputGraph` (the text emitter, the node
 * encounter order and the layout builder), opt-in per cluster: only an engine that sets
 * `DotInputCluster.swimlane` gets any of it, so class, description and state DOT are untouched.
 *
 * Upstream, `skinParam.useSwimlanes(type)` (`SkinParam.java:850-859`, ACTIVITY only) turns on four things:
 *
 * - every cluster has a `minPoint<color>` and a `maxPoint<color>` (`Cluster.java:657-668`); `manageMinMaxCluster`
 *   writes them, before anything else, as `{rank=min;...}` and `{rank=max;...}` (`DotStringFactory.java:176, 207-240`);
 * - inside each cluster, after the title, a `{rank = source; sourceIn<color> [...];minPoint<color>->sourceIn<color>
 *   [weight=999];}` group and a `{rank = sink; sinkIn<color> [...];}sinkIn<color>->maxPoint<color> [weight=999];`
 *   group (`ClusterDotString.java:157-170, 206-217`). The edges sit inside the cluster's subgraph, so cgraph makes
 *   `minPoint` and `maxPoint` members of it: each cluster spans the whole height, which is the lane;
 * - no `p0`/`p1` protection wrappers (`ClusterDotString.java:299-315`): the engine leaves `innerMarginLevels` unset.
 *
 * The text names the points by the cluster's colour value; the layout, which has no colour, names them by cluster id.
 * Either way the points are layout scaffolding: {@link swimlanePointIds} lets the layout drop them from its result.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/ClusterDotString.java:157-215
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/DotStringFactory.java:205-240
 */
import type { GvGraphBuilder } from '@knowvah/dot-engine';
import type { DotInputCluster, DotInputEdge, DotInputGraph, DotInputNode } from './graph-layout.types.js';

/** `Cluster.java:657-668`'s prefixes and `ClusterDotString.java:206-217`'s. */
const MIN_POINT = 'minPoint';
const MAX_POINT = 'maxPoint';
const SOURCE_IN = 'sourceIn';
const SINK_IN = 'sinkIn';

/** `[weight=999]` on both lane edges. @see ClusterDotString.java:161, 168 */
const LANE_EDGE_WEIGHT = 999;

/** The shape line of every point: `[shape=point,width=.01,label=""]`. @see DotStringFactory.java:224 */
const POINT_DECL = '[shape=point,width=.01,label=""]';

export interface SwimlaneNames {
  readonly min: string;
  readonly max: string;
  readonly sourceIn: string;
  readonly sinkIn: string;
}

/** The four point names of a cluster known by `key` (the colour value in the text, the cluster id in the layout). */
export function swimlaneNames(key: string): SwimlaneNames {
  return {
    min: `${MIN_POINT}${key}`,
    max: `${MAX_POINT}${key}`,
    sourceIn: `${SOURCE_IN}${key}`,
    sinkIn: `${SINK_IN}${key}`,
  };
}

/** The clusters `allCluster()` gives `manageMinMaxCluster`, in creation order. */
export function swimlaneClusters(input: DotInputGraph): DotInputCluster[] {
  return (input.clusters ?? []).filter((c) => c.swimlane === true && c.isTogether !== true);
}

/** `manageMinMaxCluster`: the two rank groups, `minPoint`s then `maxPoint`s. @see DotStringFactory.java:207-240 */
export function swimlaneRankLines(keys: readonly string[]): string[] {
  if (keys.length === 0) return [];

  const group = (rank: string, pick: (n: SwimlaneNames) => string): string =>
    `{rank=${rank};${keys.map((k) => `${pick(swimlaneNames(k))} ${POINT_DECL};`).join('')}}`;
  return [group('min', (n) => n.min), group('max', (n) => n.max)];
}

/** The two groups after a cluster's title, `printInternal`'s `useSwimlanes` block. @see ClusterDotString.java:157-170 */
export function swimlaneClusterLines(key: string): string[] {
  const n = swimlaneNames(key);
  return [
    `{rank = source; ${n.sourceIn} ${POINT_DECL};${n.min}->${n.sourceIn}  [weight=${LANE_EDGE_WEIGHT}];}`,
    `{rank = sink; ${n.sinkIn} ${POINT_DECL};}${n.sinkIn}->${n.max}  [weight=${LANE_EDGE_WEIGHT}];`,
  ];
}

/** The ids the layout creates for `input`'s swimlane scaffolding: nodes and edges, to drop from the result. */
export function swimlanePointIds(input: DotInputGraph): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const c of swimlaneClusters(input)) for (const id of layoutScaffolding(c.id)) ids.add(id);
  return ids;
}

function layoutScaffolding(clusterId: string): string[] {
  const n = swimlaneNames(clusterId);
  return [n.min, n.max, n.sourceIn, n.sinkIn, laneEdgeId(n.min), laneEdgeId(n.max)];
}

const laneEdgeId = (pointName: string): string => `swimlane-edge:${pointName}`;

/** The ids graphviz's parser meets first: every `minPoint`, then every `maxPoint`. @see DotStringFactory.java:176 */
export function swimlaneEncounterHead(input: DotInputGraph): string[] {
  const clusters = swimlaneClusters(input);
  return [...clusters.map((c) => swimlaneNames(c.id).min), ...clusters.map((c) => swimlaneNames(c.id).max)];
}

function pointNode(id: string, rank?: 'min' | 'max'): DotInputNode {
  return { id, width: 0, height: 0, shape: 'point', ...(rank === undefined ? {} : { attributes: { rank } }) };
}

function laneEdge(id: string, from: string, to: string): DotInputEdge {
  return { id: laneEdgeId(id), from, to, attributes: { weight: LANE_EDGE_WEIGHT } };
}

/** A kermor lane's two points: `minPoint` and `maxPoint` in the root rank groups. @see DotStringFactory.java:207-240 */
function kermorPoints(c: DotInputCluster): DotInputNode[] {
  const n = swimlaneNames(c.id);
  return [pointNode(n.min, 'min'), pointNode(n.max, 'max')];
}

/**
 * The graph the layout solves: `input` plus the scaffolding the text carries. The text emitter reads the graph
 * without it and writes it as text; the layout has no text, so the points become nodes and edges here. Each lane's
 * edges come first among the non-`lines0` edges, as in the text, where they sit between the two edge batches.
 * `minPoint`/`maxPoint` join their cluster's members (`nodeIds`) ahead of its own, `sourceIn` and `sinkIn` beside
 * them, which is the order their first mention creates them in. Under kermor only the two root points are added.
 */
export function withSwimlanePoints(input: DotInputGraph): DotInputGraph {
  const lanes = swimlaneClusters(input);
  if (lanes.length === 0) return input;

  // `ClusterDotStringKermor#printInternal` (`:100-157`) writes no source/sink group and no lane edge: under kermor
  // the points are the root rank groups of `manageMinMaxCluster` alone, members of no cluster.
  if (input.kermor === true) return { ...input, nodes: [...input.nodes, ...lanes.flatMap(kermorPoints)] };

  const nodes: DotInputNode[] = [];
  const edges: DotInputEdge[] = [];
  const members = new Map<string, string[]>();
  for (const c of lanes) {
    const n = swimlaneNames(c.id);
    nodes.push(pointNode(n.min, 'min'), pointNode(n.max, 'max'), pointNode(n.sourceIn), pointNode(n.sinkIn));
    edges.push(laneEdge(n.min, n.min, n.sourceIn), laneEdge(n.max, n.sinkIn, n.max));
    members.set(c.id, [n.min, n.sourceIn, n.sinkIn, n.max]);
  }
  const clusters = (input.clusters ?? []).map((c) => {
    const lane = members.get(c.id);
    return lane === undefined ? c : { ...c, nodeIds: [...lane, ...c.nodeIds] };
  });
  return { ...input, nodes: [...input.nodes, ...nodes], edges: [...edges, ...input.edges], clusters };
}

/**
 * The two rank groups inside a lane cluster's subgraph: `{rank = source}` holds `sourceIn` and, through the lane
 * edge written inside it, `minPoint`; `{rank = sink}` holds `sinkIn`. Named so dot-engine does not take them for
 * clusters (`cluster`-prefixed subgraphs are promoted).
 * @see ClusterDotString.java:157-170
 */
export function addSwimlaneRanks(main: GvGraphBuilder, clusterId: string): void {
  const n = swimlaneNames(clusterId);
  const source = main.addSubgraph(`__swimlane_source_${clusterId}`, { rank: 'source' });
  source.addNode(n.sourceIn);
  source.addNode(n.min);
  main.addSubgraph(`__swimlane_sink_${clusterId}`, { rank: 'sink' }).addNode(n.sinkIn);
}
