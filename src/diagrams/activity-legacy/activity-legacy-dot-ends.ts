/**
 * The two DOT ends of a legacy activity `SvekEdge` and the special point of a linked partition: `Bibliotekon
 * #getNodeUid` names a leaf's node, else a group's `Cluster.getSpecialPointId`; an end that is a special point
 * records the group's cluster as `ltail`/`lhead` (`getCluster2`). Split from `activity-legacy-dot.ts` (file cap).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/Bibliotekon.java:126-137
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekEdge.java:219-258
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/ClusterDotString.java:91-99, 148-152, 317-323
 */
import type { Entity } from '../../core/abel/Entity.js';
import type { Link } from '../../core/abel/Link.js';
import type { DotInputNode } from '../../core/graph-layout.types.js';
import { getSpecialPointId } from '../../core/svek/Cluster.js';

/** `width=.01` (inches) of the special point, in DOT points. @see ClusterDotString.java:149 */
const SPECIAL_POINT_SIZE = 0.01 * 72;

/** What {@link edgeEndsOf} needs of a cluster: its group. */
interface GroupCluster {
  readonly group: Entity;
}

/** An edge's link and its ends, as {@link edgeEndsOf} recorded them. */
interface EndedEdge {
  readonly link: Link;
  readonly startUid: string;
  readonly endUid: string;
  readonly tailCluster?: unknown;
  readonly headCluster?: unknown;
}

/** `Bibliotekon#getNodeUid` for an end `buildEdges` admitted: its node (its uid), else the group's special point. */
function getNodeUid(placed: ReadonlySet<Entity>, entity: Entity): string {
  return placed.has(entity) ? entity.getUid() : getSpecialPointId(entity);
}

/** `getCluster2`: the first cluster whose groups (the singleton of its group) contain `entity`. @see SvekEdge.java:219-225, Cluster.java:253-255 */
function getCluster2<C extends GroupCluster>(clusters: readonly C[], entity: Entity): C {
  const found = clusters.find((cl) => cl.group === entity);
  if (found === undefined) throw new Error('IllegalArgumentException: no cluster holds the linked group');
  return found;
}

/** `startUid`/`endUid`, and `ltail`/`lhead` for an end that is a special point (`startsWith(Cluster.CENTER_ID)`). @see SvekEdge.java:249-258 */
export function edgeEndsOf<C extends GroupCluster>(
  link: Link,
  placed: ReadonlySet<Entity>,
  clusters: readonly C[],
): { startUid: string; endUid: string; tailCluster?: C; headCluster?: C } {
  return {
    startUid: getNodeUid(placed, link.getEntity1()),
    endUid: getNodeUid(placed, link.getEntity2()),
    ...(placed.has(link.getEntity1()) ? {} : { tailCluster: getCluster2(clusters, link.getEntity1()) }),
    ...(placed.has(link.getEntity2()) ? {} : { headCluster: getCluster2(clusters, link.getEntity2()) }),
  };
}

/** `isThereALinkFromOrToGroup(lines)`: `SvekEdge#isLinkFromOrTo` is identity. @see ClusterDotString.java:317-323, SvekEdge.java:1270-1272 */
export function isThereALinkFromOrToGroup(edges: readonly EndedEdge[], group: Entity): boolean {
  return edges.some((e) => e.link.getEntity1() === group || e.link.getEntity2() === group);
}

/** `<id> [shape=point,width=.01,label=""]`, declared in the base cluster. @see ClusterDotString.java:148-149 */
export function specialPointNode(id: string): DotInputNode {
  return { id, width: SPECIAL_POINT_SIZE, height: SPECIAL_POINT_SIZE, shape: 'point' };
}

/**
 * Under kermor, the special points the edges name with no declaration: graphviz's implicit default nodes, in edge
 * order. @see ClusterDotStringKermor.java:69-165
 */
export function implicitSpecialPoints(edges: readonly EndedEdge[]): DotInputNode[] {
  const ids = new Set(
    edges.flatMap((e) => [
      ...(e.tailCluster === undefined ? [] : [e.startUid]),
      ...(e.headCluster === undefined ? [] : [e.endUid]),
    ]),
  );
  return [...ids].map((id) => ({ id, width: 0, height: 0, implicit: true as const }));
}
