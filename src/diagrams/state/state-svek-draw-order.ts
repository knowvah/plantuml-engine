/**
 * state-svek-draw-order.ts — the three lists `SvekResult#drawU` walks
 * (`svek/SvekResult.java:70-100`): every cluster of `Bibliotekon#allCluster`,
 * then every node of `allNodes`, then every line of `allLines`
 * (`svek/Bibliotekon.java:52-120,166-184`). Read off a pass's `StateNodeGeo`
 * tree, which nests a cluster's members under it while the jar keeps them in
 * the one flat `Bibliotekon` of the pass (stdd T1c, D2).
 *
 * Who fills the lists, in order (`svek/GraphvizImageBuilder.java:226-232`):
 *
 * 1. `printGroups(root)` (`:408-433`): for each child group in quark order,
 *    `openCluster` appends the cluster, `printEntities(g.leafs())` appends
 *    its leaf nodes, then the recursion appends its sub-clusters and their
 *    nodes. An autarkic group (`Entity#isAutarkic`, `abel/Entity.java:690-715`)
 *    was muted to a leaf before this (`CucaDiagramFileMakerSvek`), so it is
 *    one of its parent's leafs here, drawn by its own inner result.
 * 2. `printEntities(getUnpackagedEntities())`: the root's own leafs.
 * 3. `for (Link link : dotData.getLinks()) addLine(...)`: the pass's links.
 *    The root pass receives `getOrderedLinks()`
 *    (`svek/CucaDiagramFileMakerSvek.java:90-114`); an inner pass receives
 *    `getPureInnerLinks()` in plain `diagram.getLinks()` order
 *    (`svek/GroupMakerState.java:101-107,142`).
 *
 * `Quark#getChildren` and `CucaDiagram#links` are both in creation order, so
 * `creationIndex` (`net.atmp.CucaDiagram#cpt1`) orders both; an item without
 * one keeps its array position.
 */
import type { StateNodeGeo, TransitionGeo } from './state-geo-types.js';
import { zaentId } from './state-composite-classify.js';

const ZAENT_PREFIX = zaentId('');

/** A `'cluster'`-classified composite: a nested `Cluster`, its members in this pass. */
export function isSvekCluster(node: StateNodeGeo): boolean {
  return node.clusterHeaderHeight !== undefined;
}

function byCreationIndex<T extends { readonly creationIndex?: number }>(items: readonly T[]): T[] {
  return items
    .map((item, i) => ({ item, i }))
    .sort((a, b) => (a.item.creationIndex ?? a.i) - (b.item.creationIndex ?? b.i) || a.i - b.i)
    .map((e) => e.item);
}

/** `Bibliotekon#allCluster`: `openCluster` order, a pre-order walk of the pass's clusters. */
export function allCluster(nodes: readonly StateNodeGeo[]): StateNodeGeo[] {
  const out: StateNodeGeo[] = [];
  for (const cluster of byCreationIndex(nodes.filter(isSvekCluster))) {
    out.push(cluster);
    out.push(...allCluster(cluster.children));
  }
  return out;
}

/**
 * `Bibliotekon#allNodes` (`nodeMap` insertion order): `printGroups` runs before
 * the root's `printEntities`, and inside a group `printEntities(g.leafs())` runs
 * before `printGroups(g)`, so a cluster's leafs come after the clusters that
 * precede it and before its own sub-clusters' leafs; the root's leafs come last.
 */
export function allNodes(nodes: readonly StateNodeGeo[]): StateNodeGeo[] {
  const out: StateNodeGeo[] = [];
  for (const cluster of byCreationIndex(nodes.filter(isSvekCluster))) out.push(...nodesOfGroup(cluster));
  out.push(...byCreationIndex(nodes.filter((n) => !isSvekCluster(n))));
  return out;
}

/** `printGroup` (`GraphvizImageBuilder.java:426-433`): the group's leafs, then its groups. */
function nodesOfGroup(cluster: StateNodeGeo): StateNodeGeo[] {
  const out = byCreationIndex(cluster.children.filter((n) => !isSvekCluster(n)));
  for (const sub of byCreationIndex(cluster.children.filter(isSvekCluster))) out.push(...nodesOfGroup(sub));
  return out;
}

/** The pass's links: its own plus every nested cluster's (a cluster shares its pass's `Bibliotekon`). */
export function allLines(
  nodes: readonly StateNodeGeo[],
  own: readonly TransitionGeo[],
  atRoot: boolean,
): TransitionGeo[] {
  return orderLinks([...own, ...clusterLines(nodes)], atRoot);
}

function clusterLines(nodes: readonly StateNodeGeo[]): TransitionGeo[] {
  const out: TransitionGeo[] = [];
  for (const n of nodes) {
    if (!isSvekCluster(n)) continue;
    out.push(...n.transitions, ...clusterLines(n.children));
  }
  return out;
}

/** `Link#getEntity1/2` for `sameConnections`: a zaent anchor stands for its cluster. */
function entityOf(endpoint: string): string {
  return endpoint.startsWith(ZAENT_PREFIX) ? endpoint.slice(ZAENT_PREFIX.length) : endpoint;
}

/** `Link#sameConnections` (`abel/Link.java:462-470`): the same two entities, either way round. */
function sameConnections(a: TransitionGeo, b: TransitionGeo): boolean {
  const a1 = entityOf(a.from);
  const a2 = entityOf(a.to);
  const b1 = entityOf(b.from);
  const b2 = entityOf(b.to);
  return (a1 === b1 && a2 === b2) || (a1 === b2 && a2 === b1);
}

/**
 * `CucaDiagramFileMakerSvek#getOrderedLinks` (`:90-96`) over creation order when
 * `ordered`; plain creation order otherwise (`GroupMakerState#getPureInnerLinks`).
 */
export function orderLinks(links: readonly TransitionGeo[], ordered: boolean): TransitionGeo[] {
  const inOrder = byCreationIndex(links);
  if (!ordered) return inOrder;
  const result: TransitionGeo[] = [];
  for (const link of inOrder) addLinkNew(result, link);
  return result;
}

/** `CucaDiagramFileMakerSvek#addLinkNew` (`:98-114`). */
function addLinkNew(result: TransitionGeo[], link: TransitionGeo): void {
  for (let i = 0; i < result.length; i++) {
    if (!sameConnections(result[i]!, link)) continue;
    while (i < result.length && sameConnections(result[i]!, link)) i++;
    result.splice(i, 0, link);
    return;
  }
  result.push(link);
}
